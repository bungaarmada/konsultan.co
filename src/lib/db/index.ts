import type { DocumentData, Query, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { firestore } from "@/lib/firebase";
import { STAGE_ORDER, type DocType, type ProjectStatus, type StageName } from "@/types";
import type {
  ContractorRecord,
  DocumentRecord,
  InvoiceRecord,
  ProjectDetail,
  ProjectRecord,
  SignatureRecord,
  StageRecord,
  UserRecord,
} from "@/lib/db/types";

export type {
  ContractorRecord,
  DocumentRecord,
  InvoiceRecord,
  ProjectDetail,
  ProjectRecord,
  SignatureRecord,
  StageRecord,
  UserRecord,
};

function db() {
  return firestore();
}

function asDate(value: unknown, fallback = new Date()): Date {
  if (value instanceof Date) return value;
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate();
  }
  if (typeof value === "string" || typeof value === "number") return new Date(value);
  return fallback;
}

function omitUndefined<T extends Record<string, unknown>>(data: T): T {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  ) as T;
}

function usersCol() {
  return db().collection("users");
}
function projectsCol() {
  return db().collection("projects");
}
function invoicesCol() {
  return db().collection("invoices");
}
function contractorsCol() {
  return db().collection("contractors");
}
function documentsCol(projectId: string) {
  return projectsCol().doc(projectId).collection("documents");
}
function stagesCol(projectId: string) {
  return projectsCol().doc(projectId).collection("stages");
}
function signaturesCol(projectId: string) {
  return projectsCol().doc(projectId).collection("signatures");
}
function inquiriesCol(projectId: string) {
  return projectsCol().doc(projectId).collection("inquiries");
}

function mapUser(id: string, data: DocumentData): UserRecord {
  return {
    id,
    name: String(data.name ?? ""),
    email: String(data.email ?? "").toLowerCase(),
    role: data.role === "CONSULTANT" ? "CONSULTANT" : "HOMEOWNER",
    phone: data.phone ?? null,
    createdAt: asDate(data.createdAt),
  };
}

function mapProject(id: string, data: DocumentData): ProjectRecord {
  return {
    id,
    homeownerId: String(data.homeownerId ?? ""),
    homeownerName: String(data.homeownerName ?? data.ownerName ?? ""),
    homeownerEmail: String(data.homeownerEmail ?? ""),
    createdById: data.createdById ?? null,
    title: String(data.title ?? ""),
    ownerName: String(data.ownerName ?? ""),
    ownerIc: data.ownerIc ?? null,
    ownerContact: String(data.ownerContact ?? ""),
    siteAddress: String(data.siteAddress ?? ""),
    latitude: Number(data.latitude ?? 0),
    longitude: Number(data.longitude ?? 0),
    status: (data.status as ProjectStatus) ?? "DRAFT",
    totalFee: Number(data.totalFee ?? 0),
    referenceNo: data.referenceNo ?? null,
    needsContractor: typeof data.needsContractor === "boolean" ? data.needsContractor : null,
    quoteAcknowledged: Boolean(data.quoteAcknowledged),
    suratLantikanSigned: Boolean(data.suratLantikanSigned),
    selectedContractorId: data.selectedContractorId ?? null,
    createdAt: asDate(data.createdAt),
    updatedAt: asDate(data.updatedAt),
  };
}

function mapDocument(id: string, data: DocumentData): DocumentRecord {
  return {
    id,
    projectId: String(data.projectId ?? ""),
    uploaderId: String(data.uploaderId ?? ""),
    docType: data.docType as DocType,
    stageName: (data.stageName as StageName) ?? null,
    status: String(data.status ?? "SUBMITTED"),
    fileUrl: String(data.fileUrl ?? ""),
    fileName: String(data.fileName ?? ""),
    mimeType: String(data.mimeType ?? "application/octet-stream"),
    version: Number(data.version ?? 1),
    uploadedAt: asDate(data.uploadedAt),
  };
}

function mapStage(id: string, data: DocumentData): StageRecord {
  return {
    id,
    projectId: String(data.projectId ?? ""),
    stageName: data.stageName as StageName,
    status: data.status ?? "DRAFT",
    remarks: data.remarks ?? null,
    endorsedDocUrl: data.endorsedDocUrl ?? null,
    updatedAt: asDate(data.updatedAt),
  };
}

