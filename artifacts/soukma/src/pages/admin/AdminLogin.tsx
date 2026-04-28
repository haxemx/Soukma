import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { apiBase } from "@/lib/api";

export default function AdminLoginPage() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiBase}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Identifiants incorrects"); return; }
      if (data.user?.role !== "admin") { setError("Accès refusé. Compte non administrateur."); return; }
      localStorage.setItem("admin_auth", "true");
      localStorage.setItem("auth_token", data.token);
      window.location.href = "/admin";
    } catch { setError("Erreur de connexion au serveur"); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="fixed inset-0 opacity-5 pointer-events-none"
        style={{ backgroundImage: "repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)", backgroundSize: "20px 20px" }} />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-4">
            <ShieldCheck className="h-8 w-8" />
          </motion.div>
          <h1 className="font-serif text-3xl font-semibold">Administration</h1>
          <p className="text-muted-foreground mt-1 text-sm">soukMA · Espace réservé aux admins</p>
        </div>
        <div className="rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
          <div className="h-1 moroccan-gradient w-full" />
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="hachemlamrini2004@gmail.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input id="password" type={showPass ? "text" : "password"} placeholder="••••••••"
                    value={password} onChange={e => setPassword(e.target.value)} required className="pr-10" />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {error && (
                <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive">
                  {error}
                </motion.p>
              )}
              <Button type="submit" className="w-full moroccan-gradient text-white font-medium h-11" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Connexion…
                  </span>
                ) : "Se connecter"}
              </Button>
            </form>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">Accès réservé aux administrateurs soukMA</p>
      </motion.div>
    </div>
  );
}
