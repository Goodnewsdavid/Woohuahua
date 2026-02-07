import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Phone, AlertTriangle } from "lucide-react";
import { apiUrl } from "@/lib/api";
import { getAuthHeaders } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "@/components/ui/use-toast";

type EscalationItem = {
  type: "chat" | "call";
  id: string;
  userId: string | null;
  tag: string;
  humanEscalationRequested: boolean;
  escalationResolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  messages?: { role: string; content: string; createdAt: string }[];
  twilioCallSid?: string | null;
  callerType?: string | null;
  durationSeconds?: number | null;
};

export default function AdminEscalations() {
  const [items, setItems] = useState<EscalationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvedFilter, setResolvedFilter] = useState<string>("false");
  const [selected, setSelected] = useState<EscalationItem | null>(null);
  const [resolving, setResolving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const q = `?resolved=${resolvedFilter}`;
      const res = await fetch(apiUrl(`/api/admin/escalations${q}`), {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setItems(data.items ?? []);
    } catch {
      toast({ title: "Error", description: "Failed to load escalations.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [resolvedFilter]);

  const markResolved = async (item: EscalationItem) => {
    setResolving(true);
    try {
      const res = await fetch(apiUrl("/api/admin/escalations/resolve"), {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ type: item.type, id: item.id }),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Escalation marked resolved." });
      setSelected(null);
      load();
    } catch {
      toast({ title: "Error", description: "Failed to update.", variant: "destructive" });
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold">AI Escalation Inbox</h1>
        <div className="flex gap-2">
          <Button
            variant={resolvedFilter === "false" ? "default" : "outline"}
            size="sm"
            onClick={() => setResolvedFilter("false")}
          >
            Pending
          </Button>
          <Button
            variant={resolvedFilter === "true" ? "default" : "outline"}
            size="sm"
            onClick={() => setResolvedFilter("true")}
          >
            Resolved
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Loading...
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, i) => (
            <motion.div
              key={`${item.type}-${item.id}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="flex cursor-pointer items-center justify-between rounded-lg border bg-card/80 p-4 backdrop-blur hover:bg-muted/30"
              onClick={() => setSelected(item)}
            >
              <div className="flex items-center gap-3">
                {item.type === "chat" ? (
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Phone className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {item.type === "chat" ? "Chat" : "Call"} escalation
                    </span>
                    {!item.escalationResolvedAt && (
                      <Badge className="animate-pulse bg-amber-600">NEW</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.createdAt).toLocaleString()} • {item.tag}
                  </p>
                </div>
              </div>
              <Badge variant={item.escalationResolvedAt ? "secondary" : "default"}>
                {item.escalationResolvedAt ? "Resolved" : "Pending"}
              </Badge>
            </motion.div>
          ))}
          {items.length === 0 && (
            <p className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
              No escalations.
            </p>
          )}
        </div>
      )}

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Escalation details</SheetTitle>
          </SheetHeader>
          {selected && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2">
                <Badge>{selected.tag}</Badge>
                {!selected.escalationResolvedAt && (
                  <Badge className="bg-amber-600">NEW</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(selected.createdAt).toLocaleString()}
              </p>
              {selected.type === "chat" && selected.messages && (
                <div className="space-y-2 rounded border bg-muted/30 p-3">
                  <p className="text-xs font-medium text-muted-foreground">Context</p>
                  {selected.messages.slice(-6).map((m, j) => (
                    <div key={j} className="text-sm">
                      <span className="font-medium">{m.role}:</span> {m.content.slice(0, 200)}
                      {m.content.length > 200 && "…"}
                    </div>
                  ))}
                </div>
              )}
              {selected.type === "call" && (
                <p className="text-sm">
                  Call SID: {selected.twilioCallSid ?? "—"} •{" "}
                  {selected.callerType ?? "—"}
                </p>
              )}
              {!selected.escalationResolvedAt && (
                <Button
                  className="mt-4"
                  disabled={resolving}
                  onClick={() => markResolved(selected)}
                >
                  Mark as resolved
                </Button>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
