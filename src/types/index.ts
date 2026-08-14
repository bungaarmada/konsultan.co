export type UserRole = "HOMEOWNER" | "CONSULTANT";

export type ProjectStatus = "DRAFT" | "IN_REVIEW" | "IN_ENDORSEMENT" | "COMPLETED";

export type DocType =
  | "INITIAL_GERAN"
  | "INITIAL_IC"
  | "INITIAL_SITE_PLAN"
  | "QUOTATION"
  | "SURAT_LANTIKAN"
  | "ARKITEK_DRAWING"
  | "CS_PLAN"
  | "MAJLIS_APPROVAL"
  | "PPSA_DOC";

export type StageName = "ARKITEK" | "CS" | "MAJLIS" | "PPSA";

export type StageStatus = "PENDING" | "IN_PROGRESS" | "REVISION_NEEDED" | "APPROVED";

export type WorkflowStep =
  | "SUBMISSION"
  | "CONSULTANT_REVIEW"
  | "ARKITEK"
  | "CS"
  | "MAJLIS"
  | "PPSA"
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

export const STAGE_ORDER: StageName[] = ["ARKITEK", "CS", "MAJLIS", "PPSA"];

export const WORKFLOW_STEPS: { key: WorkflowStep; label: string; malay: string }[] = [
  { key: "SUBMISSION", label: "Submission", malay: "Penyerahan" },
  { key: "CONSULTANT_REVIEW", label: "Consultant Review", malay: "Semakan Konsultan" },
  { key: "ARKITEK", label: "Arkitek", malay: "Lukisan Senibina" },
  { key: "CS", label: "C&S", malay: "Kejuruteraan Awam" },
  { key: "MAJLIS", label: "Majlis", malay: "Kelulusan Pihak Berkuasa" },
  { key: "PPSA", label: "PPSA / Utility", malay: "Utiliti" },
  { key: "CONTRACTOR", label: "Contractor", malay: "Kontraktor" },
];

export const INITIAL_DOC_TYPES: { type: DocType; label: string; malay: string }[] = [
  { type: "INITIAL_GERAN", label: "Land Title", malay: "Geran Tanah" },
  { type: "INITIAL_IC", label: "Identification Copy", malay: "Salinan IC" },
  { type: "INITIAL_SITE_PLAN", label: "Site Plan", malay: "Pelan Tapak" },
];

export const STAGE_DOC_TYPE: Record<StageName, DocType> = {
  ARKITEK: "ARKITEK_DRAWING",
  CS: "CS_PLAN",
  MAJLIS: "MAJLIS_APPROVAL",
  PPSA: "PPSA_DOC",
};

export const STAGE_META: Record<
  StageName,
  { label: string; full: string; description: string }
> = {
  ARKITEK: {
    label: "Arkitek",
    full: "Full Detailed Architectural Drawing",
    description: "Endorsed architectural drawings and building plans.",
  },
  CS: {
    label: "C&S",
    full: "Civil & Structural Engineering",
    description: "Structural calculations, foundation and framing plans.",
  },
  MAJLIS: {
    label: "Majlis",
    full: "Local Council / Authority Approval",
    description: "Local authority (PBT) planning and building approval.",
  },
  PPSA: {
    label: "PPSA / Utility",
    full: "PPSA & Utility Endorsement",
    description: "Utility connections and PPSA-related endorsements.",
  },
};
