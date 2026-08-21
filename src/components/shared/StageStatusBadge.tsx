import type { ProjectStatus, StageStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { PROJECT_STATUS_LABEL, STAGE_STATUS_LABEL } from "@/lib/constants";

const stageVariant: Record<StageStatus, "muted" | "info" | "warning" | "success" | "danger"> = {
  DRAFT: "muted",
  PENDING_REVIEW: "warning",
  PENDING_SIGNATURE: "info",
  PAYMENT_PENDING: "danger",
  IN_PROGRESS: "info",
  REVISION_NEEDED: "warning",
  APPROVED: "success",
  COMPLETED: "success",
};

const projectVariant: Record<ProjectStatus, "muted" | "info" | "warning" | "success" | "danger"> = {
  DRAFT: "muted",
  IN_REVIEW: "warning",
  IN_PROGRESS: "info",
  PAYMENT_PENDING: "danger",
  COMPLETED: "success",
};

export function StageStatusBadge({ status }: { status: StageStatus | string }) {
  const key = status as StageStatus;
  return (
    <Badge variant={stageVariant[key] ?? "muted"}>
      {STAGE_STATUS_LABEL[key] ?? status}
    </Badge>
  );
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus | string }) {
  const key = status as ProjectStatus;
  return (
    <Badge variant={projectVariant[key] ?? "muted"}>
      {PROJECT_STATUS_LABEL[key] ?? status}
    </Badge>
  );
}
