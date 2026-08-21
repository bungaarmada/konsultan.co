import { adminAuth } from "../src/lib/firebase";
import {
  createContractor,
  createDocument,
  createProject,
  upsertInvoice,
  upsertUserProfile,
  wipeAllData,
  writeStages,
} from "../src/lib/db";
import { STAGE_ORDER } from "../src/types";
import type { UserRole } from "../src/types";

async function upsertAuthUser(input: {
  email: string;
  password: string;
  name: string;
  phone: string;
  role: UserRole;
}) {
  let uid: string;
  try {
    const existing = await adminAuth().getUserByEmail(input.email);
    await adminAuth().updateUser(existing.uid, {
      password: input.password,
      displayName: input.name,
    });
    uid = existing.uid;
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
    if (code !== "auth/user-not-found") throw error;
    const created = await adminAuth().createUser({
      email: input.email,
      password: input.password,
      displayName: input.name,
    });
    uid = created.uid;
  }

  await adminAuth().setCustomUserClaims(uid, { role: input.role });
  await upsertUserProfile({
    id: uid,
    name: input.name,
    email: input.email,
    role: input.role,
    phone: input.phone,
    createdAt: new Date(),
  });
  return uid;
}

async function main() {
  console.log("Seeding Firebase Auth + Firestore...");
  await wipeAllData();

  const homeownerId = await upsertAuthUser({
    email: "ahmad@example.com",
    password: "demo123",
    name: "Ahmad Rahman",
    phone: "+60 12-345 6789",
    role: "HOMEOWNER",
  });

  const consultantId = await upsertAuthUser({
    email: "admin@konsultan.co",
    password: "demo123",
    name: "Nurul Aisyah",
    phone: "+60 3-2181 9000",
    role: "CONSULTANT",
  });

  const contractors = [
    {
      companyName: "Bina Jaya Construction Sdn Bhd",
      regNumber: "CIDB-G7-00128",
      phone: "+60 3-2161 4400",
      email: "hello@binajaya.my",
      address: "Jalan Ampang, Kuala Lumpur",
      latitude: 3.1578,
      longitude: 101.7117,
      coverageRadiusKm: 20,
      isActive: true,
      rating: 4.8,
      reviewCount: 64,
      badge: "CIDB G7",
      specialties: "Bungalow, Semi-D, Renovation",
    },
    {
      companyName: "Selangor Builders Sdn Bhd",
      regNumber: "CIDB-G6-04421",
      phone: "+60 3-7956 1100",
      email: "projects@selangorbuilders.my",
      address: "Petaling Jaya, Selangor",
      latitude: 3.1073,
      longitude: 101.6067,
      coverageRadiusKm: 20,
      isActive: true,
      rating: 4.6,
      reviewCount: 41,
      badge: "CIDB G6",
      specialties: "Landed residential, Extension",
    },
    {
      companyName: "Mega Struktur Engineering",
      regNumber: "CIDB-G7-08810",
      phone: "+60 3-5519 3300",
      email: "tender@megastruktur.my",
      address: "Shah Alam, Selangor",
      latitude: 3.0733,
      longitude: 101.5185,
      coverageRadiusKm: 20,
      isActive: true,
      rating: 4.5,
      reviewCount: 38,
      badge: "PKK Class A",
      specialties: "C&S heavy works, Foundation",
    },
    {
      companyName: "Ampang Prestige Construction",
      regNumber: "CIDB-G7-01290",
      phone: "+60 3-4257 8080",
      email: "prestige@ampangbuild.my",
      address: "Ampang, Selangor",
      latitude: 3.15,
      longitude: 101.76,
      coverageRadiusKm: 20,
      isActive: true,
      rating: 4.9,
      reviewCount: 51,
      badge: "CIDB G7 · GreenRE",
      specialties: "Luxury bungalow, Hillside",
    },
    {
      companyName: "Johor Land Builders Sdn Bhd",
      regNumber: "CIDB-G5-20331",
      phone: "+60 7-224 1100",
      email: "hello@johorland.my",
      address: "Johor Bahru, Johor",
      latitude: 1.4927,
      longitude: 103.7414,
      coverageRadiusKm: 20,
      isActive: true,
      rating: 4.3,
      reviewCount: 22,
      badge: "CIDB G5",
      specialties: "Landed residential",
    },
  ];

  for (const contractor of contractors) {
    await createContractor(contractor);
  }

  const active = await createProject({
    homeownerId,
    createdById: consultantId,
    title: "Lekir House Build",
    ownerName: "Rosni Binti Ismail",
    ownerIc: "800101-08-1234",
    ownerContact: "+60195109006",
    siteAddress: "Lekir, 32000 Manjung, Perak",
    latitude: 4.15,
    longitude: 100.7,
    status: "IN_PROGRESS",
    totalFee: 18900,
    referenceNo: "BAR/CS02/2026/ROSNI/01",
    needsContractor: null,
    quoteAcknowledged: true,
    suratLantikanSigned: true,
    selectedContractorId: null,
  });

  await writeStages(active.id, [
    {
      stageName: "SCHEMATIC",
      status: "APPROVED",
      remarks: "Appointment completed. Quotation and Surat Lantikan signed.",
    },
    {
      stageName: "DESIGN_DEV",
      status: "IN_PROGRESS",
      remarks: "Final design drawings in preparation.",
    },
    { stageName: "CONTRACT_DOC", status: "DRAFT" },
    { stageName: "CONTRACT_IMPL", status: "DRAFT" },
  ]);

  await upsertInvoice({
    projectId: active.id,
    milestoneKey: "P1_APPOINTMENT",
    stageName: "SCHEMATIC",
    percent: 20,
    amount: 3780,
    status: "PAID",
    invoiceNumber: "INV-BARCS022026ROSNI01-1",
    billplzBillId: null,
    billplzUrl: null,
    paidAt: new Date(),
  });

  const intake = [
    {
      uploaderId: homeownerId,
      docType: "INITIAL_GERAN" as const,
      fileUrl: "/samples/geran-tanah.html",
      fileName: "Geran-Lekir.html",
    },
    {
      uploaderId: homeownerId,
      docType: "INITIAL_IC" as const,
      fileUrl: "/samples/salinan-ic.html",
      fileName: "IC-Rosni.html",
    },
    {
      uploaderId: homeownerId,
      docType: "INITIAL_SITE_PLAN" as const,
      fileUrl: "/samples/pelan-tapak.html",
      fileName: "Pelan-Tapak-Lekir.html",
    },
    {
      uploaderId: consultantId,
      docType: "QUOTATION" as const,
      stageName: "SCHEMATIC" as const,
      status: "SUBMITTED",
      fileUrl: "/samples/quotation.html",
      fileName: "Quotation-ROSNI.html",
    },
    {
      uploaderId: consultantId,
      docType: "SURAT_LANTIKAN" as const,
      stageName: "SCHEMATIC" as const,
      status: "SIGNED",
      fileUrl: "/samples/surat-lantikan.html",
      fileName: "Surat-Lantikan-ROSNI.html",
    },
  ];

  for (const doc of intake) {
    await createDocument({
      projectId: active.id,
      mimeType: "text/html",
      status: "SUBMITTED",
      stageName: null,
      ...doc,
    });
  }

  const review = await createProject({
    homeownerId,
    createdById: homeownerId,
    title: "Taman Tun New Build",
    ownerName: "Ahmad Rahman",
    ownerIc: null,
    ownerContact: "+60 12-345 6789",
    siteAddress: "Jalan Burhanuddin Helmi, TTDI, Kuala Lumpur",
    latitude: 3.1466,
    longitude: 101.6244,
    status: "IN_REVIEW",
    totalFee: 18900,
    referenceNo: "BAR/CS02/2026/AHMAD/02",
    needsContractor: null,
    quoteAcknowledged: false,
    suratLantikanSigned: false,
    selectedContractorId: null,
  });

  await writeStages(
    review.id,
    STAGE_ORDER.map((stageName) => ({
      stageName,
      status: stageName === "SCHEMATIC" ? "PENDING_REVIEW" : "DRAFT",
    })),
  );

  for (const doc of [
    {
      docType: "INITIAL_GERAN" as const,
      fileUrl: "/samples/geran-tanah.html",
      fileName: "Geran-TTDI.html",
    },
    {
      docType: "INITIAL_IC" as const,
      fileUrl: "/samples/salinan-ic.html",
      fileName: "IC-Ahmad.html",
    },
    {
      docType: "INITIAL_SITE_PLAN" as const,
      fileUrl: "/samples/pelan-tapak.html",
      fileName: "Pelan-TTDI.html",
    },
  ]) {
    await createDocument({
      projectId: review.id,
      uploaderId: homeownerId,
      mimeType: "text/html",
      status: "SUBMITTED",
      ...doc,
    });
  }

  console.log("Seeded Konsultan.co demo data in Firebase.");
  console.log("Homeowner: ahmad@example.com / demo123");
  console.log("Consultant: admin@konsultan.co / demo123");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
