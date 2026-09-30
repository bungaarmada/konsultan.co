import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getProjectDetail } from "@/lib/db";
import { ProjectStepper } from "@/components/homeowner/ProjectStepper";
import { CurrentStatusPanel } from "@/components/homeowner/CurrentStatusPanel";
import { DocumentUploadCard } from "@/components/shared/DocumentUploadCard";
import { ProjectStatusBadge } from "@/components/shared/StageStatusBadge";
import { StageAccordion } from "@/components/shared/StageAccordion";
import { ContractorPrompt } from "@/components/homeowner/ContractorPrompt";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { submitProjectAction, uploadInitialDocAction } from "@/app/actions/projects";
import {
  canPromptContractors,
  currentStatusInfo,
  currentWorkflowStep,
  quotationReleased,
} from "@/lib/workflow";
import { formatRm } from "@/lib/billing";
import { confirmReturnedBillplzPayment } from "@/lib/confirm-billplz-payment";
import { formatDateTime } from "@/lib/utils";
import { INITIAL_DOC_TYPES, type ProjectStatus } from "@/types";

function firstQuery(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function milestoneFromQuery(value: string | undefined) {
  if (!value || value === "true" || value === "false") return undefined;
  return value;
}

export default async function HomeownerProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser("HOMEOWNER");
  const { id } = await params;
  const query = await searchParams;
  const error = firstQuery(query.error);
  const paidMilestone = milestoneFromQuery(firstQuery(query.paid));
  const billplzBillId = firstQuery(query["billplz[id]"]) ?? firstQuery(query.id);

  const paymentReturn =
    paidMilestone || billplzBillId
      ? await confirmReturnedBillplzPayment({
          projectId: id,
          billplzBillId,
          milestoneKey: paidMilestone,
        })
      : null;

  const project = await getProjectDetail(id);
  if (!project || project.homeownerId !== user.id) notFound();

  const confirmedInvoice = paymentReturn
    ? project.invoices.find((inv) => inv.id === paymentReturn.invoiceId)
    : null;

  const step = currentWorkflowStep(project);
  const statusInfo = currentStatusInfo(project);
  const showContractorPrompt = canPromptContractors(project);
  const showFee = quotationReleased(project.documents);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Project</p>
          <h1 className="font-heading text-3xl text-primary">{project.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{project.siteAddress}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {project.referenceNo ?? "No reference yet"}
            {showFee ? ` · Fee ${formatRm(project.totalFee)}` : null}
            {project.usesLppsa ? " · LPPSA" : null}
          </p>
        </div>
        <ProjectStatusBadge status={project.status as ProjectStatus} />
      </div>

      {error === "docs" ? (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Upload geran, IC, and site plan before submitting for review.
        </p>
      ) : null}
      {confirmedInvoice?.status === "PAID" ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <p className="font-medium">Payment confirmed</p>
          <p className="mt-1">
            {confirmedInvoice.invoiceNumber} · {formatRm(confirmedInvoice.amount)}
            {confirmedInvoice.paidAt ? ` · ${formatDateTime(confirmedInvoice.paidAt)}` : null}
          </p>
          <p className="mt-1 text-emerald-800">
            This payment is recorded on konsultan.co. Your consultant can see the same paid status.
          </p>
        </div>
      ) : paymentReturn && !paymentReturn.confirmed ? (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Billplz has not confirmed this payment yet. Refresh the page shortly, or contact your consultant
          if the amount was already deducted.
        </p>
      ) : null}

      <Card>
        <CardContent className="pt-6">
          <ProjectStepper current={step} />
        </CardContent>
      </Card>

      {showContractorPrompt ? <ContractorPrompt projectId={project.id} /> : null}
      {project.needsContractor ? (
        <Button asChild variant="brass">
          <Link href={`/homeowner/projects/${project.id}/contractors`}>View nearby contractors</Link>
        </Button>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-6">
          {project.status === "DRAFT" ? (
            <Card>
              <CardHeader>
                <CardTitle>Documents requested</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Your consultant asked you to upload geran, IC, and site plan before this project can
                  move to review.
                </p>
                <div className="grid gap-4 md:grid-cols-3">
                  {INITIAL_DOC_TYPES.map((doc) => {
                    const existing = project.documents.find((item) => item.docType === doc.type);
                    return (
                      <form key={doc.type} action={uploadInitialDocAction} className="space-y-2">
                        <input type="hidden" name="projectId" value={project.id} />
                        <input type="hidden" name="docType" value={doc.type} />
                        <DocumentUploadCard
                          name="file"
                          title={doc.label}
                          subtitle={doc.malay}
                          existing={existing}
                        />
                        <Button type="submit" size="sm" variant="outline" className="w-full">
                          Save file
                        </Button>
                      </form>
                    );
                  })}
                </div>
                <form action={submitProjectAction.bind(null, project.id)}>
                  <Button type="submit">Submit for consultant review</Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div>
              <h2 className="font-heading mb-3 text-xl">Stages</h2>
              <StageAccordion
                role="HOMEOWNER"
                projectId={project.id}
                totalFee={project.totalFee}
                suratSigned={project.suratLantikanSigned}
                stages={project.stages}
                documents={project.documents}
                invoices={project.invoices}
                defaultOpen={typeof step === "string" ? step : undefined}
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              <CurrentStatusPanel
                step={statusInfo.step}
                stageLabel={statusInfo.stageLabel}
                stageMalay={statusInfo.stageMalay}
                status={statusInfo.status}
                remarks={statusInfo.remarks}
              />
            </CardContent>
          </Card>
          {project.status !== "DRAFT" ? (
            <Button asChild variant="outline" className="w-full">
              <Link href={`/homeowner/projects/${project.id}/documents`}>
                View all documents here
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
