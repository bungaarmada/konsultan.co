import Link from "next/link";
import { MapPin } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { listProjectRows } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { ProjectStatusBadge } from "@/components/shared/StageStatusBadge";
import { formatDate } from "@/lib/utils";
import { currentWorkflowStep } from "@/lib/workflow";
import { WORKFLOW_STEPS, type ProjectStatus } from "@/types";

export default async function HomeownerDashboard() {
  const user = await requireUser("HOMEOWNER");
  const projects = await listProjectRows({ homeownerId: user.id });

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <h1 className="font-heading text-3xl text-primary">Your projects</h1>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <p className="text-muted-foreground">
              No projects yet. Projects will appear here once your consultant starts one.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {projects.map((project) => {
            const step = currentWorkflowStep(project);
            const label = WORKFLOW_STEPS.find((item) => item.key === step)?.label;
            const approved = project.stages.filter(
              (s) => s.status === "APPROVED" || s.status === "COMPLETED",
            ).length;
            return (
              <Link key={project.id} href={`/homeowner/projects/${project.id}`}>
                <Card className="transition-colors hover:border-primary/40">
                  <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="truncate font-heading text-lg">{project.title}</p>
                      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{project.siteAddress}</span>
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Updated {formatDate(project.updatedAt)} · {approved}/4 stages approved
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <ProjectStatusBadge status={project.status as ProjectStatus} />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
