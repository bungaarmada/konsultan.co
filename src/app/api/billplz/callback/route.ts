import { NextRequest, NextResponse } from "next/server";
import { markInvoicePaidById } from "@/app/actions/invoices";
import { getInvoiceByBillplzId } from "@/lib/db";

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

  if (!billId || !paid) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const invoice = await getInvoiceByBillplzId(billId);
  if (invoice) {
    await markInvoicePaidById(invoice.id);
  }

  return NextResponse.json({ ok: true });
}

export async function GET(request: NextRequest) {
  const billId = request.nextUrl.searchParams.get("billplz[id]") ?? request.nextUrl.searchParams.get("id");
  const paid = request.nextUrl.searchParams.get("billplz[paid]") ?? request.nextUrl.searchParams.get("paid");
  if (billId && paid === "true") {
    const invoice = await getInvoiceByBillplzId(billId);
    if (invoice) await markInvoicePaidById(invoice.id);
  }
  return NextResponse.json({ ok: true });
}
