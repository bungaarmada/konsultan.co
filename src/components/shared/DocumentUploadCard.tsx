"use client";

import { useState } from "react";
import { FileText, Upload, Download, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DocumentUploadCardProps {
  title: string;
  subtitle?: string;
  existing?: { fileName: string; fileUrl: string } | null;
  name: string;
  accept?: string;
  required?: boolean;
  readOnly?: boolean;
}

export function DocumentUploadCard({
  title,
  subtitle,
  existing,
  name,
  accept = ".pdf,.png,.jpg,.jpeg,image/*",
  required,
  readOnly,
}: DocumentUploadCardProps) {
  const [file, setFile] = useState<File | null>(null);
  const previewName = file?.name ?? existing?.fileName;

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium">{title}</p>
            {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
            {previewName ? (
              <p className="mt-1 flex items-center gap-1 text-xs text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {previewName}
              </p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">No file uploaded</p>
            )}
          </div>
        </div>
        {existing?.fileUrl ? (
          <Button asChild variant="outline" size="sm">
            <a href={existing.fileUrl} download={existing.fileName}>
              <Download className="h-3.5 w-3.5" />
              Download
            </a>
          </Button>
        ) : null}
      </div>
      {!readOnly ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <label
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-4 py-5 text-center hover:bg-muted",
            )}
          >
            <Upload className="mb-2 h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">File / PDF</span>
            <input
              type="file"
              name={name}
              accept={accept}
              required={required && !existing && !file}
              className="sr-only"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
          </label>
          <label
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 px-4 py-5 text-center hover:bg-muted",
            )}
          >
            <Upload className="mb-2 h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Camera / scan</span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(event) => {
                const next = event.target.files?.[0] ?? null;
                setFile(next);
                const primary = document.querySelector<HTMLInputElement>(`input[name="${name}"]`);
                if (primary && next) {
                  const dt = new DataTransfer();
                  dt.items.add(next);
                  primary.files = dt.files;
                  primary.dispatchEvent(new Event("change", { bubbles: true }));
                }
              }}
            />
          </label>
        </div>
      ) : null}
    </div>
  );
}
