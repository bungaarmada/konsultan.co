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
  | "CCC"
  | "OTHER";

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
  DESIGN_DEV: ["FINAL_DESIGN_DRAWING", "INVOICE"],
  CONTRACT_DOC: ["BORANG_B", "INVOICE"],
  CONTRACT_IMPL: ["CCC", "INVOICE"],
};

export const STAGE_META: Record<
  StageName,
  { label: string; full: string; malay: string; descriptionItems: string[] }
> = {
  SCHEMATIC: {
    label: "Peringkat 1",
    full: "Analisa Tapak & Reka Bentuk Awalan",
    malay: "Analisa tapak, cadangan awalan & pra-rundingan PBT",
    descriptionItems: [
      "Analisa tapak dan keperluan ruang sepertimana kehendak Pihak Klien.",
      "Penyediaan cadangan dan reka bentuk awalan untuk kelulusan pihak Klien.",
      "Pra-rundingan dengan pihak Pihak Berkuasa Tempatan (PBT) berkaitan pematuhan kehendak teknikal dan undang-undang.",
    ],
  },
  DESIGN_DEV: {
    label: "Peringkat 2",
    full: "Lukisan Rekabentuk & Kelulusan",
    malay: "Lukisan muktamad, lukisan kerja & pengemukaan PBT",
    descriptionItems: [
      "Penyediaan Lukisan Rekabentuk (muktamad).",
      "Penyediaan Lukisan Kerja & Pengemukaan Lukisan berserta Dokumen kepada PBT yang berkaitan untuk kelulusan Kebenaran Merancang (KM), Pelan Bangunan (PB) dan Jabatan Teknikal yang terlibat.",
    ],
  },
  CONTRACT_DOC: {
    label: "Peringkat 3",
    full: "Lukisan Pembinaan & Penyeliaan",
    malay: "Lukisan pembinaan, pemantauan tapak & bayaran interim",
    descriptionItems: [
      "Penyediaan Lukisan Pembinaan asas dan Lukisan Perincian asas bagi kegunaan di tapak (2 set).",
      "Pemantauan dan penyeliaan kerja-kerja secara berkala di tapak (sekiranya perlu): semakan kerja-kerja setting-out, struktur utama, dan arkitektural.",
      "Semakan dan pengesahan bayaran interim kepada pihak kontraktor.",
    ],
  },
  CONTRACT_IMPL: {
    label: "Peringkat 4",
    full: "CCC & Penyiapan",
    malay: "CCC & Penyiapan",
    descriptionItems: [
      "Borang CCC (Sijil Siap dan Pematuhan).",
      "Semakan/muat naik dokumen penyiapan dan invois (10%).",
    ],
  },
};

/** Document groups for the homeowner Documents summary (Stage 0 = registration, not a Firestore stage). */
export const DOCUMENT_GROUPS: {
  key: "INTAKE" | StageName;
  label: string;
  malay: string;
  docTypes: DocType[];
}[] = [
  {
    key: "INTAKE",
    label: "Stage 0 · Registration",
    malay: "Pendaftaran",
    docTypes: ["INITIAL_GERAN", "INITIAL_IC", "INITIAL_SITE_PLAN"],
  },
  {
    key: "SCHEMATIC",
    label: "Stage 1 · Site Analysis & Preliminary Design",
    malay: "Analisa tapak, cadangan awalan & pra-rundingan PBT",
    docTypes: ["QUOTATION", "SURAT_LANTIKAN", "INVOICE"],
  },
  {
    key: "DESIGN_DEV",
    label: "Stage 2 · Design Drawings & Approval",
    malay: "Lukisan muktamad, lukisan kerja & pengemukaan PBT",
    docTypes: ["FINAL_DESIGN_DRAWING", "INVOICE"],
  },
  {
    key: "CONTRACT_DOC",
    label: "Stage 3 · Construction Drawings & Supervision",
    malay: "Lukisan pembinaan, pemantauan tapak & bayaran interim",
    docTypes: ["BORANG_B", "INVOICE"],
  },
  {
    key: "CONTRACT_IMPL",
    label: "Stage 4 · CCC & Completion",
    malay: "CCC & Penyiapan",
    docTypes: ["CCC", "INVOICE"],
  },
];
