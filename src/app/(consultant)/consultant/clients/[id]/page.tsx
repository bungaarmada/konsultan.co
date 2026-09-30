import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getUser, listProjectRows } from "@/lib/db";
import { ProjectStatusTable } from "@/components/consultant/ProjectStatusTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export default async function ConsultantClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser("CONSULTANT");
  const { id } = await params;
  const client = await getUser(id);
  if (!client || client.role !== "HOMEOWNER") notFound();

  const projects = await listProjectRows({ homeownerId: client.id });

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
          <Link href="/consultant/clients">
            <ArrowLeft className="h-4 w-4" />
            Back to clients
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground">Client</p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl text-primary">{client.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{client.email}</p>
          </div>
          <Button asChild>
            <Link href={`/consultant/projects/new?client=${client.id}`}>New project</Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Portal login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm">
          <p>
            Email: <span className="font-medium">{client.email}</span>
          </p>
          {client.phone ? <p className="text-muted-foreground">Phone {client.phone}</p> : null}
          <p className="text-muted-foreground">Registered {formatDate(client.createdAt)}</p>
          <p className="pt-2 text-xs text-muted-foreground">
            The password is only shown when you first register the client. Share it with them so they
            can sign in at the homeowner portal.
          </p>
        </CardContent>
      </Card>

      <div>
        <h2 className="font-heading mb-3 text-xl">Projects</h2>
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <ProjectStatusTable projects={projects} />
        </div>
      </div>
    </div>
  );
}
