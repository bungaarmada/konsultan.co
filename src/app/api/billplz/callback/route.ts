import { NextRequest, NextResponse } from "next/server";
import { markInvoicePaidById } from "@/app/actions/invoices";
import { getBillplzBill } from "@/lib/billplz";
import { getInvoiceByBillplzId } from "@/lib/db";

async function confirmPaidBill(billId: string | null, claimedPaid: boolean) {
  if (!billId || !claimedPaid) return false;
  const invoice = await getInvoiceByBillplzId(billId);
  if (!invoice || invoice.status === "PAID") return Boolean(invoice);

  const bill = await getBillplzBill(billId);
  if (!bill?.paid) return false;

  await markInvoicePaidById(invoice.id);
  return true;
}

export async function POST(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";
  let billId: string | null = null;
  let paid = false;

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as { id?: string; paid?: string | boolean };
    billId = body.id ?? null;
    paid = body.paid === true || body.paid === "true";
  } else {
    const form = await request.formData();
    billId = String(form.get("id") ?? "");
    paid = String(form.get("paid") ?? "") === "true";
  }

  const confirmed = await confirmPaidBill(billId, paid);
  return NextResponse.json({ ok: true, ignored: !confirmed });
}

export async function GET(request: NextRequest) {
  const billId = request.nextUrl.searchParams.get("billplz[id]") ?? request.nextUrl.searchParams.get("id");
  const paid = request.nextUrl.searchParams.get("billplz[paid]") ?? request.nextUrl.searchParams.get("paid");
  const confirmed = await confirmPaidBill(billId, paid === "true");
  return NextResponse.json({ ok: true, ignored: !confirmed });
}
