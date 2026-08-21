"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { StageStatusBadge } from "@/components/shared/StageStatusBadge";
import { DocumentList } from "@/components/shared/DocumentList";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DocumentUploadCard } from "@/components/shared/DocumentUploadCard";
import { SignaturePad } from "@/components/shared/SignaturePad";
import { Input } from "@/components/ui/input";
import { STAGE_META, STAGE_ORDER, type StageName, type StageStatus, type UserRole } from "@/types";
import { formatRm, milestonesForStage } from "@/lib/billing";
import { canGenerateInvoice, isStageActionable, STAGE_STATUS_OPTIONS } from "@/lib/workflow";
import { INVOICE_STATUS_LABEL } from "@/lib/constants";
import { generateAppointmentDocsAction, requestSignatureAction, updateStageAction } from "@/app/actions/consultant";
import { generateInvoiceAction, markInvoicePaidAction } from "@/app/actions/invoices";
import { signBorangBAction, signSuratLantikanAction } from "@/app/actions/signatures";
import { startInvoicePaymentAction } from "@/app/actions/payments";

type DocRow = {
  id: string;
  docType: string;
  fileName: string;
  fileUrl: string;
  status: string;
  stageName: string | null;
  version: number;
  uploadedAt: Date;
};

type InvoiceRow = {
  id: string;
  milestoneKey: string;
  stageName: string;
  percent: number;
  amount: number;
  status: string;
  invoiceNumber: string;
  billplzUrl: string | null;
};

type StageRow = {
  stageName: string;
  status: string;
  remarks: string | null;
  endorsedDocUrl: string | null;
};

