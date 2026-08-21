export type UserRole = "HOMEOWNER" | "CONSULTANT";

export type ProjectStatus =
  | "DRAFT"
  | "IN_REVIEW"
  | "IN_PROGRESS"
  | "PAYMENT_PENDING"
  | "COMPLETED";

export type DocType =
  | "INITIAL_GERAN"
  | "INITIAL_IC"
  | "INITIAL_SITE_PLAN"
  | "QUOTATION"
  | "SURAT_LANTIKAN"
  | "INVOICE"
  | "FINAL_DESIGN_DRAWING"
  | "BORANG_B"
  | "CCC";

export type StageName =
  | "SCHEMATIC"
  | "DESIGN_DEV"
  | "CONTRACT_DOC"
  | "CONTRACT_IMPL";

export type StageStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "PENDING_SIGNATURE"
  | "PAYMENT_PENDING"
  | "IN_PROGRESS"
  | "REVISION_NEEDED"
  | "APPROVED"
  | "COMPLETED";

export type InvoiceStatus = "DRAFT" | "ISSUED" | "PENDING_PAYMENT" | "PAID" | "CANCELLED";

export type PaymentMilestoneKey =
  | "P1_APPOINTMENT"
  | "P2_DESIGN_APPROVAL"
  | "P2_SUBMISSION"
  | "P3_BORANG_B"
  | "P4_CONSTRUCTION_50";

export type WorkflowStep =
  | "SUBMISSION"
  | "CONSULTANT_REVIEW"
  | "SCHEMATIC"
  | "DESIGN_DEV"
  | "CONTRACT_DOC"
  | "CONTRACT_IMPL"
  | "CONTRACTOR";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string | null;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ContractorWithDistance {
  id: string;
  companyName: string;
  regNumber: string;
  phone: string;
  email: string;
  address: string;
  latitude: number;
  longitude: number;
  coverageRadiusKm: number;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  badge: string | null;
  specialties: string | null;
  distanceKm: number;
}

export const STAGE_ORDER: StageName[] = [
  "SCHEMATIC",
  "DESIGN_DEV",
  "CONTRACT_DOC",
  "CONTRACT_IMPL",
];

export const WORKFLOW_STEPS: { key: WorkflowStep; label: string; malay: string }[] = [
  { key: "SUBMISSION", label: "Submission", malay: "Penyerahan" },
  { key: "CONSULTANT_REVIEW", label: "Consultant Review", malay: "Semakan Konsultan" },
  { key: "SCHEMATIC", label: "Schematic Design", malay: "Rekabentuk Skematik" },
  { key: "DESIGN_DEV", label: "Design Development", malay: "Pembangunan Rekabentuk" },
  { key: "CONTRACT_DOC", label: "Contract Documentation", malay: "Dokumentasi Kontrak" },
  { key: "CONTRACT_IMPL", label: "Contract Implementation", malay: "Pelaksanaan Kontrak" },
  { key: "CONTRACTOR", label: "Contractor", malay: "Kontraktor" },
];

export const INITIAL_DOC_TYPES: { type: DocType; label: string; malay: string }[] = [
  { type: "INITIAL_GERAN", label: "Land Title", malay: "Geran Tanah" },
  { type: "INITIAL_IC", label: "Identification Copy", malay: "Salinan IC" },
  { type: "INITIAL_SITE_PLAN", label: "Site Plan", malay: "Pelan Tapak" },
];

export const STAGE_DOC_TYPE: Record<StageName, DocType | DocType[]> = {
  SCHEMATIC: ["QUOTATION", "SURAT_LANTIKAN", "INVOICE"],
  DESIGN_DEV: "FINAL_DESIGN_DRAWING",
  CONTRACT_DOC: "BORANG_B",
  CONTRACT_IMPL: "CCC",
};

export const STAGE_META: Record<
  StageName,
  { label: string; full: string; description: string; malay: string }
> = {
  SCHEMATIC: {
    label: "Peringkat 1",
    full: "Schematic Design Phase",
    malay: "Fasa Rekabentuk Skematik",
    description:
      "Site analysis, preliminary design, Surat Lantikan, Quotation, and appointment invoice.",
  },
  DESIGN_DEV: {
    label: "Peringkat 2",
    full: "Design Development Phase",
    malay: "Fasa Pembangunan Rekabentuk",
    description:
      "Final design drawings, working drawings, and PBT submission (two milestone invoices).",
  },
  CONTRACT_DOC: {
    label: "Peringkat 3",
    full: "Contract Documentation Phase",
    malay: "Fasa Dokumentasi Kontrak",
    description: "Authority approval, Borang B, homeowner signature, and contractor preference.",
  },
  CONTRACT_IMPL: {
    label: "Peringkat 4",
    full: "Contract Implementation & Management Phase",
    malay: "Fasa Pelaksanaan & Pengurusan Kontrak",
    description: "Site supervision milestones and CCC at 50% construction completion.",
  },
};
