import type {
  PaymentMilestoneKey,
  ProjectStatus,
  StageName,
  StageStatus,
  WorkflowStep,
} from "@/types";
import { STAGE_ORDER } from "@/types";
import { milestonesForStage, PAYMENT_MILESTONES, previousMilestone } from "@/lib/billing";

export function allStagesApproved(
  stages: { stageName: string; status: string }[],
): boolean {
  return STAGE_ORDER.every((name) =>
    stages.some(
      (s) =>
        s.stageName === name && (s.status === "APPROVED" || s.status === "COMPLETED"),
    ),
  );
}

export function stageIsDone(status: string) {
  return status === "APPROVED" || status === "COMPLETED";
}

export function currentWorkflowStep(project: {
  status: string;
  suratLantikanSigned?: boolean;
  quoteAcknowledged: boolean;
  needsContractor: boolean | null;
  stages: { stageName: string; status: string }[];
}): WorkflowStep {
  if (project.status === "DRAFT") return "SUBMISSION";
  if (project.status === "IN_REVIEW" && !project.suratLantikanSigned && !project.quoteAcknowledged) {
    return "CONSULTANT_REVIEW";
  }

  for (const stage of STAGE_ORDER) {
    const record = project.stages.find((s) => s.stageName === stage);
    if (!record || !stageIsDone(record.status)) return stage;
  }

  return "CONTRACTOR";
}

export function canPromptContractors(project: {
  stages: { stageName: string; status: string }[];
  invoices?: { milestoneKey: string; status: string; stageName: string }[];
  needsContractor: boolean | null;
}) {
  if (project.needsContractor !== null) return false;
  return isStageActionable("CONTRACT_DOC", project.stages, project.invoices ?? []);
}

export function stageSequenceIndex(name: StageName) {
  return STAGE_ORDER.indexOf(name);
}

/** Previous stage must be approved/completed before this stage is actionable. */
export function isStageActionable(
  stageName: StageName,
  stages: { stageName: string; status: string }[],
  invoices: { milestoneKey: string; status: string; stageName: string }[] = [],
) {
  const idx = stageSequenceIndex(stageName);
  if (idx < 0) return false;

  if (idx > 0) {
    const previous = STAGE_ORDER[idx - 1];
    const prev = stages.find((s) => s.stageName === previous);
    if (!prev || !stageIsDone(prev.status)) return false;

    const prevMilestones = milestonesForStage(previous);
    const allPrevPaid = prevMilestones.every((m) =>
      invoices.some((inv) => inv.milestoneKey === m.key && inv.status === "PAID"),
    );
    if (!allPrevPaid) return false;
  }

  return true;
}

/** Next milestone can be generated only if the previous billing milestone is paid (or none). */
export function canGenerateInvoice(
  milestoneKey: PaymentMilestoneKey,
  invoices: { milestoneKey: string; status: string }[],
) {
  const prev = previousMilestone(milestoneKey);
  if (!prev) return true;
  return invoices.some((inv) => inv.milestoneKey === prev.key && inv.status === "PAID");
}

export function unpaidBlockingInvoice(
  stageName: StageName,
  invoices: { milestoneKey: string; status: string; stageName: string }[],
) {
  const milestones = milestonesForStage(stageName);
  return (
    milestones.find((m) => {
      const inv = invoices.find((i) => i.milestoneKey === m.key);
      return inv && inv.status !== "PAID" && inv.status !== "DRAFT";
    }) ?? null
  );
}

export function nextOpenMilestone(
  invoices: { milestoneKey: string; status: string }[],
): PaymentMilestoneKey | null {
  for (const m of PAYMENT_MILESTONES) {
    const inv = invoices.find((i) => i.milestoneKey === m.key);
    if (!inv || inv.status !== "PAID") return m.key;
  }
  return null;
}

export const STAGE_STATUS_OPTIONS: StageStatus[] = [
  "DRAFT",
  "PENDING_REVIEW",
  "PENDING_SIGNATURE",
  "PAYMENT_PENDING",
  "IN_PROGRESS",
  "REVISION_NEEDED",
  "APPROVED",
  "COMPLETED",
];

export function projectStatusAfterStageUpdate(
  stages: { stageName: string; status: string }[],
): ProjectStatus {
  if (allStagesApproved(stages)) return "COMPLETED";
  if (stages.some((s) => s.status === "PAYMENT_PENDING")) return "PAYMENT_PENDING";
  return "IN_PROGRESS";
}