function mapInvoice(id: string, data: DocumentData): InvoiceRecord {
  return {
    id,
    projectId: String(data.projectId ?? ""),
    milestoneKey: String(data.milestoneKey ?? ""),
    stageName: data.stageName as StageName,
    percent: Number(data.percent ?? 0),
    amount: Number(data.amount ?? 0),
    status: data.status ?? "DRAFT",
    invoiceNumber: String(data.invoiceNumber ?? ""),
    billplzBillId: data.billplzBillId ?? null,
    billplzUrl: data.billplzUrl ?? null,
    paidAt: data.paidAt ? asDate(data.paidAt) : null,
    createdAt: asDate(data.createdAt),
    updatedAt: asDate(data.updatedAt),
  };
}

function mapContractor(id: string, data: DocumentData): ContractorRecord {
  return {
    id,
    companyName: String(data.companyName ?? ""),
    regNumber: String(data.regNumber ?? ""),
    phone: String(data.phone ?? ""),
    email: String(data.email ?? ""),
    address: String(data.address ?? ""),
    latitude: Number(data.latitude ?? 0),
    longitude: Number(data.longitude ?? 0),
    coverageRadiusKm: Number(data.coverageRadiusKm ?? 20),
    isActive: data.isActive !== false,
    rating: Number(data.rating ?? 0),
    reviewCount: Number(data.reviewCount ?? 0),
    badge: data.badge ?? null,
    specialties: data.specialties ?? null,
  };
}

export async function getUser(id: string): Promise<UserRecord | null> {
  const snap = await usersCol().doc(id).get();
  if (!snap.exists) return null;
  return mapUser(snap.id, snap.data() ?? {});
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const snap = await usersCol().where("email", "==", email.toLowerCase()).limit(1).get();
  const doc = snap.docs[0];
  if (!doc) return null;
  return mapUser(doc.id, doc.data());
}

export async function upsertUserProfile(user: UserRecord) {
  await usersCol()
    .doc(user.id)
    .set(
      omitUndefined({
        name: user.name,
        email: user.email.toLowerCase(),
        role: user.role,
        phone: user.phone,
        createdAt: user.createdAt,
      }),
    );
}

export async function createProject(
  input: Omit<ProjectRecord, "id" | "createdAt" | "updatedAt" | "homeownerName" | "homeownerEmail"> & {
    homeownerName?: string;
    homeownerEmail?: string;
  },
): Promise<ProjectRecord> {
  const homeowner = await getUser(input.homeownerId);
  const now = new Date();
  const ref = projectsCol().doc();
  const record: ProjectRecord = {
    ...input,
    id: ref.id,
    homeownerName: input.homeownerName ?? homeowner?.name ?? input.ownerName,
    homeownerEmail: input.homeownerEmail ?? homeowner?.email ?? "",
    createdAt: now,
    updatedAt: now,
  };
  const { id, ...data } = record;
  await ref.set(omitUndefined({ ...data }));
  void id;
  return record;
}

export async function updateProject(id: string, patch: Partial<ProjectRecord>) {
  const { id: _id, ...rest } = patch;
  void _id;
  await projectsCol()
    .doc(id)
    .set(omitUndefined({ ...rest, updatedAt: new Date() }), { merge: true });
}

export async function getProject(id: string): Promise<ProjectRecord | null> {
  const snap = await projectsCol().doc(id).get();
  if (!snap.exists) return null;
  return mapProject(snap.id, snap.data() ?? {});
}

