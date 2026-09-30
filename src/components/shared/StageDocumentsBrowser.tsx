"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DocumentList } from "@/components/shared/DocumentList";
import { documentsForStage } from "@/lib/stage-documents";
import { STAGE_META, STAGE_ORDER } from "@/types";

type DocRow = {
  id: string;
  docType: string;
  fileName: string;
  fileUrl: string;
  status: string;
  stageName: string | null;
  version: number;
  uploadedAt: Date;
  uploaderId: string;
};

export function StageDocumentsBrowser({
  homeownerId,
  documents,
  intakeDocuments,
}: {
  homeownerId: string;
  documents: DocRow[];
  intakeDocuments: DocRow[];
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-lg">Registration</h2>
        <p className="mb-3 text-sm text-muted-foreground">Documents submitted when the project was registered.</p>
        {intakeDocuments.length ? (
          <DocumentList documents={intakeDocuments} />
        ) : (
          <p className="rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
            No registration documents yet.
          </p>
        )}
      </div>

      <div>
        <h2 className="font-heading mb-1 text-lg">Browse documents by stage</h2>
        <p className="mb-3 text-sm text-muted-foreground">Expand a stage to see files by who uploaded them.</p>
        <Accordion type="multiple" defaultValue={[STAGE_ORDER[0]]} className="rounded-xl border border-border bg-card px-4">
          {STAGE_ORDER.map((stageName) => {
            const meta = STAGE_META[stageName];
            const stageDocs = documentsForStage(stageName, documents);
            const fromHomeowner = stageDocs.filter((d) => d.uploaderId === homeownerId);
            const fromConsultant = stageDocs.filter((d) => d.uploaderId !== homeownerId);

            return (
              <AccordionItem key={stageName} value={stageName}>
                <AccordionTrigger>
                  <div className="text-left">
                    <p className="font-heading text-base">{meta.label}</p>
                    <p className="text-xs font-normal text-muted-foreground">{meta.full}</p>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-5">
                  <div>
                    <h4 className="mb-2 text-sm font-semibold">From consultant</h4>
                    {fromConsultant.length ? (
                      <DocumentList documents={fromConsultant} />
                    ) : (
                      <p className="text-sm text-muted-foreground">No consultant documents yet.</p>
                    )}
                  </div>
                  <div>
                    <h4 className="mb-2 text-sm font-semibold">From homeowner</h4>
                    {fromHomeowner.length ? (
                      <DocumentList documents={fromHomeowner} />
                    ) : (
                      <p className="text-sm text-muted-foreground">No homeowner documents yet.</p>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>
    </div>
  );
}
