import { ProjectForm } from "@/components/homeowner/ProjectForm";
import { requireUser } from "@/lib/auth";
import { listHomeowners } from "@/lib/db";

export default async function ConsultantNewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; client?: string }>;
}) {
  await requireUser("CONSULTANT");
  const { error, client } = await searchParams;
  const clients = await listHomeowners();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Consultant portal</p>
        <h1 className="font-heading text-3xl text-primary">Create project</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose a registered client. They will upload geran, IC, and site plan after signing in with
          the credentials you provided.
        </p>
      </div>
      {error === "missing" ? (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Incomplete fields or client not found. Register the client first if they do not appear in
          the list.
        </p>
      ) : null}
      <ProjectForm mode="CONSULTANT" clients={clients} defaultClientId={client} />
    </div>
  );
}
