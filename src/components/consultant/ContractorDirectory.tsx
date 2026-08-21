import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toggleContractorAction } from "@/app/actions/consultant";

interface ContractorRow {
  id: string;
  companyName: string;
  regNumber: string;
  phone: string;
  email: string;
  address: string;
  isActive: boolean;
  rating: number;
  badge: string | null;
}

export function ContractorDirectory({ contractors }: { contractors: ContractorRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Company</TableHead>
          <TableHead>Registration</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Rating</TableHead>
          <TableHead>Status</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {contractors.map((contractor) => (
          <TableRow key={contractor.id}>
            <TableCell>
              <p className="font-medium">{contractor.companyName}</p>
              <p className="text-xs text-muted-foreground">{contractor.address}</p>
            </TableCell>
            <TableCell>
              <p>{contractor.regNumber}</p>
              {contractor.badge ? <p className="text-xs text-primary">{contractor.badge}</p> : null}
            </TableCell>
            <TableCell className="text-sm">
              {contractor.phone}
              <br />
              {contractor.email}
            </TableCell>
            <TableCell>{contractor.rating.toFixed(1)}</TableCell>
            <TableCell>
              <Badge variant={contractor.isActive ? "success" : "muted"}>
                {contractor.isActive ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell>
              <form action={toggleContractorAction.bind(null, contractor.id)}>
                <Button type="submit" variant="outline" size="sm">
                  {contractor.isActive ? "Deactivate" : "Activate"}
                </Button>
              </form>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
