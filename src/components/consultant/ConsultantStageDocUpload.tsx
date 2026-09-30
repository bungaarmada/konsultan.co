"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DocumentUploadCard } from "@/components/shared/DocumentUploadCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { uploadConsultantStageDocAction } from "@/app/actions/consultant";
import { STAGE_META, STAGE_ORDER, type DocType, type StageName } from "@/types";

const DOC_TYPE_OPTIONS: { value: DocType; label: string; stages?: StageName[] }[] = [
  { value: "QUOTATION", label: "Quotation", stages: ["SCHEMATIC"] },
  { value: "SURAT_LANTIKAN", label: "Surat Lantikan", stages: ["SCHEMATIC"] },
  { value: "FINAL_DESIGN_DRAWING", label: "Design drawing", stages: ["DESIGN_DEV"] },
  { value: "BORANG_B", label: "Borang B / 3rd-party form", stages: ["CONTRACT_DOC"] },
  { value: "CCC", label: "CCC", stages: ["CONTRACT_IMPL"] },
  { value: "OTHER", label: "Other document" },
];

export function ConsultantStageDocUpload({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);
  const [stageName, setStageName] = useState<StageName>("SCHEMATIC");

  const typeOptions = DOC_TYPE_OPTIONS.filter(
    (option) => !option.stages || option.stages.includes(stageName),
  );

  if (!open) {
    return (
      <Button type="button" className="w-full" variant="brass" onClick={() => setOpen(true)}>
        Upload document
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Upload document</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={uploadConsultantStageDocAction} className="space-y-4">
          <input type="hidden" name="projectId" value={projectId} />
          <div className="space-y-2">
            <Label htmlFor="stageName">Stage</Label>
            <select
              id="stageName"
              name="stageName"
              required
              value={stageName}
              onChange={(event) => setStageName(event.target.value as StageName)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {STAGE_ORDER.map((key) => (
                <option key={key} value={key}>
                  {STAGE_META[key].label} · {STAGE_META[key].full}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="docType">Document type</Label>
            <select
              id="docType"
              name="docType"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              defaultValue={typeOptions[0]?.value}
              key={stageName}
            >
              {typeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <DocumentUploadCard
            name="file"
            title="File"
            subtitle="PDF, image, or scan"
            required
            accept=".pdf,.png,.jpg,.jpeg,image/*"
          />
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Upload
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
