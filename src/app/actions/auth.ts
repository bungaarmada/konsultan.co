"use server";

import { redirect } from "next/navigation";
import { clearSession, setSessionFromIdToken, signInWithPassword } from "@/lib/auth";
import { getUser } from "@/lib/db";
import { DEMO_ACCOUNTS } from "@/lib/constants";

export async function loginAction(formData: FormData) {
  if (!process.env.FIREBASE_WEB_API_KEY) redirect("/login?error=config");

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  const session = await signInWithPassword(email, password);
  if (!session) redirect("/login?error=invalid");

  await setSessionFromIdToken(session.idToken);
  const profile = await getUser(session.localId);
  redirect(profile?.role === "CONSULTANT" ? "/consultant" : "/homeowner");
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

export async function demoLoginAction(role: "HOMEOWNER" | "CONSULTANT") {
  if (!process.env.FIREBASE_WEB_API_KEY) redirect("/login?error=config");

  const account = DEMO_ACCOUNTS.find((item) => item.role === role);
  if (!account) redirect("/login?error=invalid");

  const session = await signInWithPassword(account.email, account.password);
  if (!session) redirect("/login?error=seed");

  await setSessionFromIdToken(session.idToken);
  redirect(role === "CONSULTANT" ? "/consultant" : "/homeowner");
}
