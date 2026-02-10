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
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="font-display text-xl font-bold text-foreground sm:text-2xl">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Overview of Woo-Huahua admin metrics. Click a card to open that section.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-700 dark:text-amber-400 sm:px-4 sm:py-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
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
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 sm:pt-6">
                    <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
                      {item.title}
                    </CardTitle>
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground sm:h-5 sm:w-5" />
                  </CardHeader>
                  <CardContent className="pb-4 sm:pb-6">
                    {loading ? (
                      <div className="h-7 w-14 animate-pulse rounded bg-muted sm:h-8 sm:w-16" />
                    ) : (
                      <span className="text-xl font-bold sm:text-2xl">{value}</span>
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
