"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { markInvoicePaidById } from "@/app/actions/invoices";
import { getInvoice, getProject } from "@/lib/db";

export async function startInvoicePaymentAction(invoiceId: string) {
  const user = await requireUser("HOMEOWNER");
  const invoice = await getInvoice(invoiceId);
  if (!invoice?.billplzUrl) return;

  const project = await getProject(invoice.projectId);
  if (!project || project.homeownerId !== user.id) return;

  if (invoice.billplzBillId?.startsWith("mock_")) {
    await markInvoicePaidById(invoice.id);
    redirect(`/homeowner/projects/${invoice.projectId}?paid=${invoice.milestoneKey}`);
  }

  redirect(invoice.billplzUrl);
}
