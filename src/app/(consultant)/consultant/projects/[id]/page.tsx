import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getProjectDetail } from "@/lib/db";
import { ProjectStepper } from "@/components/homeowner/ProjectStepper";
import { ProjectStatusBadge } from "@/components/shared/StageStatusBadge";
import { StageAccordion } from "@/components/shared/StageAccordion";
import { ConsultantStageDocUpload } from "@/components/consultant/ConsultantStageDocUpload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { currentWorkflowStep, hasIntakeDocuments } from "@/lib/workflow";
import { formatRm } from "@/lib/billing";
import { INITIAL_DOC_TYPES, type ProjectStatus } from "@/types";

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

  const step = currentWorkflowStep(project);
  const intakeReady = hasIntakeDocuments(project.documents);
  const waitingForIntake = project.status === "DRAFT" && !intakeReady;

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

      {waitingForIntake ? (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Waiting for the homeowner to upload geran, IC, and site plan. Share their portal login if
          they have not signed in yet.
        </p>
      ) : null}

      <Card>
        <CardContent className="pt-6">
          <ProjectStepper current={step} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-6">
          {waitingForIntake ? (
            <Card>
              <CardHeader>
                <CardTitle>Waiting for homeowner documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  This project stays in draft until the client uploads all three intake files.
                </p>
                <ul className="space-y-1">
                  {INITIAL_DOC_TYPES.map((doc) => {
                    const uploaded = project.documents.some((item) => item.docType === doc.type);
                    return (
                      <li key={doc.type} className={uploaded ? "text-emerald-700" : "text-muted-foreground"}>
                        {uploaded ? "Uploaded" : "Requested"} · {doc.label}
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          ) : (
            <div>
              <h2 className="font-heading mb-3 text-xl">Stages</h2>
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
          )}
        </div>

        <div className="space-y-4">
          {waitingForIntake ? null : <ConsultantStageDocUpload projectId={project.id} />}

          <Button asChild variant="outline" className="w-full">
            <Link href={`/consultant/projects/${project.id}/documents`}>
              View submitted documents here
            </Link>
          </Button>

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
              <p className="text-muted-foreground">
                LPPSA: {project.usesLppsa ? "Yes" : "No"}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
