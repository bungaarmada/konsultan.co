"use client";

import { DocumentUploadCard } from "@/components/shared/DocumentUploadCard";
import { MapPicker } from "@/components/homeowner/MapPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProjectAction } from "@/app/actions/projects";
import { INITIAL_DOC_TYPES } from "@/types";
import { DEFAULT_TOTAL_FEE } from "@/lib/billing";

export function ProjectForm({
  mode = "HOMEOWNER",
}: {
  mode?: "HOMEOWNER" | "CONSULTANT";
}) {
  return (
    <form action={createProjectAction} className="space-y-8">
      {mode === "CONSULTANT" ? (
        <div className="space-y-2">
          <Label htmlFor="homeownerEmail">Homeowner email</Label>
          <Input
            id="homeownerEmail"
            name="homeownerEmail"
            type="email"
            required
            placeholder="ahmad@example.com"
          />
          <p className="text-xs text-muted-foreground">
            Must match an existing homeowner account.
          </p>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="title">Project title</Label>
          <Input id="title" name="title" required placeholder="e.g. Bangsar Bungalow Rebuild" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ownerName">Owner name</Label>
          <Input id="ownerName" name="ownerName" required placeholder="Full name as on geran" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ownerIc">Owner IC</Label>
          <Input id="ownerIc" name="ownerIc" placeholder="Optional · used on Surat Lantikan" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ownerContact">Contact</Label>
          <Input id="ownerContact" name="ownerContact" required placeholder="Phone or email" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="totalFee">Total consultant fee (RM)</Label>
          <Input
            id="totalFee"
            name="totalFee"
            type="number"
            min={1}
            step="0.01"
            defaultValue={DEFAULT_TOTAL_FEE}
            required
          />
          <p className="text-xs text-muted-foreground">
            Milestone percentages are fixed (20 / 15+15 / 40 / 10).
          </p>
        </div>
      </div>

      <MapPicker />

      <div>
        <h3 className="font-heading mb-3 text-sm font-semibold">Initial documents</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {INITIAL_DOC_TYPES.map((doc) => (
            <DocumentUploadCard
              key={doc.type}
              name={doc.type === "INITIAL_GERAN" ? "geran" : doc.type === "INITIAL_IC" ? "ic" : "sitePlan"}
              title={doc.label}
              subtitle={doc.malay}
              required
              accept="image/*,.pdf"
            />
          ))}
        </div>
      </div>

      <Button type="submit" size="lg">
        Save project
      </Button>
    </form>
  );
}
