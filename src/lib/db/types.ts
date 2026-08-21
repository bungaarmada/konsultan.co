import type {
  DocType,
  InvoiceStatus,
  ProjectStatus,
  StageName,
  StageStatus,
  UserRole,
} from "@/types";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  createdAt: Date;
};

export type ProjectRecord = {
  id: string;
  homeownerId: string;
  homeownerName: string;
  homeownerEmail: string;
  createdById: string | null;
  title: string;
  ownerName: string;
  ownerIc: string | null;
  ownerContact: string;
  siteAddress: string;
  latitude: number;
  longitude: number;
  status: ProjectStatus;
  totalFee: number;
  referenceNo: string | null;
  needsContractor: boolean | null;
  quoteAcknowledged: boolean;
  suratLantikanSigned: boolean;
  selectedContractorId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type DocumentRecord = {
  id: string;
  projectId: string;
  uploaderId: string;
  docType: DocType;
  stageName: StageName | null;
  status: string;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  version: number;
  uploadedAt: Date;
};

export type StageRecord = {
  id: string;
  projectId: string;
  stageName: StageName;
  status: StageStatus;
  remarks: string | null;
  endorsedDocUrl: string | null;
  updatedAt: Date;
};

export type InvoiceRecord = {
  id: string;
  projectId: string;
  milestoneKey: string;
  stageName: StageName;
  percent: number;
  amount: number;
  status: InvoiceStatus;
  invoiceNumber: string;
  billplzBillId: string | null;
  billplzUrl: string | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SignatureRecord = {
  id: string;
  projectId: string;
  documentId: string;
  signerId: string | null;
  signerRole: string;
  signerName: string;
  signerIc: string | null;
  signerTitle: string | null;
  signatureUrl: string;
  signedAt: Date;
};

export type ContractorRecord = {
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
};

export type ProjectDetail = ProjectRecord & {
  homeowner: { id: string; name: string; email: string; phone: string | null };
  documents: DocumentRecord[];
  stages: StageRecord[];
  invoices: InvoiceRecord[];
};
