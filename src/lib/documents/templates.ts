import { CONSULTANT_COMPANY } from "@/lib/constants";
import { formatRm, PAYMENT_MILESTONES } from "@/lib/billing";

export type ProjectDocVars = {
  referenceNo: string;
  dateLabel: string;
  ownerName: string;
  ownerIc?: string | null;
  ownerContact: string;
  siteAddress: string;
  title: string;
  totalFee: number;
};

function esc(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function letterhead() {
  return `
  <div class="letterhead">
    <div>
      <div class="logo-mark">BA</div>
      <div>
        <p class="company">${esc(CONSULTANT_COMPANY.name)}</p>
        <p class="meta">${esc(CONSULTANT_COMPANY.regNo)}</p>
        <p class="meta">${esc(CONSULTANT_COMPANY.address)}</p>
        <p class="meta">${esc(CONSULTANT_COMPANY.phone)} · ${esc(CONSULTANT_COMPANY.email)}</p>
      </div>
    </div>
  </div>`;
}

function baseStyles() {
  return `
  <style>
    body { font-family: Georgia, "Times New Roman", serif; color: #1c1915; margin: 0; padding: 40px; line-height: 1.5; }
    .letterhead { display: flex; justify-content: space-between; gap: 16px; border-bottom: 2px solid #1f4d45; padding-bottom: 16px; margin-bottom: 24px; }
    .letterhead > div { display: flex; gap: 14px; align-items: flex-start; }
    .logo-mark { width: 52px; height: 52px; border-radius: 999px; background: #1f4d45; color: #f4efe6; display: flex; align-items: center; justify-content: center; font-weight: 700; font-family: Figtree, sans-serif; }
    .company { margin: 0; font-weight: 700; letter-spacing: 0.04em; }
    .meta { margin: 2px 0 0; font-size: 12px; color: #6b6358; font-family: Figtree, sans-serif; }
    h1 { font-size: 18px; margin: 0 0 8px; }
    h2 { font-size: 15px; margin: 24px 0 8px; }
    p { margin: 0 0 10px; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 12px; font-family: Figtree, sans-serif; }
    th, td { border: 1px solid #ddd4c6; padding: 8px; text-align: left; }
    th { background: #efe8dc; }
    .right { text-align: right; }
    .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 48px; }
    .sig-box { min-height: 120px; }
    .sig-line { border-bottom: 1px solid #1c1915; height: 64px; margin-bottom: 8px; }
    .sig-img { max-height: 64px; max-width: 220px; }
    .muted { color: #6b6358; font-size: 12px; }
  </style>`;
}

export function renderQuotationHtml(vars: ProjectDocVars) {
  const rows = PAYMENT_MILESTONES.map((m, index) => {
    const amount = Math.round(vars.totalFee * (m.percent / 100) * 100) / 100;
    const cumulative = PAYMENT_MILESTONES.slice(0, index + 1).reduce(
      (sum, item) => sum + Math.round(vars.totalFee * (item.percent / 100) * 100) / 100,
      0,
    );
    const stageLabel =
      m.stageName === "SCHEMATIC"
        ? "1. Schematic Design Phase"
        : m.stageName === "DESIGN_DEV"
          ? "2. Design Development Phase"
          : m.stageName === "CONTRACT_DOC"
            ? "3. Contract Documentation Phase"
            : "4. Contract Implementation & Management Phase";
    return `<tr>
      <td>${esc(stageLabel)}<br/><span class="muted">${esc(m.malay)}</span></td>
      <td class="right">${m.percent}%</td>
      <td class="right">${formatRm(amount)}</td>
      <td class="right">${formatRm(cumulative)}</td>
    </tr>`;
  }).join("");

  return `<!DOCTYPE html><html lang="ms"><head><meta charset="utf-8" /><title>Quotation ${esc(vars.referenceNo)}</title>${baseStyles()}</head><body>
  ${letterhead()}
  <p class="muted">Ruj. Kami : ${esc(vars.referenceNo)}<br/>Tarikh: ${esc(vars.dateLabel)}</p>
  <p><strong>${esc(vars.ownerName)}</strong><br/>${esc(vars.siteAddress)}<br/>Tel: ${esc(vars.ownerContact)}</p>
  <h1>CADANGAN MEMBINA SATU UNIT RUMAH — ${esc(vars.title)}</h1>
  <p class="muted">Pengemukaan Cadangan Yuran Perunding (Proposed Consultant Fees)</p>

  <h2>1. Skop Perkhidmatan</h2>
  <p><strong>Schematic Design Phase</strong> — analisis tapak, cadangan rekabentuk awal, pra-rundingan PBT.</p>
  <p><strong>Design Development Phase</strong> — lukisan rekabentuk muktamad, lukisan kerja, dan pengemukaan KM/PB.</p>
  <p><strong>Contract Documentation, Implementation & Management</strong> — lukisan asas, pemantauan tapak, pensijilan bayaran interim.</p>

  <h2>2. Jadual Pembayaran</h2>
  <p>Jumlah yuran perunding: <strong>${formatRm(vars.totalFee)}</strong></p>
  <table>
    <thead>
      <tr>
        <th>Peringkat</th>
        <th class="right">Peratus</th>
        <th class="right">Nilai Yuran (RM)</th>
        <th class="right">Yuran Terkumpul (RM)</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <p class="muted">Bayaran kepada ${esc(CONSULTANT_COMPANY.name)} (${esc(CONSULTANT_COMPANY.bankName)}: ${esc(CONSULTANT_COMPANY.bankAccount)}). Yuran tidak termasuk fi permohonan kerajaan/PBT.</p>
  <p>Yang benar,<br/><strong>${esc(CONSULTANT_COMPANY.signatoryName)}</strong><br/>${esc(CONSULTANT_COMPANY.name)}</p>
  </body></html>`;
}

export function renderSuratLantikanHtml(
  vars: ProjectDocVars,
  signatures?: {
    ownerSignatureUrl?: string | null;
    ownerSignedAt?: string | null;
    witnessName?: string | null;
    witnessIc?: string | null;
    witnessTitle?: string | null;
    witnessSignatureUrl?: string | null;
    witnessSignedAt?: string | null;
  },
) {
  const ownerSig = signatures?.ownerSignatureUrl
    ? `<img class="sig-img" src="${signatures.ownerSignatureUrl}" alt="Owner signature" />`
    : `<div class="sig-line"></div>`;
  const witnessSig = signatures?.witnessSignatureUrl
    ? `<img class="sig-img" src="${signatures.witnessSignatureUrl}" alt="Witness signature" />`
    : `<div class="sig-line"></div>`;

  return `<!DOCTYPE html><html lang="ms"><head><meta charset="utf-8" /><title>Surat Lantikan ${esc(vars.referenceNo)}</title>${baseStyles()}</head><body>
  <p class="muted">Ruj. Kami : ${esc(vars.referenceNo)}<br/>Tarikh: ${esc(vars.dateLabel)}</p>
  <p><strong>${esc(CONSULTANT_COMPANY.name)}</strong><br/>${esc(CONSULTANT_COMPANY.address)}</p>
  <p>Tuan/Puan,</p>
  <h1>CADANGAN MEMBINA SATU UNIT RUMAH DI ${esc(vars.siteAddress.toUpperCase())}</h1>
  <p><strong>UNTUK: ${esc(vars.ownerName)}</strong></p>
  <p class="muted">- Pengiktirafan Dan Persetujuan Perjanjian Serta Lantikan -</p>
  <p>
    Saya <strong>${esc(vars.ownerName)}${vars.ownerIc ? ` (${esc(vars.ownerIc)})` : " ..................................... (Nama dan NO IC)"}</strong>
    sebagai pemilik tanah dan bangunan yang berkenaan, dengan ini mengesahkan bahawa saya mempunyai kuasa untuk menandatangani lukisan dan dokumen,
    bersetuju dengan terma dalam surat rujukan ${esc(vars.referenceNo)}, dan melantik
    <strong>${esc(CONSULTANT_COMPANY.name)}</strong> untuk menyediakan perkhidmatan perunding profesional bagi projek ini.
  </p>
  <div class="sig-grid">
    <div class="sig-box">
      <p><strong>Pemilik:</strong></p>
      ${ownerSig}
      <p class="muted">(Tandatangan)</p>
      <p>Tarikh : ${esc(signatures?.ownerSignedAt ?? "____________________")}</p>
    </div>
    <div class="sig-box">
      <p><strong>Dengan berhadapan: Saksi:</strong></p>
      ${witnessSig}
      <p>Nama : ${esc(signatures?.witnessName ?? "____________________")}</p>
      <p>No. I/C : ${esc(signatures?.witnessIc ?? "____________________")}</p>
      <p>Jawatan : ${esc(signatures?.witnessTitle ?? "____________________")}</p>
      <p>Tarikh : ${esc(signatures?.witnessSignedAt ?? "____________________")}</p>
    </div>
  </div>
  </body></html>`;
}

export function renderInvoiceHtml(input: {
  invoiceNumber: string;
  dateLabel: string;
  vars: ProjectDocVars;
  milestoneLabel: string;
  percent: number;
  amount: number;
}) {
  return `<!DOCTYPE html><html lang="ms"><head><meta charset="utf-8" /><title>Invoice ${esc(input.invoiceNumber)}</title>${baseStyles()}</head><body>
  ${letterhead()}
  <p class="muted">Invoice No: ${esc(input.invoiceNumber)}<br/>Tarikh: ${esc(input.dateLabel)}<br/>Ruj: ${esc(input.vars.referenceNo)}</p>
  <p><strong>Bil kepada:</strong><br/>${esc(input.vars.ownerName)}<br/>${esc(input.vars.siteAddress)}<br/>${esc(input.vars.ownerContact)}</p>
  <h1>INVOIS YURAN PERUNDING</h1>
  <table>
    <thead><tr><th>Perihal</th><th class="right">Peratus</th><th class="right">Jumlah (RM)</th></tr></thead>
    <tbody>
      <tr>
        <td>${esc(input.milestoneLabel)} — ${esc(input.vars.title)}</td>
        <td class="right">${input.percent}%</td>
        <td class="right">${formatRm(input.amount)}</td>
      </tr>
    </tbody>
  </table>
  <p><strong>Jumlah perlu dibayar: ${formatRm(input.amount)}</strong></p>
  <p class="muted">Bayaran melalui Billplz atau terus ke ${esc(CONSULTANT_COMPANY.bankName)} ${esc(CONSULTANT_COMPANY.bankAccount)} (${esc(CONSULTANT_COMPANY.name)}).</p>
  </body></html>`;
}
