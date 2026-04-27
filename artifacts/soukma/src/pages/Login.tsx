import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiBase } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"form" | "verify">("form");
  const [code, setCode] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const body = mode === "login"
        ? { email, password }
        : { email, password, firstName, lastName };

      const res = await fetch(`${apiBase}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        // Si le compte n'est pas activé, rediriger vers l'écran de vérification
        if (res.status === 403) {
          setStep("verify");
          return;
        }
        setError(data.error ?? "Une erreur est survenue");
        return;
      }

      if (mode === "register") {
        setStep("verify");
        return;
      }

      localStorage.setItem("auth_token", data.token);
      setLocation("/");
      window.location.reload();
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${apiBase}/auth/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Code invalide");
        return;
      }

      localStorage.setItem("auth_token", data.token);
      setLocation("/");
      window.location.reload();
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  }

  async function handleResendCode() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/auth/resend-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur lors du renvoi");
      } else {
        setError("✓ Code renvoyé, vérifiez votre email");
      }
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div animate={{ x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <motion.div animate={{ x: [0, -20, 0], y: [0, 30, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }} className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <motion.div animate={{ x: [0, 15, 0], y: [0, 15, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-200/20 blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }} className="relative w-full max-w-md">
        <div className="overflow-hidden rounded-2xl border border-border bg-background/80 shadow-2xl backdrop-blur-xl">
          <div className="moroccan-gradient h-1.5 w-full" />
          <div className="p-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 200 }} className="mb-6 flex flex-col items-center">
              <div className="moroccan-gradient mb-3 flex h-14 w-14 items-center justify-center rounded-2xl text-primary-foreground shadow-lg">
                <span className="font-serif text-3xl font-bold">S</span>
              </div>
              <h1 className="font-serif text-2xl font-semibold">souk<span className="text-primary">MA</span></h1>
              <p className="text-sm text-muted-foreground">Marketplace marocaine</p>
            </motion.div>

            <AnimatePresence mode="wait">
              {step === "verify" ? (
                <motion.div key="verify" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }}>
                  <div className="mb-6 text-center">
                    <h2 className="text-lg font-semibold">Vérifiez votre email</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Un code à 6 chiffres a été envoyé à <strong>{email}</strong>
                    </p>
                  </div>

                  <form onSubmit={handleVerify} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="code" className="text-xs font-medium">Code d'activation</Label>
                      <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="000000" maxLength={6} required className="h-12 text-center text-2xl font-bold tracking-widest" />
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                          className={`rounded-lg px-3 py-2 text-sm ${error.startsWith("✓") ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"}`}>
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    <motion.div whileTap={{ scale: 0.98 }}>
                      <Button type="submit" className="moroccan-gradient h-11 w-full gap-2 text-sm font-semibold text-white shadow-md" disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><span>Activer mon compte</span><ArrowRight className="h-4 w-4" /></>}
                      </Button>
                    </motion.div>

                    <div className="flex flex-col gap-2">
                      <button type="button" onClick={handleResendCode} disabled={loading} className="w-full text-center text-xs text-primary hover:underline disabled:opacity-50">
                        Renvoyer le code
                      </button>
                      <button type="button" onClick={() => { setStep("form"); setError(""); setCode(""); }} className="w-full text-center text-xs text-muted-foreground hover:text-foreground">
                        Retour
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div key="form" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.3 }}>
                  <div className="mb-6 flex rounded-xl bg-muted p-1">
                    {(["login", "register"] as const).map((m) => (
                      <button key={m} onClick={() => { setMode(m); setError(""); }} className="relative flex-1 rounded-lg py-2 text-sm font-medium transition-colors">
                        {mode === m && <motion.div layoutId="tab" className="absolute inset-0 rounded-lg bg-background shadow-sm" transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
                        <span className="relative z-10">{m === "login" ? "Se connecter" : "S'inscrire"}</span>
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <AnimatePresence mode="wait">
                      {mode === "register" && (
                        <motion.div key="names" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="grid grid-cols-2 gap-3 overflow-hidden">
                          <div className="space-y-1.5">
                            <Label htmlFor="firstName" className="text-xs font-medium">Prénom</Label>
                            <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Prénom" className="h-10" />
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="lastName" className="text-xs font-medium">Nom</Label>
                            <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Nom" className="h-10" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-medium">Email</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" required className="h-10" />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-xs font-medium">Mot de passe</Label>
                      <div className="relative">
                        <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className="h-10 pr-10" />
                        <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    <motion.div whileTap={{ scale: 0.98 }}>
                      <Button type="submit" className="moroccan-gradient h-11 w-full gap-2 text-sm font-semibold text-white shadow-md" disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>{mode === "login" ? "Se connecter" : "Créer mon compte"}<ArrowRight className="h-4 w-4" /></>}
                      </Button>
                    </motion.div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          En continuant, vous acceptez nos{" "}
          <span className="text-primary hover:underline cursor-pointer">conditions d'utilisation</span>
        </p>
      </motion.div>
    </div>
  );
}
