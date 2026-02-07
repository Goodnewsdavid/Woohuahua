import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, PawPrint, AlertCircle, Inbox } from "lucide-react";
import { apiUrl } from "@/lib/api";
import { getAuthHeaders } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const cardConfig = [
  {
    key: "users",
    title: "Total users",
    href: "/admin/users",
    icon: Users,
    color: "from-primary/20 to-primary/5 border-primary/20",
  },
  {
    key: "pets",
    title: "Active pets",
    href: "/admin/pets",
    icon: PawPrint,
    color: "from-secondary/20 to-secondary/5 border-secondary/20",
  },
  {
    key: "disputes",
    title: "Open disputes",
    href: "/admin/disputes",
    icon: AlertCircle,
    color: "from-amber-500/20 to-amber-500/5 border-amber-500/20",
  },
  {
    key: "escalations",
    title: "Pending AI escalations",
    href: "/admin/escalations",
    icon: Inbox,
    color: "from-orange-500/20 to-orange-500/5 border-orange-500/20",
  },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<{
    totalUsers?: number;
    activePets?: number;
    openDisputes?: number;
    pendingEscalations?: number;
  }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    (async () => {
      try {
        const res = await fetch(apiUrl("/api/admin/dashboard"), {
          headers: getAuthHeaders(),
        });
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error ?? `Request failed (${res.status}). Check backend and run migrations.`);
          setLoading(false);
          return;
        }
        setStats({
          totalUsers: data.totalUsers,
          activePets: data.activePets,
          openDisputes: data.openDisputes,
          pendingEscalations: data.pendingEscalations,
        });
      } catch (e) {
        if (!cancelled) setError("Could not reach the server. Is the backend running?");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const values = {
    users: stats.totalUsers ?? 0,
    pets: stats.activePets ?? 0,
    disputes: stats.openDisputes ?? 0,
    escalations: stats.pendingEscalations ?? 0,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Overview of Woo-Huahua admin metrics. Click a card to open that section.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cardConfig.map((item, i) => {
          const Icon = item.icon;
          const value =
            item.key === "users"
              ? values.users
              : item.key === "pets"
                ? values.pets
                : item.key === "disputes"
                  ? values.disputes
                  : values.escalations;
          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.2 }}
            >
              <Link to={item.href}>
                <Card
                  className={`
                    h-full border bg-card/80 shadow-md backdrop-blur
                    transition-all hover:shadow-lg hover:-translate-y-0.5
                    ${item.color}
                  `}
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {item.title}
                    </CardTitle>
                    <Icon className="h-5 w-5 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="h-8 w-16 animate-pulse rounded bg-muted" />
                    ) : (
                      <span className="text-2xl font-bold">{value}</span>
                    )}
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
