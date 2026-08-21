import { ProjectForm } from "@/components/homeowner/ProjectForm";
import { requireUser } from "@/lib/auth";

export default async function ConsultantNewProjectPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireUser("CONSULTANT");
  const { error } = await searchParams;
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Consultant portal</p>
        <h1 className="font-heading text-3xl text-primary">Create project</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Register a project for an existing homeowner and capture intake documents.
        </p>
      </div>
      {error === "missing" ? (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Missing fields or homeowner email not found.
        </p>
      ) : null}
      <ProjectForm mode="CONSULTANT" />
    </div>
  );
}
