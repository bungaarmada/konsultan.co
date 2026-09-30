import { firestore } from "@/lib/firebase";

export function ownerNameSlug(ownerName: string) {
  return ownerName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 12) || "PROJECT";
}

export function formatReferenceNo(
  ownerName: string,
  globalSeq: number,
  userSeq: number,
  createdAt = new Date(),
) {
  const cs = String(globalSeq).padStart(2, "0");
  const year = createdAt.getFullYear();
  return `BAR/CS${cs}/${year}/${ownerNameSlug(ownerName)}/${userSeq}`;
}

async function seedCountersFromExisting(homeownerId: string) {
  const db = firestore();
  const globalRef = db.collection("counters").doc("projectSequence");
  const userRef = db.collection("counters").doc(`userProjects_${homeownerId}`);

  const [globalSnap, userSnap] = await Promise.all([globalRef.get(), userRef.get()]);
  const tasks: Promise<unknown>[] = [];

  if (!globalSnap.exists) {
    const snap = await db.collection("projects").get();
    tasks.push(globalRef.set({ value: snap.size }));
  }

  if (!userSnap.exists) {
    const snap = await db.collection("projects").where("homeownerId", "==", homeownerId).get();
    tasks.push(userRef.set({ value: snap.size }));
  }

  await Promise.all(tasks);
}

/** Allocates BAR/CS##/YYYY/OWNER/N using atomic Firestore counters. */
export async function allocateProjectReferenceNo(
  homeownerId: string,
  ownerName: string,
  createdAt = new Date(),
): Promise<string> {
  await seedCountersFromExisting(homeownerId);

  const db = firestore();
  const globalRef = db.collection("counters").doc("projectSequence");
  const userRef = db.collection("counters").doc(`userProjects_${homeownerId}`);

  return db.runTransaction(async (tx) => {
    const [globalSnap, userSnap] = await Promise.all([tx.get(globalRef), tx.get(userRef)]);

    const globalSeq = (globalSnap.data()?.value ?? 0) + 1;
    const userSeq = (userSnap.data()?.value ?? 0) + 1;

    tx.set(globalRef, { value: globalSeq });
    tx.set(userRef, { value: userSeq });

    return formatReferenceNo(ownerName, globalSeq, userSeq, createdAt);
  });
}
