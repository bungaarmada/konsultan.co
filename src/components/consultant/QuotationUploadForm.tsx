import { DocumentUploadCard } from "@/components/shared/DocumentUploadCard";
import { Button } from "@/components/ui/button";
import { uploadConsultantDocsAction } from "@/app/actions/consultant";

export function QuotationUploadForm({
  projectId,
  quotation,
  surat,
}: {
  projectId: string;
  quotation?: { fileName: string; fileUrl: string } | null;
  surat?: { fileName: string; fileUrl: string } | null;
}) {
  return (
    <form action={uploadConsultantDocsAction} className="space-y-4">
      <input type="hidden" name="projectId" value={projectId} />
      <div className="grid gap-4 md:grid-cols-2">
        <DocumentUploadCard
          name="quotation"
          title="Quotation"
          subtitle="quotation_doc"
          existing={quotation}
        />
        <DocumentUploadCard
          name="suratLantikan"
          title="Surat Lantikan"
          subtitle="Letter of Appointment"
          existing={surat}
        />
      </div>
      <Button type="submit">Upload to homeowner</Button>
    </form>
  );
}
