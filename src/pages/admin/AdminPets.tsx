import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PawPrint, User } from "lucide-react";
import { apiUrl } from "@/lib/api";
import { getAuthHeaders } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { getDisplaySpecies } from "@/lib/pet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PetRow = {
  id: string;
  microchipNumber: string;
  name: string;
  species: string;
  speciesOther?: string | null;
  breed: string;
  status: string;
  owner: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    isActive: boolean;
  } | null;
};

export default function AdminPets() {
  const [pets, setPets] = useState<PetRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(apiUrl("/api/admin/pets"), {
          headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setPets(Array.isArray(data) ? data : []);
      } catch {
        setPets([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statusVariant = (status: string) => {
    if (status === "registered") return "default";
    if (status === "lost") return "destructive";
    if (status === "deceased") return "secondary";
    return "outline";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Pets Overview</h1>
        <p className="text-muted-foreground">
          Read-only list of registered pets and microchips. Linked owner view.
        </p>
      </div>

      {loading ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Loading pets...
        </div>
      ) : (
        <div className="rounded-lg border bg-card/80 backdrop-blur">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pet</TableHead>
                <TableHead>Microchip</TableHead>
                <TableHead>Species / Breed</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Owner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pets.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-border transition-colors hover:bg-muted/30"
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                        <PawPrint className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {p.microchipNumber}
                  </TableCell>
                  <TableCell>
                    {getDisplaySpecies(p.species, p.speciesOther)} • {p.breed}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {p.owner ? (
                      <span className="flex items-center gap-1 text-sm">
                        <User className="h-3 w-3" />
                        {p.owner.email}
                        {!p.owner.isActive && (
                          <span className="text-muted-foreground">(inactive)</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
