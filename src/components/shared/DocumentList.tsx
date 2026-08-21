"use client";

import { FileText, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";

const DOC_LABELS: Record<string, string> = {
  INITIAL_GERAN: "Land Title / Geran Tanah",
  INITIAL_IC: "Identification / Salinan IC",
  INITIAL_SITE_PLAN: "Site Plan / Pelan Tapak",
  QUOTATION: "Quotation",
  SURAT_LANTIKAN: "Letter of Appointment / Surat Lantikan",
  INVOICE: "Invoice",
  FINAL_DESIGN_DRAWING: "Final Design Drawings",
  BORANG_B: "Borang B",
  CCC: "CCC / Certificate of Completion",
};

export function DocumentList({
  documents,
}: {
  documents: {
    id: string;
    docType: string;
    fileName: string;
    fileUrl: string;
    version: number;
    uploadedAt: Date;
  }[];
}) {
  if (documents.length === 0) {
    return <p className="text-sm text-muted-foreground">No documents available yet.</p>;
  }

  return (
    <ul className="divide-y divide-border rounded-xl border border-border bg-card">
      {documents.map((doc) => (
        <li key={doc.id} className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <FileText className="h-4 w-4 shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{DOC_LABELS[doc.docType] ?? doc.docType}</p>
              <p className="truncate text-xs text-muted-foreground">
                {doc.fileName} · v{doc.version} · {formatDateTime(doc.uploadedAt)}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button asChild variant="ghost" size="icon">
              <a href={doc.fileUrl} target="_blank" rel="noreferrer">
                <Eye className="h-4 w-4" />
              </a>
            </Button>
            <Button asChild variant="ghost" size="icon">
              <a href={doc.fileUrl} download={doc.fileName}>
                <Download className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
