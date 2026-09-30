import { DocumentList } from "@/components/shared/DocumentList";
import { documentsForStage } from "@/lib/stage-documents";
import { DOCUMENT_GROUPS, type DocType, type StageName } from "@/types";

type DocRow = {
  id: string;
  docType: string;
  fileName: string;
  fileUrl: string;
  status: string;
  stageName: string | null;
  version: number;
  uploadedAt: Date;
};

function docsForGroup(groupKey: "INTAKE" | StageName, docTypes: DocType[], documents: DocRow[]) {
  if (groupKey === "INTAKE") {
    return documents.filter((d) => docTypes.includes(d.docType as DocType));
  }
  return documentsForStage(groupKey, documents);
}

export function HomeownerDocuments({ documents }: { documents: DocRow[] }) {
  return (
    <div className="space-y-6">
      {DOCUMENT_GROUPS.map((group) => {
        const combined = docsForGroup(group.key, group.docTypes, documents).sort(
          (a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime(),
        );

        return (
          <div key={group.key}>
            <div className="mb-2">
              <p className="text-sm font-semibold">{group.label}</p>
              <p className="text-xs text-muted-foreground">{group.malay}</p>
            </div>
            {combined.length ? (
              <DocumentList documents={combined} />
            ) : (
              <p className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
                No documents yet.
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
