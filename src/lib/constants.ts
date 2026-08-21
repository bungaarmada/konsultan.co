import type { InvoiceStatus, ProjectStatus, StageStatus } from "@/types";

export const APP_NAME = "Konsultan.co";
export const CONTRACTOR_RADIUS_KM = 20;
export const SESSION_COOKIE = "konsultan_session";

export const CONSULTANT_COMPANY = {
  name: "BUNGA ARMADA RESOURCES",
  regNo: "SA0645905-W",
  address: "BG03 Megan Embassy, 225 Jalan Ampang, 50450 Kuala Lumpur",
  phone: "+60111 627 4700",
  email: "bungaarmada25@gmail.com",
  bankName: "OCBC",
  bankAccount: "7041326579",
  signatoryName: "Batrisyia Husna Binti Badrolhisham",
} as const;

export const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  DRAFT: "Draft",
  IN_REVIEW: "In Review",
  IN_PROGRESS: "In Progress",
  PAYMENT_PENDING: "Payment Pending",
  COMPLETED: "Completed",
};

export const STAGE_STATUS_LABEL: Record<StageStatus, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending Review",
  PENDING_SIGNATURE: "Pending Signature",
  PAYMENT_PENDING: "Payment Pending",
  IN_PROGRESS: "In Progress",
  REVISION_NEEDED: "Revision Needed",
  APPROVED: "Approved",
  COMPLETED: "Completed",
};

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  DRAFT: "Draft",
  ISSUED: "Issued",
  PENDING_PAYMENT: "Payment Pending",
  PAID: "Paid",
  CANCELLED: "Cancelled",
};

export const DEMO_ACCOUNTS = [
  {
    email: "ahmad@example.com",
    password: "demo123",
    role: "HOMEOWNER" as const,
    name: "Ahmad Rahman",
  },
  {
    email: "admin@konsultan.co",
    password: "demo123",
    role: "CONSULTANT" as const,
    name: "Nurul Aisyah",
  },
] as const;
