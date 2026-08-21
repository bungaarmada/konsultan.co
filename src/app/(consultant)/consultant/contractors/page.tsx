import { requireUser } from "@/lib/auth";
import { listContractors } from "@/lib/db";
import { ContractorDirectory } from "@/components/consultant/ContractorDirectory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createContractorAction } from "@/app/actions/consultant";

export default async function ContractorsPage() {
  await requireUser("CONSULTANT");
  const contractors = await listContractors();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">Consultant desk</p>
        <h1 className="font-heading text-3xl text-primary">Contractor directory</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Listings are filtered for homeowners using Haversine distance from the project pin (default 20 km).
        </p>
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <ContractorDirectory contractors={contractors} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Add contractor</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createContractorAction} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company name</Label>
              <Input id="companyName" name="companyName" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="regNumber">Registration / CIDB</Label>
              <Input id="regNumber" name="regNumber" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input id="latitude" name="latitude" type="number" step="any" required defaultValue="3.139" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input id="longitude" name="longitude" type="number" step="any" required defaultValue="101.6869" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="badge">Badge</Label>
              <Input id="badge" name="badge" placeholder="CIDB G7" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="specialties">Specialties</Label>
              <Input id="specialties" name="specialties" placeholder="Bungalow, Semi-D" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">Rating</Label>
              <Input id="rating" name="rating" type="number" step="0.1" min="0" max="5" defaultValue="4.5" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="coverageRadiusKm">Coverage radius (km)</Label>
              <Input id="coverageRadiusKm" name="coverageRadiusKm" type="number" defaultValue="20" />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Save contractor</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
