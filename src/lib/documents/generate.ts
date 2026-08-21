import { saveBufferFile } from "@/lib/uploads";
import {
  renderInvoiceHtml,
  renderQuotationHtml,
  renderSuratLantikanHtml,
  type ProjectDocVars,
} from "@/lib/documents/templates";

function dateLabel(date = new Date()) {
  return date.toLocaleDateString("ms-MY", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function buildProjectDocVars(project: {
  referenceNo: string | null;
  ownerName: string;
  ownerIc: string | null;
  ownerContact: string;
  siteAddress: string;
  title: string;
  totalFee: number;
  createdAt?: Date;
}): ProjectDocVars {
  return {
    referenceNo: project.referenceNo ?? `BAR/CS/${new Date().getFullYear()}/TEMP`,
    dateLabel: dateLabel(project.createdAt),
    ownerName: project.ownerName,
    ownerIc: project.ownerIc,
    ownerContact: project.ownerContact,
    siteAddress: project.siteAddress,
    title: project.title,
    totalFee: project.totalFee,
  };
}

export async function generateQuotationFile(projectId: string, vars: ProjectDocVars) {
  const html = renderQuotationHtml(vars);
  return saveBufferFile(
    Buffer.from(html, "utf8"),
    projectId,
    `Quotation-${vars.referenceNo.replaceAll("/", "-")}.html`,
    "text/html",
  );
}

export async function generateSuratLantikanFile(
  projectId: string,
  vars: ProjectDocVars,
  signatures?: Parameters<typeof renderSuratLantikanHtml>[1],
) {
  const html = renderSuratLantikanHtml(vars, signatures);
  return saveBufferFile(
    Buffer.from(html, "utf8"),
    projectId,
    `Surat-Lantikan-${vars.referenceNo.replaceAll("/", "-")}.html`,
    "text/html",
  );
}

export async function generateInvoiceFile(
  projectId: string,
  input: {
    invoiceNumber: string;
    vars: ProjectDocVars;
    milestoneLabel: string;
    percent: number;
    amount: number;
  },
) {
  const html = renderInvoiceHtml({
    ...input,
    dateLabel: dateLabel(),
  });
  return saveBufferFile(
    Buffer.from(html, "utf8"),
    projectId,
    `Invoice-${input.invoiceNumber}.html`,
    "text/html",
  );
}

export function makeReferenceNo(ownerName: string) {
  const slug = ownerName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 12);
  const year = new Date().getFullYear();
  const seq = String(Date.now()).slice(-4);
  return `BAR/CS02/${year}/${slug || "PROJECT"}/${seq}`;
}
