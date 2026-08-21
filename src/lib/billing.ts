import type { PaymentMilestoneKey, StageName } from "@/types";

export const DEFAULT_TOTAL_FEE = 18900;

export const PAYMENT_MILESTONES: {
  key: PaymentMilestoneKey;
  stageName: StageName;
  percent: number;
  label: string;
  malay: string;
  sequence: number;
}[] = [
  {
    key: "P1_APPOINTMENT",
    stageName: "SCHEMATIC",
    percent: 20,
    label: "Appointment completed",
    malay: "Selesai lantikan",
    sequence: 1,
  },
  {
    key: "P2_DESIGN_APPROVAL",
    stageName: "DESIGN_DEV",
    percent: 15,
    label: "Design approval completed",
    malay: "Selesai kelulusan rekabentuk",
    sequence: 2,
  },
  {
    key: "P2_SUBMISSION",
    stageName: "DESIGN_DEV",
    percent: 15,
    label: "Approval application submitted",
    malay: "Selesai pengemukaan permohonan kelulusan",
    sequence: 3,
  },
  {
    key: "P3_BORANG_B",
    stageName: "CONTRACT_DOC",
    percent: 40,
    label: "Approval & Borang B",
    malay: "Selesai memperolehi kelulusan & pengemukaan Borang B",
    sequence: 4,
  },
  {
    key: "P4_CONSTRUCTION_50",
    stageName: "CONTRACT_IMPL",
    percent: 10,
    label: "Construction 50% complete",
    malay: "Selesai kerja pembinaan (50%)",
    sequence: 5,
  },
];

export function feeForPercent(totalFee: number, percent: number) {
  return Math.round(totalFee * (percent / 100) * 100) / 100;
}

export function milestonesForStage(stageName: StageName) {
  return PAYMENT_MILESTONES.filter((m) => m.stageName === stageName);
}

export function previousMilestone(key: PaymentMilestoneKey) {
  const current = PAYMENT_MILESTONES.find((m) => m.key === key);
  if (!current || current.sequence <= 1) return null;
  return PAYMENT_MILESTONES.find((m) => m.sequence === current.sequence - 1) ?? null;
}

export function formatRm(amount: number) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    minimumFractionDigits: 2,
  }).format(amount);
}
