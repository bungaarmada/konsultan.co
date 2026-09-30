import { markInvoicePaidById } from "@/app/actions/invoices";
import { requireUser } from "@/lib/auth";
import { getBillplzBill } from "@/lib/billplz";
import { getInvoiceByBillplzId, getProjectDetail } from "@/lib/db";

/** After Billplz redirect: confirm via Get Bill API, then mark the invoice paid. */
export async function confirmReturnedBillplzPayment(input: {
  projectId: string;
  billplzBillId?: string | null;
  milestoneKey?: string | null;
}): Promise<{ invoiceId: string; confirmed: boolean } | null> {
  const user = await requireUser("HOMEOWNER");
  const project = await getProjectDetail(input.projectId);
  if (!project || project.homeownerId !== user.id) return null;

  let invoice = input.billplzBillId ? await getInvoiceByBillplzId(input.billplzBillId) : null;
  if (invoice && invoice.projectId !== project.id) invoice = null;

  if (!invoice && input.milestoneKey) {
    invoice = project.invoices.find((inv) => inv.milestoneKey === input.milestoneKey) ?? null;
  }

  if (!invoice?.billplzBillId) return null;
  if (invoice.status === "PAID") return { invoiceId: invoice.id, confirmed: true };
  if (invoice.billplzBillId.startsWith("mock_")) return { invoiceId: invoice.id, confirmed: false };

  const bill = await getBillplzBill(invoice.billplzBillId);
  if (!bill?.paid) return { invoiceId: invoice.id, confirmed: false };

  await markInvoicePaidById(invoice.id, { skipRevalidate: true });
  return { invoiceId: invoice.id, confirmed: true };
}
