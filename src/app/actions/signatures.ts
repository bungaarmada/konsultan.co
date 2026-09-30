"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { saveBufferFile } from "@/lib/uploads";
import { buildProjectDocVars, generateSuratLantikanFile } from "@/lib/documents/generate";
import {
  createDocument,
  createSignatures,
  getDocument,
  getProject,
  updateProject,
  updateStage,
} from "@/lib/db";

async function persistSignatureDataUrl(projectId: string, dataUrl: string, label: string) {
  const match = /^data:(.+);base64,(.+)$/.exec(dataUrl);
  if (!match) throw new Error("Invalid signature image");
  const mimeType = match[1];
  const bytes = Buffer.from(match[2], "base64");
  const ext = mimeType.includes("png") ? "png" : "jpg";
  return saveBufferFile(bytes, projectId, `${label}.${ext}`, mimeType);
}

export async function signSuratLantikanAction(formData: FormData) {
  const user = await requireUser("HOMEOWNER");
  const projectId = String(formData.get("projectId") ?? "");
  const documentId = String(formData.get("documentId") ?? "");
  const ownerSignatureDataUrl = String(formData.get("ownerSignatureDataUrl") ?? "");
  const witnessName = String(formData.get("witnessName") ?? "").trim();
  const witnessIc = String(formData.get("witnessIc") ?? "").trim();
  const witnessTitle = String(formData.get("witnessTitle") ?? "").trim();
  const witnessSignatureDataUrl = String(formData.get("witnessSignatureDataUrl") ?? "");

  if (!projectId || !documentId || !ownerSignatureDataUrl || !witnessName || !witnessSignatureDataUrl) {
    return;
  }

  const project = await getProject(projectId);
  if (!project || project.homeownerId !== user.id) return;

  const ownerSig = await persistSignatureDataUrl(projectId, ownerSignatureDataUrl, "owner-signature");
  const witnessSig = await persistSignatureDataUrl(
    projectId,
    witnessSignatureDataUrl,
    "witness-signature",
  );

  const signedAt = new Date().toLocaleDateString("ms-MY", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const vars = buildProjectDocVars(project);
  const signed = await generateSuratLantikanFile(projectId, vars, {
    ownerSignatureUrl: ownerSig.fileUrl,
    ownerSignedAt: signedAt,
    witnessName,
    witnessIc,
    witnessTitle,
    witnessSignatureUrl: witnessSig.fileUrl,
    witnessSignedAt: signedAt,
  });

  const existing = await getDocument(projectId, documentId);
  const signedDoc = await createDocument({
    projectId,
    uploaderId: user.id,
    docType: "SURAT_LANTIKAN",
    stageName: "SCHEMATIC",
    status: "SIGNED",
    fileUrl: signed.fileUrl,
    fileName: signed.fileName,
    mimeType: signed.mimeType,
    version: (existing?.version ?? 1) + 1,
  });

  await createSignatures(projectId, [
    {
      documentId: signedDoc.id,
      signerId: user.id,
      signerRole: "HOMEOWNER",
      signerName: project.ownerName,
      signerIc: project.ownerIc,
      signerTitle: null,
      signatureUrl: ownerSig.fileUrl,
    },
    {
      documentId: signedDoc.id,
      signerId: null,
      signerRole: "WITNESS",
      signerName: witnessName,
      signerIc: witnessIc || null,
      signerTitle: witnessTitle || null,
      signatureUrl: witnessSig.fileUrl,
    },
  ]);

  await updateProject(projectId, {
    suratLantikanSigned: true,
    quoteAcknowledged: true,
    status: "IN_PROGRESS",
  });

  await updateStage(projectId, "SCHEMATIC", { status: "PENDING_REVIEW" });

  revalidatePath(`/homeowner/projects/${projectId}`);
  revalidatePath(`/consultant/projects/${projectId}`);
}
