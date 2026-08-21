import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getProjectDetail, listContractors } from "@/lib/db";
import { filterWithinRadius } from "@/lib/geo";
import { CONTRACTOR_RADIUS_KM } from "@/lib/constants";
import { canPromptContractors } from "@/lib/workflow";
import { ContractorRadiusMap } from "@/components/homeowner/ContractorRadiusMap";
import { ContractorGrid } from "@/components/homeowner/ContractorGrid";
import { Button } from "@/components/ui/button";
import type { ContractorWithDistance } from "@/types";

export default async function ContractorMatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser("HOMEOWNER");
  const { id } = await params;
  const project = await getProjectDetail(id);
  if (!project || project.homeownerId !== user.id) notFound();
  if (!canPromptContractors(project) && !project.needsContractor) {
    redirect(`/homeowner/projects/${project.id}`);
  }

  const contractors = await listContractors(true);
  const nearby = filterWithinRadius(
    { latitude: project.latitude, longitude: project.longitude },
    contractors,
    CONTRACTOR_RADIUS_KM,
  ) as ContractorWithDistance[];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href={`/homeowner/projects/${project.id}`} className="hover:underline">
              {project.title}
            </Link>
          </p>
          <h1 className="font-heading text-3xl text-primary">Contractors within 20 km</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Distances use the Haversine formula from your site pin. Johor and other far listings are
            excluded automatically.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/homeowner/projects/${project.id}`}>Back to project</Link>
        </Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <ContractorRadiusMap
          origin={{
            latitude: project.latitude,
            longitude: project.longitude,
            label: project.siteAddress,
          }}
          contractors={nearby}
        />
        <div className="rounded-xl border border-border bg-card p-5 text-sm">
          <p className="font-medium">Matching rules</p>
          <ul className="mt-3 list-disc space-y-1 pl-4 text-muted-foreground">
            <li>Origin: {project.latitude.toFixed(5)}, {project.longitude.toFixed(5)}</li>
            <li>Radius: {CONTRACTOR_RADIUS_KM} km</li>
            <li>Active contractors only</li>
            <li>{nearby.length} result{nearby.length === 1 ? "" : "s"} after filter</li>
          </ul>
        </div>
      </div>
      <ContractorGrid
        projectId={project.id}
        contractors={nearby}
        selectedId={project.selectedContractorId}
      />
    </div>
  );
}
