"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { requireUser } from "@/lib/auth";
import { createBillplzBill } from "@/lib/billplz";
import { feeForPercent, PAYMENT_MILESTONES } from "@/lib/billing";
import { canGenerateInvoice } from "@/lib/workflow";
import { buildProjectDocVars, generateInvoiceFile } from "@/lib/documents/generate";
import type { PaymentMilestoneKey } from "@/types";
import {
  createDocument,
  getInvoice,
  getProjectDetail,
  listInvoicesByProject,
  updateInvoice,
  updateProject,
  updateStage,
  upsertInvoice,
} from "@/lib/db";

function appBaseUrl(headerList: Headers) {
  const envUrl = process.env.APP_BASE_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  return host ? `${proto}://${host}` : "http://localhost:3000";
}

export async function generateInvoiceAction(formData: FormData) {
  const user = await requireUser("CONSULTANT");
  const projectId = String(formData.get("projectId") ?? "");
  const milestoneKey = String(formData.get("milestoneKey") ?? "") as PaymentMilestoneKey;
  const milestone = PAYMENT_MILESTONES.find((m) => m.key === milestoneKey);
  if (!projectId || !milestone) return;

  const project = await getProjectDetail(projectId);
  if (!project) return;
  if (!canGenerateInvoice(milestoneKey, project.invoices)) return;
  if (milestoneKey === "P1_APPOINTMENT" && !project.suratLantikanSigned) return;

  const existing = project.invoices.find((inv) => inv.milestoneKey === milestoneKey);
  if (existing && existing.status !== "DRAFT" && existing.status !== "CANCELLED") return;

  const amount = feeForPercent(project.totalFee, milestone.percent);
  const invoiceNumber = `INV-${project.referenceNo?.replaceAll("/", "") ?? projectId.slice(-6)}-${milestone.sequence}`;
  const vars = buildProjectDocVars(project);
  const file = await generateInvoiceFile(projectId, {
    invoiceNumber,
    vars,
    milestoneLabel: `${milestone.label} (${milestone.malay})`,
    percent: milestone.percent,
    amount,
  });

  await createDocument({
    projectId,
    uploaderId: user.id,
    docType: "INVOICE",
    stageName: milestone.stageName,
    status: "ISSUED",
    fileUrl: file.fileUrl,
    fileName: file.fileName,
    mimeType: file.mimeType,
  });

  const headerList = await headers();
  const base = appBaseUrl(headerList);
  const bill = await createBillplzBill({
    description: `${invoiceNumber} — ${milestone.label}`,
    amountSen: Math.round(amount * 100),
    email: project.homeowner.email,
    name: project.ownerName,
    callbackUrl: `${base}/api/billplz/callback`,
    redirectUrl: `${base}/homeowner/projects/${projectId}?paid=${milestoneKey}`,
    reference: invoiceNumber,
  });

  await upsertInvoice({
    id: existing?.id,
    projectId,
    milestoneKey,
    stageName: milestone.stageName,
    percent: milestone.percent,
    amount,
    status: "PENDING_PAYMENT",
    invoiceNumber,
    billplzBillId: bill.id,
    billplzUrl: bill.url,
  });

  await updateStage(projectId, milestone.stageName, { status: "PAYMENT_PENDING" });
  await updateProject(projectId, { status: "PAYMENT_PENDING" });

  revalidatePath(`/consultant/projects/${projectId}`);
  revalidatePath(`/homeowner/projects/${projectId}`);
}

export async function markInvoicePaidAction(invoiceId: string) {
  await requireUser("CONSULTANT");
  await markInvoicePaidById(invoiceId);
}

export async function markInvoicePaidById(invoiceId: string) {
  const invoice = await getInvoice(invoiceId);
  if (!invoice || invoice.status === "PAID") return;

  await updateInvoice(invoiceId, { status: "PAID", paidAt: new Date() });

  const stageMilestones = PAYMENT_MILESTONES.filter((m) => m.stageName === invoice.stageName);
  const refreshed = await listInvoicesByProject(invoice.projectId);
  const stagePaid = stageMilestones.every((m) =>
    refreshed.some(
      (inv) => inv.milestoneKey === m.key && (inv.id === invoiceId || inv.status === "PAID"),
    ),
  );

  if (stagePaid) {
    await updateStage(invoice.projectId, invoice.stageName, { status: "APPROVED" });
  }

  const unpaid = refreshed.some(
    (inv) => inv.id !== invoiceId && inv.status === "PENDING_PAYMENT",
  );
  await updateProject(invoice.projectId, {
    status: unpaid ? "PAYMENT_PENDING" : "IN_PROGRESS",
  });

  revalidatePath(`/consultant/projects/${invoice.projectId}`);
  revalidatePath(`/homeowner/projects/${invoice.projectId}`);
  revalidatePath("/consultant");
}
