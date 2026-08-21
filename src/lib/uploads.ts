import { adminStorage, storageBucketName } from "@/lib/firebase";

export type SavedUpload = {
  fileName: string;
  fileUrl: string;
  mimeType: string;
  storagePath: string;
};

async function saveToFirebase(
  bytes: Buffer,
  folder: string,
  fileName: string,
  mimeType: string,
): Promise<SavedUpload> {
  const bucket = adminStorage().bucket(storageBucketName());
  const storagePath = `uploads/${folder}/${fileName}`;
  const file = bucket.file(storagePath);
  await file.save(bytes, {
    contentType: mimeType,
    metadata: { cacheControl: "public,max-age=31536000" },
  });

  const publicBase = process.env.FIREBASE_PUBLIC_BASE_URL?.replace(/\/$/, "");
  let fileUrl = publicBase
    ? `${publicBase}/${storagePath}`
    : `https://storage.googleapis.com/${storageBucketName()}/${storagePath}`;

  try {
    await file.makePublic();
  } catch {
    const [signed] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 1000 * 60 * 60 * 24 * 365 * 10,
    });
    fileUrl = signed;
  }

  return {
    fileName: fileName.replace(/^\d+-/, ""),
    fileUrl,
    mimeType,
    storagePath,
  };
}

export async function saveUploadedFile(file: File, folder: string): Promise<SavedUpload> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const mimeType = file.type || "application/octet-stream";
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${Date.now()}-${safeName}`;
  const saved = await saveToFirebase(bytes, folder, fileName, mimeType);
  return { ...saved, fileName: file.name };
}

export async function saveBufferFile(
  bytes: Buffer,
  folder: string,
  originalName: string,
  mimeType: string,
): Promise<SavedUpload> {
  const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${Date.now()}-${safeName}`;
  const saved = await saveToFirebase(bytes, folder, fileName, mimeType);
  return { ...saved, fileName: originalName };
}

export function getOptionalFile(formData: FormData, key: string): File | null {
  const value = formData.get(key);
  if (value instanceof File && value.size > 0) return value;
  return null;
}
