import { createHash } from "crypto";

export function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

export function verifyPassword(password: string, hashed: string) {
  return hashPassword(password) === hashed;
}
