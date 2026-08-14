import type { ProjectStatus, StageName, StageStatus, WorkflowStep } from "@/types";
import { STAGE_ORDER } from "@/types";

export function allStagesApproved(
  stages: { stageName: string; status: string }[],
): boolean {
  return STAGE_ORDER.every((name) =>
    stages.some((s) => s.stageName === name && s.status === "APPROVED"),
  );
}

export function currentWorkflowStep(project: {
  status: string;
  quoteAcknowledged: boolean;
  needsContractor: boolean | null;
  stages: { stageName: string; status: string }[];
}): WorkflowStep {
  if (project.status === "DRAFT") return "SUBMISSION";
  if (project.status === "IN_REVIEW" || !project.quoteAcknowledged) {
    return "CONSULTANT_REVIEW";
  }

  for (const stage of STAGE_ORDER) {
    const record = project.stages.find((s) => s.stageName === stage);
    if (!record || record.status !== "APPROVED") return stage;
  }

  return "CONTRACTOR";
}

export function isEndorsementUnlocked(project: {
  status: string;
  quoteAcknowledged: boolean;
}) {
  return project.status === "IN_ENDORSEMENT" || project.status === "COMPLETED";
}

export function canPromptContractors(project: {
  status: string;
  stages: { stageName: string; status: string }[];
}) {
  return project.status === "COMPLETED" || allStagesApproved(project.stages);
}

export function nextProjectStatusAfterQuoteAck(): ProjectStatus {
  return "IN_ENDORSEMENT";
}

export function stageSequenceIndex(name: StageName) {
  return STAGE_ORDER.indexOf(name);
}

export function isStageActionable(
  stageName: StageName,
  stages: { stageName: string; status: string }[],
) {
  const idx = stageSequenceIndex(stageName);
  if (idx <= 0) return true;
  const previous = STAGE_ORDER[idx - 1];
  const prev = stages.find((s) => s.stageName === previous);
  return prev?.status === "APPROVED";
}

export const STAGE_STATUS_OPTIONS: StageStatus[] = [
  "PENDING",
  "IN_PROGRESS",
  "REVISION_NEEDED",
  "APPROVED",
];
