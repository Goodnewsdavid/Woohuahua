import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { apiUrl } from "@/lib/api";
import { getAuthHeaders } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "@/components/ui/use-toast";

type Dispute = {
  id: string;
  userId: string | null;
  subject: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export default function AdminDisputes() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Dispute | null>(null);
  const [updating, setUpdating] = useState(false);

  const loadDisputes = async () => {
    setLoading(true);
    try {
      const q =
        statusFilter && statusFilter !== "all"
          ? `?status=${encodeURIComponent(statusFilter)}`
          : "";
      const res = await fetch(apiUrl(`/api/admin/disputes${q}`), {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setDisputes(Array.isArray(data) ? data : []);
    } catch {
      toast({ title: "Error", description: "Failed to load disputes.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDisputes();
  }, [statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(true);
    try {
      const res = await fetch(apiUrl(`/api/admin/disputes/${id}`), {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Dispute updated." });
      setSelected(null);
      loadDisputes();
    } catch {
      toast({ title: "Error", description: "Failed to update.", variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold">Disputes & Complaints</h1>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="under_review">Under review</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Loading...
        </div>
      ) : (
        <div className="space-y-3">
          {disputes.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex cursor-pointer items-center justify-between rounded-lg border bg-card/80 p-4 backdrop-blur hover:bg-muted/30"
              onClick={() => setSelected(d)}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium">{d.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(d.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <Badge
                variant={
                  d.status === "resolved"
                    ? "secondary"
                    : d.status === "under_review"
                      ? "outline"
                      : "default"
                }
              >
                {d.status.replace("_", " ")}
              </Badge>
            </motion.div>
          ))}
          {disputes.length === 0 && (
            <p className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
              No disputes match the filter.
            </p>
          )}
        </div>
      )}

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Dispute details</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="mt-6 space-y-4">
              <p className="font-medium">{selected.subject}</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {selected.description}
              </p>
              <p className="text-xs text-muted-foreground">
                Created: {new Date(selected.createdAt).toLocaleString()}
              </p>
              <div className="flex flex-wrap gap-2 pt-4">
                {["open", "under_review", "resolved"].map((s) => (
                  <Button
                    key={s}
                    variant={selected.status === s ? "default" : "outline"}
                    size="sm"
                    disabled={updating}
                    onClick={() => updateStatus(selected.id, s)}
                  >
                    {s.replace("_", " ")}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
