const BILLPLZ_API = process.env.BILLPLZ_API_BASE ?? "https://www.billplz-sandbox.com/api";

export type BillplzBill = {
  id: string;
  url: string;
  paid: boolean;
};

function authHeader() {
  const key = process.env.BILLPLZ_API_KEY;
  if (!key) return null;
  const token = Buffer.from(`${key}:`).toString("base64");
  return `Basic ${token}`;
}

export function billplzConfigured() {
  return Boolean(process.env.BILLPLZ_API_KEY && process.env.BILLPLZ_COLLECTION_ID);
}

export async function createBillplzBill(input: {
  description: string;
  amountSen: number;
  email: string;
  name: string;
  callbackUrl: string;
  redirectUrl: string;
  reference: string;
}): Promise<BillplzBill> {
  const auth = authHeader();
  const collectionId = process.env.BILLPLZ_COLLECTION_ID;

  if (!auth || !collectionId) {
    const mockId = `mock_${input.reference}_${Date.now()}`;
    return {
      id: mockId,
      url: `${input.redirectUrl}${input.redirectUrl.includes("?") ? "&" : "?"}mockBill=${mockId}&paid=1`,
      paid: false,
    };
  }

  const body = new URLSearchParams({
    collection_id: collectionId,
    description: input.description.slice(0, 200),
    email: input.email,
    name: input.name,
    amount: String(Math.round(input.amountSen)),
    callback_url: input.callbackUrl,
    redirect_url: input.redirectUrl,
    reference_1_label: "Invoice",
    reference_1: input.reference,
  });

  const response = await fetch(`${BILLPLZ_API}/v3/bills`, {
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Billplz error: ${response.status} ${text}`);
  }

  const data = (await response.json()) as { id: string; url: string; paid: boolean };
  return { id: data.id, url: data.url, paid: Boolean(data.paid) };
}
