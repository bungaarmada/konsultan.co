"use client";

import { useMemo, useState } from "react";
import { MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
}

interface MapPickerProps {
  defaultAddress?: string;
  defaultLat?: number;
  defaultLng?: number;
}

export function MapPicker({ defaultAddress = "", defaultLat, defaultLng }: MapPickerProps) {
  const [query, setQuery] = useState(defaultAddress);
  const [address, setAddress] = useState(defaultAddress);
  const [lat, setLat] = useState(defaultLat ?? 3.139);
  const [lng, setLng] = useState(defaultLng ?? 101.6869);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);

  const mapSrc = useMemo(
    () =>
      `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.04}%2C${lat - 0.03}%2C${lng + 0.04}%2C${lat + 0.03}&layer=mapnik&marker=${lat}%2C${lng}`,
    [lat, lng],
  );

  async function search() {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=my&q=${encodeURIComponent(query)}`;
      const response = await fetch(url, { headers: { Accept: "application/json" } });
      const data = (await response.json()) as NominatimResult[];
      setResults(data);
      if (data[0]) {
        applyResult(data[0]);
      }
    } finally {
      setSearching(false);
    }
  }

  function applyResult(result: NominatimResult) {
    setAddress(result.display_name);
    setLat(Number(result.lat));
    setLng(Number(result.lon));
    setQuery(result.display_name);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2 space-y-2">
          <Label htmlFor="siteSearch">Project site address</Label>
          <div className="flex gap-2">
            <Input
              id="siteSearch"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Malaysian address (e.g. Bangsar, Kuala Lumpur)"
            />
            <Button type="button" variant="secondary" onClick={search} disabled={searching}>
              <Search className="h-4 w-4" />
              {searching ? "…" : "Search"}
            </Button>
          </div>
        </div>
      </div>
      {results.length > 1 ? (
        <ul className="rounded-lg border border-border bg-card text-sm">
          {results.map((result) => (
            <li key={`${result.lat}-${result.lon}`}>
              <button
                type="button"
                className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-muted"
                onClick={() => applyResult(result)}
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {result.display_name}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="overflow-hidden rounded-xl border border-border">
        <iframe title="Site map" src={mapSrc} className="h-64 w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            name="latitude"
            type="number"
            step="any"
            required
            value={lat}
            onChange={(event) => setLat(Number(event.target.value))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            name="longitude"
            type="number"
            step="any"
            required
            value={lng}
            onChange={(event) => setLng(Number(event.target.value))}
          />
        </div>
      </div>
      <input type="hidden" name="siteAddress" value={address || query} />
      <p className="text-xs text-muted-foreground">
        Coordinates are stored for 20 km contractor matching (Haversine). Search uses OpenStreetMap Nominatim.
      </p>
    </div>
  );
}
