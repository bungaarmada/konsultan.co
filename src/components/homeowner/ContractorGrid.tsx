import { Star, Phone, Mail, BadgeCheck, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistance } from "@/lib/geo";
import { inquireContractorAction } from "@/app/actions/projects";
import type { ContractorWithDistance } from "@/types";

export function ContractorGrid({
  projectId,
  contractors,
  selectedId,
}: {
  projectId: string;
  contractors: ContractorWithDistance[];
  selectedId?: string | null;
}) {
  if (contractors.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No active contractors found within 20 km of this site.
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {contractors.map((contractor) => {
        const selected = selectedId === contractor.id;
        return (
          <Card key={contractor.id} className={selected ? "ring-2 ring-accent" : undefined}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-heading text-base font-semibold">{contractor.companyName}</h3>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {formatDistance(contractor.distanceKm)} · {contractor.address}
                  </p>
                </div>
                {contractor.badge ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    <BadgeCheck className="h-3 w-3" />
                    {contractor.badge}
                  </span>
                ) : null}
              </div>
              <div className="mt-3 flex items-center gap-1 text-sm">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <span className="font-medium">{contractor.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">({contractor.reviewCount} reviews)</span>
              </div>
              {contractor.specialties ? (
                <p className="mt-2 text-xs text-muted-foreground">{contractor.specialties}</p>
              ) : null}
              <div className="mt-3 space-y-1 text-xs">
                <p className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-primary" />
                  {contractor.phone}
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                  {contractor.email}
                </p>
              </div>
              <form action={inquireContractorAction} className="mt-4">
                <input type="hidden" name="projectId" value={projectId} />
                <input type="hidden" name="contractorId" value={contractor.id} />
                <Button type="submit" className="w-full" variant={selected ? "brass" : "default"}>
                  {selected ? "Selected" : "Inquire / Select"}
                </Button>
              </form>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
