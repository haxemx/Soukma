import { useListAdminUsers } from "@workspace/api-client-react";
import { AdminLayout } from "./AdminLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/format";

export default function AdminUsersPage() {
  const usersQ = useListAdminUsers();
  const users = usersQ.data ?? [];
  return (
    <AdminLayout title="Utilisateurs" subtitle="Tous les comptes inscrits sur soukMA.">
      <div className="overflow-hidden rounded-xl border border-card-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Utilisateur</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Rôle</th>
              <th className="px-5 py-3">Inscrit le</th>
            </tr>
          </thead>
          <tbody>
            {usersQ.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-border"><td colSpan={4} className="px-5 py-3"><Skeleton className="h-6" /></td></tr>
              ))
            ) : users.length === 0 ? (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-muted-foreground">Aucun utilisateur.</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-t border-border" data-testid={`row-user-${u.id}`}>
                  <td className="px-5 py-3 font-medium">
                    {u.firstName || u.lastName ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() : "—"}
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{u.email ?? "—"}</td>
                  <td className="px-5 py-3"><RoleBadge role={u.role} /></td>
                  <td className="px-5 py-3 text-muted-foreground">{formatDate(u.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    customer: "bg-muted text-foreground",
    vendor: "bg-secondary text-secondary-foreground",
    admin: "bg-primary text-primary-foreground",
  };
  const label: Record<string, string> = {
    customer: "Client",
    vendor: "Vendeur",
    admin: "Admin",
  };
  return <Badge className={map[role] ?? "bg-muted"}>{label[role] ?? role}</Badge>;
}
