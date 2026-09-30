import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface ClientRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: Date;
  projectCount: number;
}

export function ClientDirectory({ clients }: { clients: ClientRow[] }) {
  if (clients.length === 0) {
    return (
      <p className="p-6 text-sm text-muted-foreground">
        No clients yet. Register a homeowner to create their portal login.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Projects</TableHead>
          <TableHead>Registered</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <TableRow key={client.id}>
            <TableCell>
              <Link href={`/consultant/clients/${client.id}`} className="font-medium hover:underline">
                {client.name}
              </Link>
              <p className="text-xs text-muted-foreground">{client.email}</p>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">{client.phone ?? "—"}</TableCell>
            <TableCell>{client.projectCount}</TableCell>
            <TableCell className="text-muted-foreground">{formatDate(client.createdAt)}</TableCell>
            <TableCell className="text-right">
              <Button asChild variant="outline" size="sm">
                <Link href={`/consultant/projects/new?client=${client.id}`}>New project</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
