"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionUser, requireUser } from "@/lib/auth";
import { getOptionalFile, saveUploadedFile } from "@/lib/uploads";
import type { DocType } from "@/types";
import { allStagesApproved, canPromptContractors } from "@/lib/workflow";
import { DEFAULT_TOTAL_FEE } from "@/lib/billing";
import { allocateProjectReferenceNo } from "@/lib/reference-no";
import {
  createDocument,
  createProject,
  createDefaultStages,
  getDocument,
  getProjectDetail,
  getUser,
  getUserByEmail,
  latestDocumentByType,
  updateDocument,
  updateProject,
  updateStage,
  upsertInquiry,
} from "@/lib/db";

async function resolveHomeownerId(formData: FormData, actorId: string, role: string) {
  if (role === "HOMEOWNER") return actorId;
  const homeownerId = String(formData.get("homeownerId") ?? "").trim();
  if (homeownerId) {
    const byId = await getUser(homeownerId);
    if (byId?.role === "HOMEOWNER") return byId.id;
  }
  const email = String(formData.get("homeownerEmail") ?? "")
    .trim()
    .toLowerCase();
  if (!email) return null;
  const homeowner = await getUserByEmail(email);
  if (!homeowner || homeowner.role !== "HOMEOWNER") return null;
  return homeowner.id;
}

export async function createProjectAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const title = String(formData.get("title") ?? "").trim();
  const ownerName = String(formData.get("ownerName") ?? "").trim();
  const ownerIc = String(formData.get("ownerIc") ?? "").trim() || null;
  const ownerContact = String(formData.get("ownerContact") ?? "").trim();
  const siteAddress = String(formData.get("siteAddress") ?? "").trim();
  const latitude = Number(formData.get("latitude"));
  const longitude = Number(formData.get("longitude"));
  const usesLppsa = formData.get("usesLppsa") === "true" || formData.get("usesLppsa") === "on";
  const feeRaw = formData.get("totalFee");
  const totalFee =
    user.role === "CONSULTANT" && feeRaw != null && String(feeRaw).trim() !== ""
      ? Number(feeRaw)
      : DEFAULT_TOTAL_FEE;

  const homeownerId = await resolveHomeownerId(formData, user.id, user.role);
  const redirectBase = user.role === "CONSULTANT" ? "/consultant/projects/new" : "/homeowner/projects/new";

  if (
    !homeownerId ||
    !title ||
    !ownerName ||
    !ownerContact ||
    !siteAddress ||
    Number.isNaN(latitude) ||
    Number.isNaN(longitude) ||
    Number.isNaN(totalFee) ||
    totalFee <= 0
  ) {
    redirect(`${redirectBase}?error=missing`);
  }

  const referenceNo = await allocateProjectReferenceNo(homeownerId, ownerName);

  const project = await createProject({
    homeownerId,
    createdById: user.id,
    title,
    ownerName,
    ownerIc,
    ownerContact,
    siteAddress,
    latitude,
    longitude,
    totalFee,
    usesLppsa,
    referenceNo,
    status: "DRAFT",
    needsContractor: null,
    quoteAcknowledged: false,
    suratLantikanSigned: false,
    selectedContractorId: null,
  });

  await createDefaultStages(project.id);

  if (user.role !== "CONSULTANT" || formData.get("requestHomeownerUpload") !== "true") {
    const initialDocs: { key: string; type: DocType }[] = [
      { key: "geran", type: "INITIAL_GERAN" },
      { key: "ic", type: "INITIAL_IC" },
      { key: "sitePlan", type: "INITIAL_SITE_PLAN" },
    ];

    for (const doc of initialDocs) {
      const file = getOptionalFile(formData, doc.key);
      if (!file) continue;
      const saved = await saveUploadedFile(file, project.id);
      await createDocument({
        projectId: project.id,
        uploaderId: user.id,
        docType: doc.type,
        fileUrl: saved.fileUrl,
        fileName: saved.fileName,
        mimeType: saved.mimeType,
        status: "SUBMITTED",
      });
    }
  }

  revalidatePath("/homeowner");
  revalidatePath("/consultant");
  revalidatePath("/consultant/clients");
  redirect(
    user.role === "CONSULTANT"
      ? `/consultant/projects/${project.id}`
      : `/homeowner/projects/${project.id}`,
  );
}

