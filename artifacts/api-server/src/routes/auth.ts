import { Router, type IRouter, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { GetCurrentAuthUserResponse } from "@workspace/api-zod";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { sendVerificationEmail } from "../lib/mailer";

const router: IRouter = Router();
const JWT_SECRET = process.env.SESSION_SECRET ?? "secret";
const JWT_EXPIRES = "7d";

router.get("/auth/user", (req: Request, res: Response) => {
  res.json(GetCurrentAuthUserResponse.parse({ user: (req as any).isAuthenticated() ? (req as any).user : null }));
});

router.post("/auth/register", async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;
  if (!email || !password) { res.status(400).json({ error: "Email et mot de passe requis" }); return; }

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) { res.status(409).json({ error: "Cet email est déjà utilisé" }); return; }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const codeExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db.insert(usersTable).values({ email, password: hashedPassword, firstName: firstName || null, lastName: lastName || null, profileImageUrl: null, isVerified: false, verificationCode, codeExpiry });
  await sendVerificationEmail(email, verificationCode);

  res.status(201).json({ message: "Compte créé. Vérifiez votre email pour activer votre compte." });
});

router.post("/auth/verify", async (req: Request, res: Response) => {
  const { email, code } = req.body;
  if (!email || !code) { res.status(400).json({ error: "Email et code requis" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user || user.verificationCode !== code) { res.status(400).json({ error: "Code invalide" }); return; }
  if (!user.codeExpiry || new Date() > user.codeExpiry) { res.status(400).json({ error: "Code expiré" }); return; }

  await db.update(usersTable).set({ isVerified: true, verificationCode: null }).where(eq(usersTable.email, email));
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

  res.json({ token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, profileImageUrl: user.profileImageUrl, role: user.role } });
});

// ─── POST /auth/resend-code ────────────────────────────────────────────────
router.post("/auth/resend-code", async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) { res.status(400).json({ error: "Email requis" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user) { res.status(404).json({ error: "Compte introuvable" }); return; }
  if (user.isVerified) { res.status(400).json({ error: "Ce compte est déjà activé" }); return; }

  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  const codeExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db.update(usersTable).set({ verificationCode, codeExpiry }).where(eq(usersTable.email, email));
  await sendVerificationEmail(email, verificationCode);

  res.json({ message: "Code renvoyé avec succès" });
});

router.post("/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) { res.status(400).json({ error: "Email et mot de passe requis" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user || !user.password) { res.status(401).json({ error: "Email ou mot de passe incorrect" }); return; }
  if (!user.isVerified) { res.status(403).json({ error: "Veuillez activer votre compte via l'email reçu" }); return; }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) { res.status(401).json({ error: "Email ou mot de passe incorrect" }); return; }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  res.json({ token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, profileImageUrl: user.profileImageUrl, role: user.role } });
});

router.post("/auth/logout", (_req: Request, res: Response) => { res.json({ success: true }); });
router.get("/login", (_req: Request, res: Response) => { res.redirect("/login"); });
router.get("/logout", (_req: Request, res: Response) => { res.redirect("/"); });

export default router;
