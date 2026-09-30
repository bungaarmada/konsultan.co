"use server";

import { revalidatePath } from "next/cache";
import { createHomeownerAccount, requireUser } from "@/lib/auth";

export type CreateClientState = {
  error?: string;
  created?: {
    id: string;
    name: string;
    email: string;
    password: string;
  };
} | null;

export async function createClientAction(
  _prev: CreateClientState,
  formData: FormData,
): Promise<CreateClientState> {
  const user = await requireUser("CONSULTANT");
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const password = String(formData.get("password") ?? "");

  const result = await createHomeownerAccount({
    email,
    password,
    name,
    phone,
    createdById: user.id,
  });

  if (!result.ok) return { error: result.error };

  revalidatePath("/consultant/clients");
  revalidatePath("/consultant/projects/new");

  return {
    created: {
      id: result.id,
      name,
      email,
      password,
    },
  };
}
