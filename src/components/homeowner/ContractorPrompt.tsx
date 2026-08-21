import { HardHat } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { setContractorPreferenceAction } from "@/app/actions/projects";

export function ContractorPrompt({ projectId }: { projectId: string }) {
  return (
    <Card className="border-accent/40 bg-accent/5">
      <CardHeader>
        <div className="flex items-center gap-2 text-accent">
          <HardHat className="h-5 w-5" />
          <CardTitle>Certified contractors nearby</CardTitle>
        </div>
        <CardDescription>
          Nak contractor ke? Peringkat 3 is open — we can recommend certified contractors within
          20 km of your project site.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <form action={setContractorPreferenceAction.bind(null, projectId, true)}>
          <Button type="submit" variant="brass">
            Yes, show contractors
          </Button>
        </form>
        <form action={setContractorPreferenceAction.bind(null, projectId, false)}>
          <Button type="submit" variant="outline">
            No thanks
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
