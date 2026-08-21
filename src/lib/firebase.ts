import { existsSync, readFileSync } from "fs";
import { loadEnvConfig } from "@next/env";
import { cert, getApps, initializeApp, type App, type ServiceAccount } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";

loadEnvConfig(process.cwd());

function parseServiceAccount(): ServiceAccount {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) {
    return JSON.parse(json) as ServiceAccount;
  }

  const filePath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (filePath && existsSync(filePath)) {
    return JSON.parse(readFileSync(filePath, "utf8")) as ServiceAccount;
  }

  throw new Error(
    "Firebase credentials missing. Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH.",
  );
}

function storageBucket() {
  const bucket = process.env.FIREBASE_STORAGE_BUCKET;
  if (!bucket) {
    throw new Error("FIREBASE_STORAGE_BUCKET is not set.");
  }
  return bucket;
}

function getFirebaseApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  return initializeApp({
    credential: cert(parseServiceAccount()),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || undefined,
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
}

export function adminAuth(): Auth {
  return getAuth(getFirebaseApp());
}

export function firestore(): Firestore {
  return getFirestore(getFirebaseApp());
}

export function adminStorage(): Storage {
  return getStorage(getFirebaseApp());
}

export function storageBucketName() {
  return storageBucket();
}

export function firebaseWebApiKey() {
  const key = process.env.FIREBASE_WEB_API_KEY;
  if (!key) {
    throw new Error("FIREBASE_WEB_API_KEY is not set.");
  }
  return key;
}
