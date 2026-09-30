import { requireUser } from "@/lib/auth";
import { listHomeowners, listProjects } from "@/lib/db";
import { ClientDirectory } from "@/components/consultant/ClientDirectory";
import { ClientRegisterForm } from "@/components/consultant/ClientRegisterForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ConsultantClientsPage() {
  await requireUser("CONSULTANT");
  const [clients, projects] = await Promise.all([listHomeowners(), listProjects()]);
  const countByHomeowner = new Map<string, number>();
  for (const project of projects) {
    countByHomeowner.set(project.homeownerId, (countByHomeowner.get(project.homeownerId) ?? 0) + 1);
  }

  const rows = clients.map((client) => ({
    ...client,
    projectCount: countByHomeowner.get(client.id) ?? 0,
  }));

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <p className="text-sm text-muted-foreground">Consultant desk</p>
        <h1 className="font-heading text-3xl text-primary">Clients</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Register a homeowner with an email and password, then share those credentials so they can
          open the portal and upload intake documents.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <ClientDirectory clients={rows} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add client</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientRegisterForm />
        </CardContent>
      </Card>
    </div>
  );
}
