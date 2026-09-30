"use client";

import { Check } from "lucide-react";
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
import { documentsForStage } from "@/lib/stage-documents";
import { canGenerateInvoice, isStageActionable, stageIsDone, STAGE_STATUS_OPTIONS } from "@/lib/workflow";
import { INVOICE_STATUS_LABEL, STAGE_STATUS_SELECT_LABEL } from "@/lib/constants";
import { cn, formatDateTime } from "@/lib/utils";
import { generateAppointmentDocsAction, requestSignatureAction, updateStageAction } from "@/app/actions/consultant";
import { generateInvoiceAction, markInvoicePaidAction } from "@/app/actions/invoices";
import { uploadSignedBorangBAction } from "@/app/actions/projects";
import { signSuratLantikanAction } from "@/app/actions/signatures";
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
  paidAt?: Date | null;
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
        const done = stageIsDone(status);
        const actionable = isStageActionable(stageName, stages, invoices);
        const stageDocs = documentsForStage(stageName, documents);
        const stageInvoices = invoices.filter((inv) => inv.stageName === stageName);
        const milestones = milestonesForStage(stageName);

        return (
          <AccordionItem key={stageName} value={stageName}>
            <AccordionTrigger>
              <div className="flex flex-1 flex-wrap items-center gap-3 pr-2">
                <div className="min-w-0 flex-1 text-left">
                  <p className="font-heading text-base">{meta.label}</p>
                  <p className="text-xs font-normal text-muted-foreground">{meta.full}</p>
                </div>
                <StageStatusBadge status={status} />
                <span
                  className={cn(
                    "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                    done
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-muted text-muted-foreground",
                  )}
                  aria-label={done ? "Complete" : "Incomplete"}
                >
                  {done ? <Check className="h-4 w-4" /> : null}
                </span>
                {!actionable ? (
                  <span className="text-xs font-normal text-amber-700">Locked until previous stage clear</span>
                ) : null}
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-5">
              <ol className="list-decimal space-y-1.5 pl-5 text-sm text-muted-foreground">
                {meta.descriptionItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>

              <div>
                <h4 className="mb-2 text-sm font-semibold">Documents</h4>
                {stageDocs.length ? (
                  <DocumentList documents={stageDocs} />
                ) : (
                  <p className="text-sm text-muted-foreground">No documents yet for this stage.</p>
                )}
              </div>

              <div>
                <h4 className="mb-2 text-sm font-semibold">Payments</h4>
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
                          <span className="text-right text-xs text-muted-foreground">
                            {inv ? INVOICE_STATUS_LABEL[inv.status as keyof typeof INVOICE_STATUS_LABEL] ?? inv.status : "Not generated"}
                            {inv?.status === "PAID" && inv.paidAt ? (
                              <span className="mt-0.5 block text-emerald-700">
                                Confirmed {formatDateTime(inv.paidAt)}
                              </span>
                            ) : null}
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
                <UploadSignedBorangPanel projectId={projectId} documents={documents} />
              ) : null}

              {role === "CONSULTANT" && stageName === "CONTRACT_DOC" ? (
                <BorangBConsultantStatus documents={documents} />
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
        Review the letter, then sign as owner and complete witness details. Signatures are stamped onto the document.
      </p>
      <Button asChild variant="outline" size="sm">
        <a href={surat.fileUrl} target="_blank" rel="noreferrer">
          Open draft letter
        </a>
      </Button>
      <SignaturePad name="ownerSignatureDataUrl" label="Owner signature" />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1">
          <Label htmlFor="witnessName">Witness name</Label>
          <Input id="witnessName" name="witnessName" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="witnessIc">Witness IC</Label>
          <Input id="witnessIc" name="witnessIc" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="witnessTitle">Title</Label>
          <Input id="witnessTitle" name="witnessTitle" />
        </div>
      </div>
      <SignaturePad name="witnessSignatureDataUrl" label="Witness signature" />
      <Button type="submit">Sign and submit</Button>
    </form>
  );
}

function UploadSignedBorangPanel({
  projectId,
  documents,
}: {
  projectId: string;
  documents: DocRow[];
}) {
  const borangDocs = documents
    .filter((d) => d.docType === "BORANG_B")
    .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
  const draft = borangDocs.find((d) => d.status === "PENDING_SIGNATURE");
  const signed = borangDocs.find((d) => d.status === "SIGNED");

  if (!draft && !signed) {
    return (
      <p className="text-sm text-muted-foreground">
        Waiting for your consultant to upload Borang B for signing.
      </p>
    );
  }

  if (!draft && signed) {
    return (
      <div className="space-y-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
        <p className="font-medium">Signed Borang B submitted</p>
        <p className="text-emerald-800">
          Your consultant will review the signed copy. You can open it again below if needed.
        </p>
        <Button asChild variant="outline" size="sm">
          <a href={signed.fileUrl} target="_blank" rel="noreferrer">
            Open signed Borang B
          </a>
        </Button>
      </div>
    );
  }

  if (!draft) return null;

  return (
    <form action={uploadSignedBorangBAction} className="space-y-4 rounded-lg border border-border p-4">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="draftDocumentId" value={draft.id} />
      <h4 className="font-heading text-sm font-semibold">Sign and return Borang B</h4>
      <ol className="list-decimal space-y-1 pl-5 text-xs text-muted-foreground">
        <li>Download or open the draft Borang B from your consultant.</li>
        <li>Sign it manually (print, wet sign, or sign in your PDF app).</li>
        <li>Scan or save as PDF, then upload the signed copy here.</li>
      </ol>
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <a href={draft.fileUrl} target="_blank" rel="noreferrer">
            Open draft Borang B
          </a>
        </Button>
        <Button asChild variant="ghost" size="sm">
          <a href={draft.fileUrl} download={draft.fileName}>
            Download draft
          </a>
        </Button>
      </div>
      <DocumentUploadCard
        name="file"
        title="Signed Borang B"
        subtitle="Upload the signed PDF or scan"
        required
        accept=".pdf,.png,.jpg,.jpeg,image/*"
      />
      <Button type="submit">Submit signed copy</Button>
    </form>
  );
}

function BorangBConsultantStatus({ documents }: { documents: DocRow[] }) {
  const borangDocs = documents.filter((d) => d.docType === "BORANG_B");
  const awaiting = borangDocs.some((d) => d.status === "PENDING_SIGNATURE");
  const signed = borangDocs.find((d) => d.status === "SIGNED");

  if (!borangDocs.length) return null;

  if (awaiting && !signed) {
    return (
      <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
        Borang B sent to homeowner — waiting for them to upload the manually signed copy.
      </p>
    );
  }

  if (signed) {
    return (
      <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
        Signed Borang B received. Review the signed file in Documents above, then update the stage
        status.
      </p>
    );
  }

  return null;
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
              {STAGE_STATUS_SELECT_LABEL[option]}
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
