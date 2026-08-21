import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { countProjectsByStatus, listProjectRows } from "@/lib/db";
import { ProjectStatusTable } from "@/components/consultant/ProjectStatusTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "@/types";

const FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "IN_REVIEW", label: "In review" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "PAYMENT_PENDING", label: "Payment pending" },
  { value: "COMPLETED", label: "Completed" },
  { value: "DRAFT", label: "Draft" },
];

export default async function ConsultantDashboard({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireUser("CONSULTANT");
  const { status } = await searchParams;
  const filter = status && status !== "all" ? (status as ProjectStatus) : undefined;

  const [projects, countMap] = await Promise.all([
    listProjectRows(filter ? { status: filter } : undefined),
    countProjectsByStatus(),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Consultant desk</p>
          <h1 className="font-heading text-3xl text-primary">Active projects</h1>
        </div>
        <Button asChild>
          <Link href="/consultant/projects/new">
            <Plus className="h-4 w-4" />
            New project
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">In review</p>
            <p className="font-heading mt-1 text-3xl">{countMap.IN_REVIEW ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">In progress</p>
            <p className="font-heading mt-1 text-3xl">{countMap.IN_PROGRESS ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Completed</p>
            <p className="font-heading mt-1 text-3xl">{countMap.COMPLETED ?? 0}</p>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <Link
            key={item.value}
            href={item.value === "all" ? "/consultant" : `/consultant?status=${item.value}`}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium",
              (status ?? "all") === item.value
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <ProjectStatusTable projects={projects} />
      </div>
    </div>
  );
}
