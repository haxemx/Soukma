import { useState } from "react";
import { useListAdminUsers } from "@workspace/api-client-react";
import { AdminLayout } from "./AdminLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { apiBase } from "@/lib/api";
import { Shield, UserX, UserCheck, ChevronDown } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export default function AdminUsersPage() {
  const usersQ = useListAdminUsers();
  const users = (usersQ.data ?? []) as any[];
  const [loading, setLoading] = useState<string | null>(null);

  async function changeRole(id: string, role: string) {
    setLoading(id);
    try {
      await fetch(`${apiBase}/admin/users/${id}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
        body: JSON.stringify({ role }),
      });
      usersQ.refetch();
    } finally { setLoading(null); }
  }

  async function toggleBan(id: string, banned: boolean) {
    if (!confirm(banned ? "Bannir cet utilisateur ?" : "Débannir cet utilisateur ?")) return;
    setLoading(id);
    try {
      await fetch(`${apiBase}/admin/users/${id}/ban`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
        body: JSON.stringify({ banned }),
      });
      usersQ.refetch();
    } finally { setLoading(null); }
  }

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
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {usersQ.isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-border">
                  <td colSpan={5} className="px-5 py-3"><Skeleton className="h-6" /></td>
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">Aucun utilisateur.</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className={`border-t border-border transition-colors ${u.isBanned ? "bg-destructive/5" : ""}`}>
                  <td className="px-5 py-3 font-medium">
                    <div className="flex items-center gap-2">
                      {u.firstName || u.lastName ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() : "—"}
                      {u.isBanned && <Badge variant="destructive" className="text-[10px]">Banni</Badge>}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-muted-foreground">{u.email ?? "—"}</td>
                  <td className="px-5 py-3"><RoleBadge role={u.role} /></td>
                  <td className="px-5 py-3 text-muted-foreground">{formatDate(u.createdAt)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      {/* Changer rôle */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="h-7 gap-1 text-xs" disabled={loading === u.id}>
                            <Shield className="h-3 w-3" />
                            Rôle
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => changeRole(u.id, "customer")} className="text-xs">
                            👤 Client
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => changeRole(u.id, "vendor")} className="text-xs">
                            🏪 Vendeur
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => changeRole(u.id, "admin")} className="text-xs text-primary">
                            🛡️ Admin
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Bannir / Débannir */}
                      <Button
                        variant="outline"
                        size="sm"
                        className={`h-7 gap-1 text-xs ${u.isBanned ? "border-green-500 text-green-600 hover:bg-green-50" : "border-destructive text-destructive hover:bg-destructive/10"}`}
                        onClick={() => toggleBan(u.id, !u.isBanned)}
                        disabled={loading === u.id}
                      >
                        {u.isBanned ? <><UserCheck className="h-3 w-3" /> Débannir</> : <><UserX className="h-3 w-3" /> Bannir</>}
                      </Button>
                    </div>
                  </td>
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
