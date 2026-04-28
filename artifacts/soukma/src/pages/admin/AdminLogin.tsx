import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const ADMIN_USER = "admin";
const ADMIN_PASS = "hachem2112004";
const SECRET_CODE = "AdminHachem";

export default function AdminLoginPage() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ username: "", password: "" });
  const [code, setCode] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
      // Code secret seul suffit
      if (code === SECRET_CODE) {
        localStorage.setItem("admin_auth", "true");
        navigate("/admin");
        return;
      }
      // Ou identifiants complets
      if (form.username === ADMIN_USER && form.password === ADMIN_PASS) {
        localStorage.setItem("admin_auth", "true");
        navigate("/admin");
        return;
      }
      setError("Identifiants incorrects");
      setLoading(false);
    }, 600);
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
                <Label htmlFor="code">Code secret (accès rapide)</Label>
                <Input id="code" type="password" placeholder="••••••••••••"
                  value={code} onChange={e => setCode(e.target.value)} />
                <p className="text-xs text-muted-foreground">Entrez le code secret pour accéder directement</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">ou</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="username">Utilisateur</Label>
                <Input id="username" type="text" placeholder="admin"
                  value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Input id="password" type={showPass ? "text" : "password"} placeholder="••••••••"
                    value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className="pr-10" />
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
