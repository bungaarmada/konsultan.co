"use client";

import { STAGE_META, type StageName, type StageStatus } from "@/types";
import { STAGE_STATUS_OPTIONS } from "@/lib/workflow";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DocumentUploadCard } from "@/components/shared/DocumentUploadCard";
import { StageStatusBadge } from "@/components/shared/StageStatusBadge";
import { updateStageAction } from "@/app/actions/consultant";
import { useEffect, useState } from "react";

interface StageApprovalFormProps {
  projectId: string;
  stageName: StageName;
  status: StageStatus;
  remarks: string | null;
  endorsedDocUrl: string | null;
  locked?: boolean;
}

export function StageApprovalForm({
  projectId,
  stageName,
  status,
  remarks,
  endorsedDocUrl,
  locked,
}: StageApprovalFormProps) {
  const meta = STAGE_META[stageName];
  const [current, setCurrent] = useState<StageStatus>(status);

  useEffect(() => {
    setCurrent(status);
  }, [status]);

  return (
    <form action={updateStageAction} className="space-y-4 rounded-xl border border-border bg-card p-5">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="stageName" value={stageName} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-heading font-semibold">{meta.label}</h3>
          <p className="text-xs text-muted-foreground">{meta.full}</p>
        </div>
        <StageStatusBadge status={current} />
      </div>
      <p className="text-sm text-muted-foreground">{meta.description}</p>
      {locked ? (
        <p className="text-xs text-amber-700">Complete the previous stage before updating this one.</p>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor={`status-${stageName}`}>Status</Label>
        <select
          id={`status-${stageName}`}
          name="status"
          disabled={locked}
          value={current}
          onChange={(event) => setCurrent(event.target.value as StageStatus)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          {STAGE_STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`remarks-${stageName}`}>Notes / remarks</Label>
        <Textarea
          id={`remarks-${stageName}`}
          name="remarks"
          disabled={locked}
          defaultValue={remarks ?? ""}
          placeholder="Internal and homeowner-visible notes"
        />
      </div>
      <DocumentUploadCard
        name="endorsedFile"
        title="Endorsed file"
        subtitle="PDF or image"
        existing={endorsedDocUrl ? { fileName: "Endorsed document", fileUrl: endorsedDocUrl } : null}
        readOnly={locked}
      />
      <Button type="submit" disabled={locked}>
        Save stage
      </Button>
    </form>
  );
}
