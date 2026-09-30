import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminAuth, firebaseWebApiKey } from "@/lib/firebase";
import { getUser, getUserByEmail, upsertUserProfile } from "@/lib/db";
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

export async function createHomeownerAccount(input: {
  email: string;
  password: string;
  name: string;
  phone: string | null;
  createdById: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const password = input.password;
  const phone = input.phone?.trim() || null;

  if (!name) return { ok: false, error: "Enter the client's name." };
  if (!email) return { ok: false, error: "Enter the client's email." };
  if (password.length < 6) return { ok: false, error: "Password must be at least 6 characters." };

  const existingProfile = await getUserByEmail(email);
  if (existingProfile) return { ok: false, error: "A client with this email already exists." };

  try {
    const created = await adminAuth().createUser({
      email,
      password,
      displayName: name,
    });
    await adminAuth().setCustomUserClaims(created.uid, { role: "HOMEOWNER" });
    await upsertUserProfile({
      id: created.uid,
      name,
      email,
      role: "HOMEOWNER",
      phone,
      createdById: input.createdById,
      createdAt: new Date(),
    });
    return { ok: true, id: created.uid };
  } catch (error) {
    const code =
      typeof error === "object" && error && "code" in error ? String((error as { code?: string }).code) : "";
    if (code === "auth/email-already-exists") {
      return { ok: false, error: "A client with this email already exists." };
    }
    if (code === "auth/invalid-email") {
      return { ok: false, error: "Enter a valid email address." };
    }
    if (code === "auth/weak-password") {
      return { ok: false, error: "Password must be at least 6 characters." };
    }
    return { ok: false, error: "Could not create the client account." };
  }
}
