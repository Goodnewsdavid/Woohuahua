import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, User, Mail } from "lucide-react";
import { apiUrl } from "@/lib/api";
import { getAuthHeaders } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";

type UserRow = {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
};

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"table" | "card">("table");
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [actionConfirm, setActionConfirm] = useState<
    { type: "deactivate" | "softDelete"; user: UserRow } | null
  >(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const q = search ? `?q=${encodeURIComponent(search)}` : "";
      const res = await fetch(apiUrl(`/api/admin/users${q}`), {
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      toast({ title: "Error", description: "Failed to load users.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search]);

  const handleDeactivate = async (user: UserRow) => {
    try {
      const res = await fetch(apiUrl(`/api/admin/users/${user.id}`), {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ deactivate: true }),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "User deactivated." });
      setActionConfirm(null);
      setSelectedUser(null);
      loadUsers();
    } catch {
      toast({ title: "Error", description: "Failed to deactivate.", variant: "destructive" });
    }
  };

  const handleSoftDelete = async (user: UserRow) => {
    try {
      const res = await fetch(apiUrl(`/api/admin/users/${user.id}`), {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ softDelete: true }),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "User soft-deleted." });
      setActionConfirm(null);
      setSelectedUser(null);
      loadUsers();
    } catch {
      toast({ title: "Error", description: "Failed to soft-delete.", variant: "destructive" });
    }
  };

  const statusBadge = (u: UserRow) => {
    if (u.deletedAt) return <Badge variant="secondary">Soft-deleted</Badge>;
    if (!u.isActive) return <Badge variant="outline">Deactivated</Badge>;
    return <Badge className="bg-green-600">Active</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold">User Management</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by email or ID..."
              className="pl-9 w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            variant={view === "table" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("table")}
          >
            Table
          </Button>
          <Button
            variant={view === "card" ? "default" : "outline"}
            size="sm"
            onClick={() => setView("card")}
          >
            Cards
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Loading users...
        </div>
      ) : view === "table" ? (
        <div className="rounded-lg border bg-card/80 backdrop-blur">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow
                  key={u.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedUser(u)}
                >
                  <TableCell className="font-medium">{u.email}</TableCell>
                  <TableCell>{statusBadge(u)}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedUser(u);
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((u) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border bg-card/80 p-4 shadow backdrop-blur cursor-pointer hover:shadow-md"
              onClick={() => setSelectedUser(u)}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{u.email}</p>
                  {statusBadge(u)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Side panel */}
      <Sheet open={!!selectedUser} onOpenChange={(o) => !o && setSelectedUser(null)}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>User details</SheetTitle>
          </SheetHeader>
          {selectedUser && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{selectedUser.email}</span>
              </div>
              <div>Status: {statusBadge(selectedUser)}</div>
              <div>Role: {selectedUser.role}</div>
              {!selectedUser.deletedAt && selectedUser.isActive && (
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setActionConfirm({ type: "deactivate", user: selectedUser })
                    }
                  >
                    Deactivate user
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() =>
                      setActionConfirm({ type: "softDelete", user: selectedUser })
                    }
                  >
                    Soft-delete user
                  </Button>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Confirm modals */}
      <AlertDialog
        open={!!actionConfirm}
        onOpenChange={(o) => !o && setActionConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionConfirm?.type === "deactivate"
                ? "Deactivate user?"
                : "Soft-delete user?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionConfirm?.type === "deactivate"
                ? "The user will no longer be able to sign in. You can reverse this by re-activating from the database if needed."
                : "The user will be marked as deleted (deletedAt set). No hard delete will be performed. This is reversible by an admin."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                actionConfirm &&
                (actionConfirm.type === "deactivate"
                  ? handleDeactivate(actionConfirm.user)
                  : handleSoftDelete(actionConfirm.user))
              }
              className={actionConfirm?.type === "softDelete" ? "bg-destructive text-destructive-foreground" : ""}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