export async function listProjects(filter?: {
  homeownerId?: string;
  status?: ProjectStatus;
}): Promise<ProjectRecord[]> {
  let query: Query = projectsCol();
  if (filter?.homeownerId) query = query.where("homeownerId", "==", filter.homeownerId);
  if (filter?.status) query = query.where("status", "==", filter.status);
  const snap = await query.get();
  return snap.docs
    .map((doc) => mapProject(doc.id, doc.data()))
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export async function countProjectsByStatus(): Promise<Record<string, number>> {
  const snap = await projectsCol().get();
  const counts: Record<string, number> = {};
  for (const doc of snap.docs) {
    const status = String(doc.data().status ?? "DRAFT");
    counts[status] = (counts[status] ?? 0) + 1;
  }
  return counts;
}

export async function createDefaultStages(projectId: string) {
  const now = new Date();
  const batch = db().batch();
  for (const stageName of STAGE_ORDER) {
    const ref = stagesCol(projectId).doc(stageName);
    batch.set(
      ref,
      omitUndefined({
        projectId,
        stageName,
        status: "DRAFT",
        remarks: null,
        endorsedDocUrl: null,
        updatedAt: now,
      }),
    );
  }
  await batch.commit();
}

export async function writeStages(
  projectId: string,
  stages: { stageName: StageName; status: string; remarks?: string | null }[],
) {
  const now = new Date();
  const batch = db().batch();
  for (const stage of stages) {
    batch.set(
      stagesCol(projectId).doc(stage.stageName),
      omitUndefined({
        projectId,
        stageName: stage.stageName,
        status: stage.status,
        remarks: stage.remarks ?? null,
        endorsedDocUrl: null,
        updatedAt: now,
      }),
    );
  }
  await batch.commit();
}

export async function listStages(projectId: string): Promise<StageRecord[]> {
  const snap = await stagesCol(projectId).get();
  const stages = snap.docs.map((doc) => mapStage(doc.id, doc.data()));
  return STAGE_ORDER.map(
    (name) =>
      stages.find((s) => s.stageName === name) ?? {
        id: name,
        projectId,
        stageName: name,
        status: "DRAFT" as const,
        remarks: null,
        endorsedDocUrl: null,
        updatedAt: new Date(),
      },
  );
}

export async function updateStage(
  projectId: string,
  stageName: StageName,
  patch: Partial<Pick<StageRecord, "status" | "remarks" | "endorsedDocUrl">>,
) {
  await stagesCol(projectId)
    .doc(stageName)
    .set(omitUndefined({ ...patch, projectId, stageName, updatedAt: new Date() }), { merge: true });
}

export async function listDocuments(projectId: string): Promise<DocumentRecord[]> {
  const snap = await documentsCol(projectId).get();
  return snap.docs
    .map((doc) => mapDocument(doc.id, doc.data()))
    .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
}

export async function getDocument(projectId: string, documentId: string): Promise<DocumentRecord | null> {
  const snap = await documentsCol(projectId).doc(documentId).get();
  if (!snap.exists) return null;
  return mapDocument(snap.id, snap.data() ?? {});
}

export async function latestDocumentByType(
  projectId: string,
  docType: DocType,
): Promise<DocumentRecord | null> {
  const docs = await listDocuments(projectId);
  return docs.find((doc) => doc.docType === docType) ?? null;
}

export async function createDocument(
  input: Omit<DocumentRecord, "id" | "uploadedAt" | "version" | "mimeType" | "status" | "stageName"> &
    Partial<Pick<DocumentRecord, "uploadedAt" | "version" | "mimeType" | "status" | "stageName">>,
): Promise<DocumentRecord> {
  const ref = documentsCol(input.projectId).doc();
  const record: DocumentRecord = {
    mimeType: "application/octet-stream",
    status: "SUBMITTED",
    stageName: null,
    version: 1,
    uploadedAt: new Date(),
    ...input,
    id: ref.id,
  };
  const { id, ...data } = record;
  await ref.set(omitUndefined({ ...data }));
  void id;
  return record;
}

export async function updateDocument(
  projectId: string,
  documentId: string,
  patch: Partial<DocumentRecord>,
) {
  const { id: _id, ...rest } = patch;
  void _id;
  await documentsCol(projectId).doc(documentId).set(omitUndefined({ ...rest }), { merge: true });
}

export async function listInvoicesByProject(projectId: string): Promise<InvoiceRecord[]> {
  const snap = await invoicesCol().where("projectId", "==", projectId).get();
  return snap.docs
    .map((doc) => mapInvoice(doc.id, doc.data()))
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

export async function getInvoice(id: string): Promise<InvoiceRecord | null> {
  const snap = await invoicesCol().doc(id).get();
  if (!snap.exists) return null;
  return mapInvoice(snap.id, snap.data() ?? {});
}

export async function getInvoiceByBillplzId(billId: string): Promise<InvoiceRecord | null> {
  const snap = await invoicesCol().where("billplzBillId", "==", billId).limit(1).get();
  const doc = snap.docs[0];
  if (!doc) return null;
  return mapInvoice(doc.id, doc.data());
}

export async function upsertInvoice(
  input: Omit<InvoiceRecord, "id" | "createdAt" | "updatedAt" | "paidAt"> & {
    id?: string;
    paidAt?: Date | null;
  },
): Promise<InvoiceRecord> {
  const now = new Date();
  const ref = input.id ? invoicesCol().doc(input.id) : invoicesCol().doc();
  const record: InvoiceRecord = {
    ...input,
    id: ref.id,
    paidAt: input.paidAt ?? null,
    createdAt: now,
    updatedAt: now,
  };
  const existing = input.id ? await getInvoice(input.id) : null;
  await ref.set(
    omitUndefined({
      ...record,
      id: undefined,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    }),
    { merge: true },
  );
  return { ...record, createdAt: existing?.createdAt ?? now };
}

export async function updateInvoice(id: string, patch: Partial<InvoiceRecord>) {
  const { id: _id, ...rest } = patch;
  void _id;
  await invoicesCol()
    .doc(id)
    .set(omitUndefined({ ...rest, updatedAt: new Date() }), { merge: true });
}

export async function createSignatures(
  projectId: string,
  rows: Omit<SignatureRecord, "id" | "signedAt" | "projectId">[],
) {
  const batch = db().batch();
  const now = new Date();
  for (const row of rows) {
    const ref = signaturesCol(projectId).doc();
    batch.set(
      ref,
      omitUndefined({
        ...row,
        projectId,
        signedAt: now,
      }),
    );
  }
  await batch.commit();
}

export async function createSignature(
  projectId: string,
  row: Omit<SignatureRecord, "id" | "signedAt" | "projectId">,
) {
  await signaturesCol(projectId)
    .doc()
    .set(
      omitUndefined({
        ...row,
        projectId,
        signedAt: new Date(),
      }),
    );
}

export async function listContractors(activeOnly = false): Promise<ContractorRecord[]> {
  const snap = activeOnly
    ? await contractorsCol().where("isActive", "==", true).get()
    : await contractorsCol().get();
  return snap.docs
    .map((doc) => mapContractor(doc.id, doc.data()))
    .sort((a, b) => a.companyName.localeCompare(b.companyName));
}

export async function getContractor(id: string): Promise<ContractorRecord | null> {
  const snap = await contractorsCol().doc(id).get();
  if (!snap.exists) return null;
  return mapContractor(snap.id, snap.data() ?? {});
}

export async function getContractorByRegNumber(regNumber: string): Promise<ContractorRecord | null> {
  const snap = await contractorsCol().where("regNumber", "==", regNumber).limit(1).get();
  const doc = snap.docs[0];
  if (!doc) return null;
  return mapContractor(doc.id, doc.data());
}

export async function createContractor(
  input: Omit<ContractorRecord, "id">,
): Promise<ContractorRecord> {
  const ref = contractorsCol().doc();
  await ref.set(omitUndefined({ ...input }));
  return { id: ref.id, ...input };
}

export async function updateContractor(id: string, patch: Partial<ContractorRecord>) {
  const { id: _id, ...rest } = patch;
  void _id;
  await contractorsCol().doc(id).set(omitUndefined({ ...rest }), { merge: true });
}

export async function upsertInquiry(projectId: string, contractorId: string, message: string) {
  await inquiriesCol(projectId)
    .doc(contractorId)
    .set(
      omitUndefined({
        projectId,
        contractorId,
        message,
        createdAt: new Date(),
      }),
      { merge: true },
    );
}

export async function getProjectDetail(id: string): Promise<ProjectDetail | null> {
  const project = await getProject(id);
  if (!project) return null;
  const [homeowner, documents, stages, invoices] = await Promise.all([
    getUser(project.homeownerId),
    listDocuments(id),
    listStages(id),
    listInvoicesByProject(id),
  ]);
  return {
    ...project,
    homeowner: homeowner ?? {
      id: project.homeownerId,
      name: project.homeownerName || project.ownerName,
      email: project.homeownerEmail,
      phone: null,
    },
    documents,
    stages,
    invoices,
  };
}

export async function listProjectRows(filter?: { homeownerId?: string; status?: ProjectStatus }) {
  const projects = await listProjects(filter);
  return Promise.all(
    projects.map(async (project) => ({
      ...project,
      homeowner: {
        name: project.homeownerName || project.ownerName,
        email: project.homeownerEmail,
      },
      stages: await listStages(project.id),
    })),
  );
}

export async function deleteQueryBatch(
  docs: QueryDocumentSnapshot[],
) {
  if (docs.length === 0) return;
  const batch = db().batch();
  for (const doc of docs) batch.delete(doc.ref);
  await batch.commit();
}

export async function wipeAllData() {
  const projects = await projectsCol().get();
  for (const project of projects.docs) {
    for (const sub of ["documents", "stages", "signatures", "inquiries"]) {
      const snap = await project.ref.collection(sub).get();
      await deleteQueryBatch(snap.docs);
    }
  }
  await deleteQueryBatch(projects.docs);
  await deleteQueryBatch((await invoicesCol().get()).docs);
  await deleteQueryBatch((await contractorsCol().get()).docs);
  await deleteQueryBatch((await usersCol().get()).docs);
}
