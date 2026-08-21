import Link from "next/link";
import { HardHat, LayoutDashboard, FolderKanban, LogOut, Plus, Users } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { initials } from "@/lib/utils";
import type { SessionUser } from "@/types";
import { cn } from "@/lib/utils";

const homeownerNav = [
  { href: "/homeowner", label: "Projects", icon: LayoutDashboard },
  { href: "/homeowner/projects/new", label: "New project", icon: Plus },
];

const consultantNav = [
  { href: "/consultant", label: "Projects", icon: FolderKanban },
  { href: "/consultant/projects/new", label: "New project", icon: Plus },
  { href: "/consultant/contractors", label: "Contractors", icon: Users },
];

export function AppShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const nav = user.role === "CONSULTANT" ? consultantNav : homeownerNav;

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground md:flex md:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
          <HardHat className="h-5 w-5 text-accent" />
          <span className="font-heading text-lg tracking-tight">Konsultan.co</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-sidebar-border p-4">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-sidebar-foreground/60">{user.role === "CONSULTANT" ? "Consultant" : "Homeowner"}</p>
          <form action={logoutAction} className="mt-3">
            <Button type="submit" variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </form>
        </div>
      </aside>
      <div className="md:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-2 md:hidden">
            <HardHat className="h-5 w-5 text-accent" />
            <span className="font-heading font-semibold">Konsultan.co</span>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <div
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground",
              )}
            >
              {initials(user.name)}
            </div>
          </div>
        </header>
        <nav className="flex gap-2 overflow-x-auto border-b border-border px-4 py-2 md:hidden">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
              {item.label}
            </Link>
          ))}
        </nav>
        <main className="px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
