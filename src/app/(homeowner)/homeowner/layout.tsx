import { AppShell } from "@/components/shared/AppShell";
import { requireUser } from "@/lib/auth";

export default async function HomeownerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("HOMEOWNER");
  return <AppShell user={user}>{children}</AppShell>;
}
