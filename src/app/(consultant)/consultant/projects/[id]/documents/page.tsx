import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getProjectDetail } from "@/lib/db";
import { StageDocumentsBrowser } from "@/components/shared/StageDocumentsBrowser";
import { Button } from "@/components/ui/button";
import { submitProjectAction } from "@/app/actions/projects";

export default async function ConsultantProjectDocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireUser("CONSULTANT");
  const { id } = await params;
  const project = await getProjectDetail(id);
  if (!project) notFound();

  const intake = project.documents.filter((d) =>
    ["INITIAL_GERAN", "INITIAL_IC", "INITIAL_SITE_PLAN"].includes(d.docType),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
          <Link href={`/consultant/projects/${project.id}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to project
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground">
          {project.homeowner.name} · Submitted documents
        </p>
        <h1 className="font-heading text-2xl text-primary">{project.title}</h1>
      </div>

      {project.status === "DRAFT" ? (
        <form action={submitProjectAction.bind(null, project.id)}>
          <Button type="submit">Move to review</Button>
        </form>
      ) : null}

      <StageDocumentsBrowser
        homeownerId={project.homeownerId}
        documents={project.documents}
        intakeDocuments={intake}
      />
    </div>
  );
}
