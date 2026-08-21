import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth, firebaseWebApiKey } from "@/lib/firebase";
import { getUser } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/constants";
import type { SessionUser, UserRole } from "@/types";

const SESSION_MS = 1000 * 60 * 60 * 24 * 14;

type SignInResult = {
  idToken: string;
  localId: string;
};

export async function signInWithPassword(email: string, password: string): Promise<SignInResult | null> {
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseWebApiKey()}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    },
  );
  if (!response.ok) return null;
  const data = (await response.json()) as { idToken?: string; localId?: string };
  if (!data.idToken || !data.localId) return null;
  return { idToken: data.idToken, localId: data.localId };
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const store = await cookies();
  const session = store.get(SESSION_COOKIE)?.value;
  if (!session) return null;

  try {
    const decoded = await adminAuth().verifySessionCookie(session, true);
    const profile = await getUser(decoded.uid);
    const claimRole = decoded.role === "CONSULTANT" ? "CONSULTANT" : "HOMEOWNER";
    if (profile) {
      return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        phone: profile.phone,
      };
    }
    return {
      id: decoded.uid,
      name: decoded.name ?? decoded.email ?? "User",
      email: decoded.email ?? "",
      role: claimRole,
      phone: null,
    };
  } catch {
    return null;
  }
}

export async function requireUser(role?: UserRole): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (role && user.role !== role) {
    redirect(user.role === "CONSULTANT" ? "/consultant" : "/homeowner");
  }
  return user;
}

export async function setSessionFromIdToken(idToken: string) {
  const sessionCookie = await adminAuth().createSessionCookie(idToken, { expiresIn: SESSION_MS });
  const store = await cookies();
  store.set(SESSION_COOKIE, sessionCookie, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MS / 1000,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
