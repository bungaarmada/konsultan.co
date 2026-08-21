import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getProjectDetail } from "@/lib/db";
import { ProjectStepper } from "@/components/homeowner/ProjectStepper";
import { ProjectTimeline } from "@/components/shared/ProjectTimeline";
import { DocumentList } from "@/components/shared/DocumentList";
import { DocumentUploadCard } from "@/components/shared/DocumentUploadCard";
import { ProjectStatusBadge } from "@/components/shared/StageStatusBadge";
import { StageAccordion } from "@/components/shared/StageAccordion";
import { ContractorPrompt } from "@/components/homeowner/ContractorPrompt";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { submitProjectAction, uploadInitialDocAction } from "@/app/actions/projects";
import { canPromptContractors, currentWorkflowStep } from "@/lib/workflow";
import { formatRm } from "@/lib/billing";
import { INITIAL_DOC_TYPES, type ProjectStatus } from "@/types";

export default async function HomeownerProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; paid?: string }>;
}) {
  const user = await requireUser("HOMEOWNER");
  const { id } = await params;
  const { error, paid } = await searchParams;

  const project = await getProjectDetail(id);
  if (!project || project.homeownerId !== user.id) notFound();

  const step = currentWorkflowStep(project);
  const showContractorPrompt = canPromptContractors(project);
  const initialDocs = project.documents.filter((d) =>
    ["INITIAL_GERAN", "INITIAL_IC", "INITIAL_SITE_PLAN"].includes(d.docType),
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Project</p>
          <h1 className="font-heading text-3xl text-primary">{project.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{project.siteAddress}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {project.referenceNo ?? "No reference yet"} · Fee {formatRm(project.totalFee)}
          </p>
        </div>
        <ProjectStatusBadge status={project.status as ProjectStatus} />
      </div>

      {error === "docs" ? (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Upload geran, IC, and pelan tapak before submitting for review.
        </p>
      ) : null}
      {paid ? (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Payment recorded for milestone {paid}.
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
                <CardTitle>Initial documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
            <Card>
              <CardHeader>
                <CardTitle>Intake documents</CardTitle>
              </CardHeader>
              <CardContent>
                <DocumentList documents={initialDocs} />
              </CardContent>
            </Card>
          )}

          <div>
            <h2 className="font-heading mb-3 text-xl">Peringkat / Stages</h2>
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
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectTimeline current={step} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Site</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              <p>{project.ownerName}</p>
              {project.ownerIc ? <p className="text-muted-foreground">IC {project.ownerIc}</p> : null}
              <p className="text-muted-foreground">{project.ownerContact}</p>
              <p className="text-muted-foreground">
                {project.latitude.toFixed(5)}, {project.longitude.toFixed(5)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
