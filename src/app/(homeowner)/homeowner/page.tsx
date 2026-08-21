import Link from "next/link";
import { Plus, MapPin } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { listProjectRows } from "@/lib/db";
import { Button } from "@/components/ui/button";
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
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Homeowner portal</p>
          <h1 className="font-heading text-3xl text-primary">Your projects</h1>
        </div>
        <Button asChild>
          <Link href="/homeowner/projects/new">
            <Plus className="h-4 w-4" />
            New project
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <p className="text-muted-foreground">No projects yet. Submit your first site pack to begin.</p>
            <Button asChild className="mt-4">
              <Link href="/homeowner/projects/new">Create project</Link>
            </Button>
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
                    <div>
                      <p className="font-heading text-lg">{project.title}</p>
                      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {project.siteAddress}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Updated {formatDate(project.updatedAt)} · {approved}/4 endorsements
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
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
