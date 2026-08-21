"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { getOptionalFile, saveUploadedFile } from "@/lib/uploads";
import type { DocType, StageName, StageStatus } from "@/types";
import {
  allStagesApproved,
  isStageActionable,
  projectStatusAfterStageUpdate,
} from "@/lib/workflow";
import {
  buildProjectDocVars,
  generateQuotationFile,
  generateSuratLantikanFile,
} from "@/lib/documents/generate";
import {
  createContractor,
  createDocument,
  getContractor,
  getProject,
  getProjectDetail,
  latestDocumentByType,
  updateContractor,
  updateDocument,
  updateProject,
  updateStage,
} from "@/lib/db";

const STAGE_PRIMARY_DOC: Partial<Record<StageName, DocType>> = {
  DESIGN_DEV: "FINAL_DESIGN_DRAWING",
  CONTRACT_DOC: "BORANG_B",
  CONTRACT_IMPL: "CCC",
};

export async function uploadConsultantDocsAction(formData: FormData) {
  const user = await requireUser("CONSULTANT");
  const projectId = String(formData.get("projectId") ?? "");
  if (!projectId) return;

  const quotation = getOptionalFile(formData, "quotation");
  const surat = getOptionalFile(formData, "suratLantikan");

  if (quotation) {
    const saved = await saveUploadedFile(quotation, projectId);
    const existing = await latestDocumentByType(projectId, "QUOTATION");
    await createDocument({
      projectId,
      uploaderId: user.id,
      docType: "QUOTATION",
      stageName: "SCHEMATIC",
      status: "SUBMITTED",
      fileUrl: saved.fileUrl,
      fileName: saved.fileName,
      mimeType: saved.mimeType,
      version: (existing?.version ?? 0) + 1,
    });
  }

  if (surat) {
    const saved = await saveUploadedFile(surat, projectId);
    const existing = await latestDocumentByType(projectId, "SURAT_LANTIKAN");
    await createDocument({
      projectId,
      uploaderId: user.id,
      docType: "SURAT_LANTIKAN",
      stageName: "SCHEMATIC",
      status: "PENDING_SIGNATURE",
      fileUrl: saved.fileUrl,
      fileName: saved.fileName,
      mimeType: saved.mimeType,
      version: (existing?.version ?? 0) + 1,
    });
  }

  await updateStage(projectId, "SCHEMATIC", { status: "PENDING_SIGNATURE" });
  await updateProject(projectId, { status: "IN_PROGRESS" });

  revalidatePath(`/consultant/projects/${projectId}`);
  revalidatePath(`/homeowner/projects/${projectId}`);
}

export async function generateAppointmentDocsAction(projectId: string) {
  const user = await requireUser("CONSULTANT");
  const project = await getProject(projectId);
  if (!project) return;

  const vars = buildProjectDocVars(project);
  const quotation = await generateQuotationFile(projectId, vars);
  const surat = await generateSuratLantikanFile(projectId, vars);

  for (const item of [
    { docType: "QUOTATION" as const, saved: quotation },
    { docType: "SURAT_LANTIKAN" as const, saved: surat },
  ]) {
    const existing = await latestDocumentByType(projectId, item.docType);
    await createDocument({
      projectId,
      uploaderId: user.id,
      docType: item.docType,
      stageName: "SCHEMATIC",
      status: item.docType === "SURAT_LANTIKAN" ? "PENDING_SIGNATURE" : "SUBMITTED",
      fileUrl: item.saved.fileUrl,
      fileName: item.saved.fileName,
      mimeType: item.saved.mimeType,
      version: (existing?.version ?? 0) + 1,
    });
  }

  await updateStage(projectId, "SCHEMATIC", { status: "PENDING_SIGNATURE" });
  await updateProject(projectId, { status: "IN_PROGRESS" });

  revalidatePath(`/consultant/projects/${projectId}`);
  revalidatePath(`/homeowner/projects/${projectId}`);
}

export async function updateStageAction(formData: FormData) {
  const user = await requireUser("CONSULTANT");
  const projectId = String(formData.get("projectId") ?? "");
  const stageName = String(formData.get("stageName") ?? "") as StageName;
  const status = String(formData.get("status") ?? "") as StageStatus;
  const remarks = String(formData.get("remarks") ?? "").trim() || null;
  const file = getOptionalFile(formData, "endorsedFile");

  if (!projectId || !stageName || !status) return;

  const project = await getProjectDetail(projectId);
  if (!project) return;
  if (!isStageActionable(stageName, project.stages, project.invoices)) return;

  let endorsedDocUrl: string | undefined;
  const primaryDoc = STAGE_PRIMARY_DOC[stageName];

  if (file && primaryDoc) {
    const saved = await saveUploadedFile(file, projectId);
    endorsedDocUrl = saved.fileUrl;
    const existing = await latestDocumentByType(projectId, primaryDoc);
    await createDocument({
      projectId,
      uploaderId: user.id,
      docType: primaryDoc,
      stageName,
      status: stageName === "CONTRACT_DOC" ? "PENDING_SIGNATURE" : "PENDING_REVIEW",
      fileUrl: saved.fileUrl,
      fileName: saved.fileName,
      mimeType: saved.mimeType,
      version: (existing?.version ?? 0) + 1,
    });
  }

  let nextStatus = status;
  if (stageName === "CONTRACT_DOC" && file) {
    nextStatus = "PENDING_SIGNATURE";
  }

  await updateStage(projectId, stageName, {
    status: nextStatus,
    remarks,
    ...(endorsedDocUrl ? { endorsedDocUrl } : {}),
  });

  const refreshed = await getProjectDetail(projectId);
  if (refreshed) {
    await updateProject(projectId, {
      status: allStagesApproved(refreshed.stages)
        ? "COMPLETED"
        : projectStatusAfterStageUpdate(refreshed.stages),
    });
  }

  revalidatePath(`/consultant/projects/${projectId}`);
  revalidatePath(`/homeowner/projects/${projectId}`);
  revalidatePath("/consultant");
}

export async function requestSignatureAction(formData: FormData) {
  await requireUser("CONSULTANT");
  const projectId = String(formData.get("projectId") ?? "");
  const documentId = String(formData.get("documentId") ?? "");
  const stageName = String(formData.get("stageName") ?? "") as StageName;
  if (!projectId || !documentId) return;

  await updateDocument(projectId, documentId, { status: "PENDING_SIGNATURE" });

  if (stageName) {
    await updateStage(projectId, stageName, { status: "PENDING_SIGNATURE" });
  }

  revalidatePath(`/consultant/projects/${projectId}`);
  revalidatePath(`/homeowner/projects/${projectId}`);
}

export async function createContractorAction(formData: FormData) {
  await requireUser("CONSULTANT");
  await createContractor({
    companyName: String(formData.get("companyName") ?? "").trim(),
    regNumber: String(formData.get("regNumber") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    latitude: Number(formData.get("latitude")),
    longitude: Number(formData.get("longitude")),
    coverageRadiusKm: Number(formData.get("coverageRadiusKm") || 20),
    rating: Number(formData.get("rating") || 0),
    reviewCount: Number(formData.get("reviewCount") || 0),
    badge: String(formData.get("badge") ?? "").trim() || null,
    specialties: String(formData.get("specialties") ?? "").trim() || null,
    isActive: true,
  });
  revalidatePath("/consultant/contractors");
}

export async function toggleContractorAction(id: string) {
  await requireUser("CONSULTANT");
  const contractor = await getContractor(id);
  if (!contractor) return;
  await updateContractor(id, { isActive: !contractor.isActive });
  revalidatePath("/consultant/contractors");
}
