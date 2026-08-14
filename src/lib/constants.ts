import type { ProjectStatus, StageStatus } from "@/types";

export const APP_NAME = "Konsultan.co";
export const CONTRACTOR_RADIUS_KM = 20;
export const SESSION_COOKIE = "konsultan_session";

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  DRAFT: "Draft",
  IN_REVIEW: "In Review",
  IN_ENDORSEMENT: "In Endorsement",
  COMPLETED: "Completed",
};

export const STAGE_STATUS_LABEL: Record<StageStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  REVISION_NEEDED: "Revision Needed",
  APPROVED: "Approved",
};

export const DEMO_ACCOUNTS = [
  {
    email: "ahmad@example.com",
    password: "demo123",
    role: "HOMEOWNER" as const,
    name: "Ahmad Rahman",
  },
  {
    email: "admin@konsultan.co",
    password: "demo123",
    role: "CONSULTANT" as const,
    name: "Nurul Aisyah",
  },
] as const;
