import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Ticket, Plus } from "lucide-react";
import { apiUrl } from "@/lib/api";
import { getAuthHeaders } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type PromoRow = {
  id: string;
  code: string;
  maxUses: number | null;
  usedCount: number;
  createdAt: string;
};

export default function AdminPromo() {
  const [list, setList] = useState<PromoRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCode, setNewCode] = useState("");
  const [newMaxUses, setNewMaxUses] = useState("");
  const [creating, setCreating] = useState(false);

  const loadPromos = async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/api/admin/promo"), {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
    } catch {
      toast({ title: "Error", description: "Failed to load promo codes.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromos();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = newCode.trim().toUpperCase();
    if (!code) {
      toast({ title: "Code required", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      const res = await fetch(apiUrl("/api/admin/promo"), {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          maxUses: newMaxUses.trim() ? parseInt(newMaxUses, 10) : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create");
      toast({ title: "Promo code created", description: `"${data.code}" is ready to use.` });
      setNewCode("");
      setNewMaxUses("");
      loadPromos();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create promo code.",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Promo codes</h1>
      </div>

      <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Code</label>
          <Input
            value={newCode}
            onChange={(e) => setNewCode(e.target.value.toUpperCase())}
            placeholder="e.g. FAMILY25"
            className="w-40"
            maxLength={32}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Max uses (optional)</label>
          <Input
            type="number"
            min={1}
            value={newMaxUses}
            onChange={(e) => setNewMaxUses(e.target.value)}
            placeholder="Unlimited"
            className="w-28"
          />
        </div>
        <Button type="submit" disabled={creating}>
          <Plus className="mr-2 h-4 w-4" />
          Create
        </Button>
      </form>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : list.length === 0 ? (
        <p className="text-muted-foreground">No promo codes yet. Create one above.</p>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Used</TableHead>
                <TableHead>Max uses</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono font-medium">{p.code}</TableCell>
                  <TableCell>{p.usedCount}</TableCell>
                  <TableCell>{p.maxUses == null ? "Unlimited" : p.maxUses}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </motion.div>
  );
}