export function StageAccordion({
  role,
  projectId,
  totalFee,
  suratSigned,
  stages,
  documents,
  invoices,
  defaultOpen,
}: {
  role: UserRole;
  projectId: string;
  totalFee: number;
  suratSigned: boolean;
  stages: StageRow[];
  documents: DocRow[];
  invoices: InvoiceRow[];
  defaultOpen?: string;
}) {
  return (
    <Accordion type="multiple" defaultValue={defaultOpen ? [defaultOpen] : [STAGE_ORDER[0]]} className="rounded-xl border border-border bg-card px-4">
      {STAGE_ORDER.map((stageName) => {
        const meta = STAGE_META[stageName];
        const stage = stages.find((s) => s.stageName === stageName);
        const status = (stage?.status ?? "DRAFT") as StageStatus;
        const actionable = isStageActionable(stageName, stages, invoices);
        const stageDocs = documents.filter((d) => d.stageName === stageName || belongsToStage(d.docType, stageName));
        const stageInvoices = invoices.filter((inv) => inv.stageName === stageName);
        const milestones = milestonesForStage(stageName);

        return (
          <AccordionItem key={stageName} value={stageName}>
            <AccordionTrigger>
              <div className="flex flex-1 flex-wrap items-center gap-3 pr-2">
                <div>
                  <p className="font-heading text-base">{meta.label} · {meta.full}</p>
                  <p className="text-xs font-normal text-muted-foreground">{meta.malay}</p>
                </div>
                <StageStatusBadge status={status} />
                {!actionable ? (
                  <span className="text-xs font-normal text-amber-700">Locked until previous payments clear</span>
                ) : null}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-5">
              <p className="text-sm text-muted-foreground">{meta.description}</p>

              <div>
                <h4 className="mb-2 text-sm font-semibold">Documents</h4>
                {stageDocs.length ? (
                  <DocumentList documents={stageDocs} />
                ) : (
                  <p className="text-sm text-muted-foreground">No documents yet for this peringkat.</p>
                )}
              </div>

              <div>
                <h4 className="mb-2 text-sm font-semibold">Invoices</h4>
                <div className="space-y-3">
                  {milestones.map((m) => {
                    const inv = stageInvoices.find((i) => i.milestoneKey === m.key);
                    const amount = inv?.amount ?? Math.round(totalFee * (m.percent / 100) * 100) / 100;
                    const canGen =
                      role === "CONSULTANT" &&
                      actionable &&
                      canGenerateInvoice(m.key, invoices) &&
                      (!inv || inv.status === "DRAFT" || inv.status === "CANCELLED") &&
                      (m.key !== "P1_APPOINTMENT" || suratSigned);
                    return (
                      <div key={m.key} className="rounded-lg border border-border p-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium">
                              {m.percent}% · {m.label}
                            </p>
                            <p className="text-xs text-muted-foreground">{m.malay}</p>
                            <p className="mt-1 text-sm">{formatRm(amount)}</p>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {inv ? INVOICE_STATUS_LABEL[inv.status as keyof typeof INVOICE_STATUS_LABEL] ?? inv.status : "Not generated"}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {canGen ? (
                            <form action={generateInvoiceAction}>
                              <input type="hidden" name="projectId" value={projectId} />
                              <input type="hidden" name="milestoneKey" value={m.key} />
                              <Button type="submit" size="sm" variant="brass">
                                Generate Invoice
                              </Button>
                            </form>
                          ) : null}
                          {role === "HOMEOWNER" && inv?.status === "PENDING_PAYMENT" ? (
                            <form action={startInvoicePaymentAction.bind(null, inv.id)}>
                              <Button type="submit" size="sm">
                                Pay with Billplz
                              </Button>
                            </form>
                          ) : null}
                          {role === "CONSULTANT" && inv?.status === "PENDING_PAYMENT" ? (
                            <form action={markInvoicePaidAction.bind(null, inv.id)}>
                              <Button type="submit" size="sm" variant="outline">
                                Mark paid
                              </Button>
                            </form>
                          ) : null}
                          {inv?.billplzUrl && inv.status === "PENDING_PAYMENT" ? (
                            <Button asChild size="sm" variant="ghost">
                              <a href={inv.billplzUrl} target="_blank" rel="noreferrer">
                                Open payment link
                              </a>
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {role === "CONSULTANT" && stageName === "SCHEMATIC" ? (
                <form action={generateAppointmentDocsAction.bind(null, projectId)}>
                  <Button type="submit" disabled={!actionable}>
                    Generate Quotation & Surat Lantikan
                  </Button>
                </form>
              ) : null}

              {role === "HOMEOWNER" && stageName === "SCHEMATIC" && !suratSigned ? (
                <SignSuratPanel projectId={projectId} documents={stageDocs} />
              ) : null}

              {role === "HOMEOWNER" && stageName === "CONTRACT_DOC" ? (
                <SignBorangPanel projectId={projectId} documents={stageDocs} />
              ) : null}

              {role === "CONSULTANT" ? (
                <div className="space-y-3">
                  <ConsultantStageEditor
                    projectId={projectId}
                    stageName={stageName}
                    status={status}
                    remarks={stage?.remarks ?? null}
                    endorsedDocUrl={stage?.endorsedDocUrl ?? null}
                    locked={!actionable}
                    documents={stageDocs}
                  />
                  {stageDocs.find((d) => d.status === "PENDING_REVIEW") ? (
                    <RequestSignatureSection
                      projectId={projectId}
                      documentId={stageDocs.find((d) => d.status === "PENDING_REVIEW")!.id}
                      stageName={stageName}
                    />
                  ) : null}
                </div>
              ) : null}

              {stage?.remarks ? (
                <p className="rounded-md bg-muted/50 px-3 py-2 text-sm">
                  <span className="font-medium">Remarks: </span>
                  {stage.remarks}
                </p>
              ) : null}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

function belongsToStage(docType: string, stageName: StageName) {
  if (stageName === "SCHEMATIC") return ["QUOTATION", "SURAT_LANTIKAN", "INVOICE"].includes(docType);
  if (stageName === "DESIGN_DEV") return docType === "FINAL_DESIGN_DRAWING";
  if (stageName === "CONTRACT_DOC") return docType === "BORANG_B";
  if (stageName === "CONTRACT_IMPL") return docType === "CCC";
  return false;
}

function SignSuratPanel({ projectId, documents }: { projectId: string; documents: DocRow[] }) {
  const surat = documents.find((d) => d.docType === "SURAT_LANTIKAN" && d.status !== "SIGNED");
  if (!surat) {
    return <p className="text-sm text-muted-foreground">Waiting for consultant to generate Surat Lantikan.</p>;
  }
  return (
    <form action={signSuratLantikanAction} className="space-y-4 rounded-lg border border-border p-4">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="documentId" value={surat.id} />
      <h4 className="font-heading text-sm font-semibold">Sign Surat Lantikan</h4>
      <p className="text-xs text-muted-foreground">
        Review the letter, then sign as pemilik and capture saksi details. Signatures are stamped onto the document.
      </p>
      <Button asChild variant="outline" size="sm">
        <a href={surat.fileUrl} target="_blank" rel="noreferrer">
          Open draft letter
        </a>
      </Button>
      <SignaturePad name="ownerSignatureDataUrl" label="Pemilik signature" />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="witnessName">Saksi nama</Label>
          <Input id="witnessName" name="witnessName" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="witnessIc">Saksi IC</Label>
          <Input id="witnessIc" name="witnessIc" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="witnessTitle">Jawatan</Label>
          <Input id="witnessTitle" name="witnessTitle" />
        </div>
      </div>
      <SignaturePad name="witnessSignatureDataUrl" label="Saksi signature" />
      <Button type="submit">Sign and submit</Button>
    </form>
  );
}

function SignBorangPanel({ projectId, documents }: { projectId: string; documents: DocRow[] }) {
  const borang = documents.find((d) => d.docType === "BORANG_B" && d.status === "PENDING_SIGNATURE");
  if (!borang) return null;
  return (
    <form action={signBorangBAction} className="space-y-4 rounded-lg border border-border p-4">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="documentId" value={borang.id} />
      <h4 className="font-heading text-sm font-semibold">Sign Borang B</h4>
      <Button asChild variant="outline" size="sm">
        <a href={borang.fileUrl} target="_blank" rel="noreferrer">
          Open Borang B
        </a>
      </Button>
      <SignaturePad name="ownerSignatureDataUrl" label="Homeowner signature" />
      <Button type="submit">Submit signature</Button>
    </form>
  );
}

function ConsultantStageEditor({
  projectId,
  stageName,
  status,
  remarks,
  endorsedDocUrl,
  locked,
}: {
  projectId: string;
  stageName: StageName;
  status: StageStatus;
  remarks: string | null;
  endorsedDocUrl: string | null;
  locked?: boolean;
  documents: DocRow[];
}) {
  const uploadLabel =
    stageName === "DESIGN_DEV"
      ? "Final design drawings"
      : stageName === "CONTRACT_DOC"
        ? "Borang B (3rd party)"
        : stageName === "CONTRACT_IMPL"
          ? "CCC document"
          : null;

  return (
    <form action={updateStageAction} className="space-y-3 rounded-lg border border-dashed border-border p-4">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="stageName" value={stageName} />
      <div className="space-y-2">
        <Label htmlFor={`status-${stageName}`}>Update status</Label>
        <select
          id={`status-${stageName}`}
          name="status"
          disabled={locked}
          defaultValue={status}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          {STAGE_STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`remarks-${stageName}`}>Remarks</Label>
        <Textarea id={`remarks-${stageName}`} name="remarks" disabled={locked} defaultValue={remarks ?? ""} />
      </div>
      {uploadLabel ? (
        <DocumentUploadCard
          name="endorsedFile"
          title={uploadLabel}
          subtitle="PDF, image, or scan"
          accept=".pdf,.png,.jpg,.jpeg,image/*"
          existing={endorsedDocUrl ? { fileName: "Uploaded document", fileUrl: endorsedDocUrl } : null}
          readOnly={locked}
        />
      ) : null}
      <Button type="submit" disabled={locked}>
        Save stage
      </Button>
    </form>
  );
}

function RequestSignatureSection({
  projectId,
  documentId,
  stageName,
}: {
  projectId: string;
  documentId: string;
  stageName: StageName;
}) {
  return (
    <form action={requestSignatureAction} className="pt-2">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="documentId" value={documentId} />
      <input type="hidden" name="stageName" value={stageName} />
      <Button type="submit" variant="outline" size="sm">
        Request homeowner signature
      </Button>
    </form>
  );
}
