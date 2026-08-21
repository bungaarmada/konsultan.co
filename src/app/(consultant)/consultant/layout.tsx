import { AppShell } from "@/components/shared/AppShell";
import { requireUser } from "@/lib/auth";

export default async function ConsultantLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("CONSULTANT");
  return <AppShell user={user}>{children}</AppShell>;
}