export async function submitProjectAction(projectId: string) {
  const user = await requireUser();
  const project = await getProjectDetail(projectId);
  if (!project || (user.role === "HOMEOWNER" && project.homeownerId !== user.id)) {
    redirect(user.role === "CONSULTANT" ? "/consultant" : "/homeowner");
  }

  const required: DocType[] = ["INITIAL_GERAN", "INITIAL_IC", "INITIAL_SITE_PLAN"];
  const hasAll = required.every((type) => project.documents.some((d) => d.docType === type));
  if (!hasAll) {
    redirect(
      user.role === "CONSULTANT"
        ? `/consultant/projects/${projectId}?error=docs`
        : `/homeowner/projects/${projectId}?error=docs`,
    );
  }

  await updateProject(projectId, { status: "IN_REVIEW" });
  await updateStage(projectId, "SCHEMATIC", { status: "PENDING_REVIEW" });

  revalidatePath(`/homeowner/projects/${projectId}`);
  revalidatePath(`/consultant/projects/${projectId}`);
  revalidatePath("/consultant");
}

export async function uploadInitialDocAction(formData: FormData) {
  const user = await requireUser();
  const projectId = String(formData.get("projectId") ?? "");
  const docType = String(formData.get("docType") ?? "") as DocType;
  const file = getOptionalFile(formData, "file");
  if (!projectId || !file) return;

  const project = await getProjectDetail(projectId);
  if (!project || (user.role === "HOMEOWNER" && project.homeownerId !== user.id)) return;

  const existing = await latestDocumentByType(projectId, docType);
  const saved = await saveUploadedFile(file, projectId);
  await createDocument({
    projectId,
    uploaderId: user.id,
    docType,
    fileUrl: saved.fileUrl,
    fileName: saved.fileName,
    mimeType: saved.mimeType,
    version: (existing?.version ?? 0) + 1,
    status: "SUBMITTED",
  });

  revalidatePath(`/homeowner/projects/${projectId}`);
  revalidatePath(`/consultant/projects/${projectId}`);
}

export async function uploadSignedBorangBAction(formData: FormData) {
  const user = await requireUser("HOMEOWNER");
  const projectId = String(formData.get("projectId") ?? "");
  const draftDocumentId = String(formData.get("draftDocumentId") ?? "");
  const file = getOptionalFile(formData, "file");
  if (!projectId || !draftDocumentId || !file) return;

  const project = await getProjectDetail(projectId);
  if (!project || project.homeownerId !== user.id) return;

  const draft = await getDocument(projectId, draftDocumentId);
  if (!draft || draft.docType !== "BORANG_B" || draft.status !== "PENDING_SIGNATURE") return;

  const maxVersion = project.documents
    .filter((d) => d.docType === "BORANG_B")
    .reduce((max, d) => Math.max(max, d.version), 0);

  const saved = await saveUploadedFile(file, projectId);
  await createDocument({
    projectId,
    uploaderId: user.id,
    docType: "BORANG_B",
    stageName: "CONTRACT_DOC",
    status: "SIGNED",
    fileUrl: saved.fileUrl,
    fileName: saved.fileName,
    mimeType: saved.mimeType,
    version: maxVersion + 1,
  });

  await updateDocument(projectId, draftDocumentId, { status: "SUBMITTED" });
  await updateStage(projectId, "CONTRACT_DOC", { status: "PENDING_REVIEW" });

  revalidatePath(`/homeowner/projects/${projectId}`);
  revalidatePath(`/homeowner/projects/${projectId}/documents`);
  revalidatePath(`/consultant/projects/${projectId}`);
  revalidatePath(`/consultant/projects/${projectId}/documents`);
}

export async function updateProjectFeeAction(formData: FormData) {
  await requireUser("CONSULTANT");
  const projectId = String(formData.get("projectId") ?? "");
  const totalFee = Number(formData.get("totalFee"));
  if (!projectId || Number.isNaN(totalFee) || totalFee <= 0) return;

  await updateProject(projectId, { totalFee });

  revalidatePath(`/consultant/projects/${projectId}`);
  revalidatePath(`/homeowner/projects/${projectId}`);
}

export async function setContractorPreferenceAction(projectId: string, needsContractor: boolean) {
  const user = await requireUser("HOMEOWNER");
  const project = await getProjectDetail(projectId);
  if (!project || project.homeownerId !== user.id || !canPromptContractors(project)) return;

  const allDone = allStagesApproved(project.stages);
  await updateProject(projectId, {
    needsContractor,
    ...(allDone ? { status: "COMPLETED" as const } : {}),
  });

  revalidatePath(`/homeowner/projects/${projectId}`);
  if (needsContractor) {
    redirect(`/homeowner/projects/${projectId}/contractors`);
  }
}

export async function inquireContractorAction(formData: FormData) {
  const user = await requireUser("HOMEOWNER");
  const projectId = String(formData.get("projectId") ?? "");
  const contractorId = String(formData.get("contractorId") ?? "");
  if (!projectId || !contractorId) return;

  const project = await getProjectDetail(projectId);
  if (!project || project.homeownerId !== user.id) return;

  await upsertInquiry(projectId, contractorId, "Homeowner requested an introduction.");
  await updateProject(projectId, { selectedContractorId: contractorId, needsContractor: true });

  revalidatePath(`/homeowner/projects/${projectId}/contractors`);
}
