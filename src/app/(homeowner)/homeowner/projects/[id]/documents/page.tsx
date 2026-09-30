import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getProjectDetail } from "@/lib/db";
import { StageDocumentsBrowser } from "@/components/shared/StageDocumentsBrowser";
import { Button } from "@/components/ui/button";

export default async function HomeownerProjectDocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser("HOMEOWNER");
  const { id } = await params;
  const project = await getProjectDetail(id);
  if (!project || project.homeownerId !== user.id) notFound();

  const intake = project.documents.filter((d) =>
    ["INITIAL_GERAN", "INITIAL_IC", "INITIAL_SITE_PLAN"].includes(d.docType),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-3 -ml-2">
          <Link href={`/homeowner/projects/${project.id}`}>
            <ArrowLeft className="h-4 w-4" />
            Back to project
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground">Documents</p>
        <h1 className="font-heading text-2xl text-primary">{project.title}</h1>
      </div>

      <StageDocumentsBrowser
        homeownerId={project.homeownerId}
        documents={project.documents}
        intakeDocuments={intake}
      />
    </div>
  );
}
