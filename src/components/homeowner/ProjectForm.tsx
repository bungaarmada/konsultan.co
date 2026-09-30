"use client";

import { useState } from "react";
import Link from "next/link";
import { DocumentUploadCard } from "@/components/shared/DocumentUploadCard";
import { MapPicker } from "@/components/homeowner/MapPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProjectAction } from "@/app/actions/projects";
import { INITIAL_DOC_TYPES } from "@/types";
import { DEFAULT_TOTAL_FEE } from "@/lib/billing";

export type ProjectFormClient = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
};

export function ProjectForm({
  mode = "HOMEOWNER",
  clients = [],
  defaultClientId,
}: {
  mode?: "HOMEOWNER" | "CONSULTANT";
  clients?: ProjectFormClient[];
  defaultClientId?: string;
}) {
  const [clientId, setClientId] = useState(
    defaultClientId && clients.some((client) => client.id === defaultClientId)
      ? defaultClientId
      : (clients[0]?.id ?? ""),
  );
  const selected = clients.find((client) => client.id === clientId);

  if (mode === "CONSULTANT" && clients.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center">
        <p className="font-heading text-lg text-primary">Register a client first</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Create a homeowner account and password, then start a project. The client will use those
          credentials to sign in and upload geran, IC, and site plan.
        </p>
        <Button asChild className="mt-5">
          <Link href="/consultant/clients">Add client</Link>
        </Button>
      </div>
    );
  }

  return (
    <form action={createProjectAction} className="space-y-8">
      {mode === "CONSULTANT" ? (
        <div className="space-y-2">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <Label htmlFor="homeownerId">Client</Label>
              <select
                id="homeownerId"
                name="homeownerId"
                required
                value={clientId}
                onChange={(event) => setClientId(event.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} · {client.email}
                  </option>
                ))}
              </select>
            </div>
            <Button asChild variant="outline">
              <Link href="/consultant/clients">Add client</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Give this client their login email and password so they can open the homeowner portal.
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
          <Input
            key={`${clientId}-name`}
            id="ownerName"
            name="ownerName"
            required
            placeholder="Full name as on geran"
            defaultValue={mode === "CONSULTANT" ? (selected?.name ?? "") : undefined}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ownerIc">Owner IC</Label>
          <Input id="ownerIc" name="ownerIc" placeholder="Optional · used on Surat Lantikan" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ownerContact">Contact</Label>
          <Input
            key={`${clientId}-contact`}
            id="ownerContact"
            name="ownerContact"
            required
            placeholder="Phone or email"
            defaultValue={
              mode === "CONSULTANT" ? (selected?.phone || selected?.email || "") : undefined
            }
          />
        </div>
        {mode === "CONSULTANT" ? (
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
              Stage percentages are fixed (20 / 15+15 / 40 / 10).
            </p>
          </div>
        ) : null}
        <div className="sm:col-span-2 flex items-start gap-3 rounded-lg border border-border bg-card px-4 py-3">
          <input
            id="usesLppsa"
            name="usesLppsa"
            type="checkbox"
            value="true"
            className="mt-1 h-4 w-4 rounded border-input accent-primary"
          />
          <div>
            <Label htmlFor="usesLppsa" className="cursor-pointer font-medium">
              LPPSA financing
            </Label>
            <p className="text-xs text-muted-foreground">
              Check if this project will be financed through LPPSA.
            </p>
          </div>
        </div>
      </div>

      <MapPicker />

      {mode === "CONSULTANT" ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-5 py-6">
          <input type="hidden" name="requestHomeownerUpload" value="true" />
          <h3 className="font-heading text-sm font-semibold">Intake documents</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            After you save, the homeowner will be asked to upload geran, IC, and site plan in their
            portal. Share their login credentials so they can complete this step.
          </p>
        </div>
      ) : (
        <div>
          <h3 className="font-heading mb-3 text-sm font-semibold">Initial documents</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {INITIAL_DOC_TYPES.map((doc) => (
              <DocumentUploadCard
                key={doc.type}
                name={
                  doc.type === "INITIAL_GERAN" ? "geran" : doc.type === "INITIAL_IC" ? "ic" : "sitePlan"
                }
                title={doc.label}
                subtitle={doc.malay}
                required
                accept="image/*,.pdf"
              />
            ))}
          </div>
        </div>
      )}

      <Button type="submit" size="lg">
        Save project
      </Button>
    </form>
  );
}
