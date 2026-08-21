"use client";

import { useMemo } from "react";
import { formatDistance } from "@/lib/geo";
import type { ContractorWithDistance } from "@/types";

interface ContractorRadiusMapProps {
  origin: { latitude: number; longitude: number; label: string };
  contractors: ContractorWithDistance[];
}

export function ContractorRadiusMap({ origin, contractors }: ContractorRadiusMapProps) {
  const delta = 0.22;
  const mapSrc = useMemo(
    () =>
      `https://www.openstreetmap.org/export/embed.html?bbox=${origin.longitude - delta}%2C${origin.latitude - delta * 0.75}%2C${origin.longitude + delta}%2C${origin.latitude + delta * 0.75}&layer=mapnik&marker=${origin.latitude}%2C${origin.longitude}`,
    [origin.latitude, origin.longitude],
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <iframe title="20km contractor radius" src={mapSrc} className="h-72 w-full" />
      <div className="border-t border-border p-4">
        <p className="text-sm font-medium">Site · {origin.label}</p>
        <p className="text-xs text-muted-foreground">
          Showing {contractors.length} certified contractor{contractors.length === 1 ? "" : "s"} within 20 km
        </p>
        <ul className="mt-3 max-h-40 space-y-1 overflow-auto text-xs">
          {contractors.map((contractor) => (
            <li key={contractor.id} className="flex justify-between gap-2">
              <span className="truncate">{contractor.companyName}</span>
              <span className="shrink-0 text-muted-foreground">{formatDistance(contractor.distanceKm)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
