import { StageStatusBadge } from "@/components/shared/StageStatusBadge";
import type { StageStatus, WorkflowStep } from "@/types";

export function CurrentStatusPanel({
  stageLabel,
  stageMalay,
  status,
  remarks,
}: {
  step: WorkflowStep;
  stageLabel: string;
  stageMalay: string;
  status: StageStatus | string;
  remarks: string | null;
}) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Active stage</p>
        <p className="mt-1 font-heading text-base text-primary">{stageLabel}</p>
        {stageMalay ? <p className="text-xs text-muted-foreground">{stageMalay}</p> : null}
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">Status</p>
        <StageStatusBadge status={status} />
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
          Consultant remarks
        </p>
        {remarks ? (
          <p className="rounded-md bg-muted/50 px-3 py-2 text-sm leading-relaxed">{remarks}</p>
        ) : (
          <p className="text-sm text-muted-foreground">No remarks yet.</p>
        )}
      </div>
    </div>
  );
}
