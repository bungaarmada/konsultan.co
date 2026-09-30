import { STAGE_DOC_TYPE, type DocType, type StageName } from "@/types";

/** Stage-scoped documents. Invoices only match when `stageName` is set on the row. */
export function documentsForStage<T extends { docType: string; stageName: string | null }>(
  stageName: StageName,
  documents: T[],
): T[] {
  const types = STAGE_DOC_TYPE[stageName];
  return documents.filter((d) => {
    if (d.stageName === stageName) return true;
    if (d.docType === "INVOICE") return false;
    return d.stageName === null && types.includes(d.docType as DocType);
  });
}
