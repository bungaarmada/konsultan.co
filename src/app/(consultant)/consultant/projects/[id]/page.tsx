import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getProjectDetail } from "@/lib/db";
import { DocumentList } from "@/components/shared/DocumentList";
import { ProjectTimeline } from "@/components/shared/ProjectTimeline";
import { ProjectStatusBadge } from "@/components/shared/StageStatusBadge";
import { StageAccordion } from "@/components/shared/StageAccordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { currentWorkflowStep } from "@/lib/workflow";
import { formatRm } from "@/lib/billing";
import { submitProjectAction, updateProjectFeeAction } from "@/app/actions/projects";
import type { ProjectStatus } from "@/types";

export default async function ConsultantProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireUser("CONSULTANT");
  const { id } = await params;
  const { error } = await searchParams;
  const project = await getProjectDetail(id);
  if (!project) notFound();

  const initial = project.documents.filter((d) =>
    ["INITIAL_GERAN", "INITIAL_IC", "INITIAL_SITE_PLAN"].includes(d.docType),
  );
  const step = currentWorkflowStep(project);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {project.homeowner.name} · {project.homeowner.email}
          </p>
          <h1 className="font-heading text-3xl text-primary">{project.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{project.siteAddress}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {project.referenceNo ?? "No reference"} · {formatRm(project.totalFee)}
          </p>
        </div>
        <ProjectStatusBadge status={project.status as ProjectStatus} />
      </div>

      {error === "docs" ? (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Intake documents are incomplete.
        </p>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submitted intake</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <DocumentList documents={initial} />
              {project.status === "DRAFT" ? (
                <form action={submitProjectAction.bind(null, project.id)}>
                  <Button type="submit">Move to review</Button>
                </form>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fee schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={updateProjectFeeAction} className="flex flex-wrap items-end gap-3">
                <input type="hidden" name="projectId" value={project.id} />
                <div className="space-y-1">
                  <Label htmlFor="totalFee">Total fee (RM)</Label>
                  <Input
                    id="totalFee"
                    name="totalFee"
                    type="number"
                    min={1}
                    step="0.01"
                    defaultValue={project.totalFee}
                  />
                </div>
                <Button type="submit" variant="outline">
                  Update fee
                </Button>
              </form>
              <p className="mt-2 text-xs text-muted-foreground">
                Percentages stay fixed across five billing milestones (Phase 2 has two invoices).
              </p>
            </CardContent>
          </Card>

          <div>
            <h2 className="font-heading mb-4 text-xl">Peringkat / Stages</h2>
            <StageAccordion
              role="CONSULTANT"
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
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectTimeline current={step} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Owner</CardTitle>
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
