import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProjectStatusBadge } from "@/components/shared/StageStatusBadge";
import { formatDate } from "@/lib/utils";
import type { ProjectStatus } from "@/types";

interface ProjectRow {
  id: string;
  title: string;
  ownerName: string;
  siteAddress: string;
  status: string;
  createdAt: Date;
  homeowner: { name: string; email: string };
  stages: { stageName: string; status: string }[];
}

export function ProjectStatusTable({ projects }: { projects: ProjectRow[] }) {
  if (projects.length === 0) {
    return <p className="p-6 text-sm text-muted-foreground">No projects match this filter.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Project</TableHead>
          <TableHead>Owner</TableHead>
          <TableHead>Site</TableHead>
          <TableHead>Pipeline</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Opened</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => {
          const approved = project.stages.filter(
            (s) => s.status === "APPROVED" || s.status === "COMPLETED",
          ).length;
          return (
            <TableRow key={project.id}>
              <TableCell>
                <Link href={`/consultant/projects/${project.id}`} className="font-medium hover:underline">
                  {project.title}
                </Link>
              </TableCell>
              <TableCell>
                <div>
                  <p>{project.ownerName}</p>
                  <p className="text-xs text-muted-foreground">{project.homeowner.email}</p>
                </div>
              </TableCell>
              <TableCell className="max-w-[220px] truncate text-muted-foreground">
                {project.siteAddress}
              </TableCell>
              <TableCell className="text-xs">{approved}/4 stages</TableCell>
              <TableCell>
                <ProjectStatusBadge status={project.status as ProjectStatus} />
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDate(project.createdAt)}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
