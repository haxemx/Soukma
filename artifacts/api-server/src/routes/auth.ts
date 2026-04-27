import { Router, type IRouter, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { GetCurrentAuthUserResponse } from "@workspace/api-zod";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();
const JWT_SECRET = process.env.SESSION_SECRET ?? "secret";
const JWT_EXPIRES = "7d";

// ─── GET /auth/user ────────────────────────────────────────────────────────
router.get("/auth/user", (req: Request, res: Response) => {
  res.json(
    GetCurrentAuthUserResponse.parse({
      user: (req as any).isAuthenticated() ? (req as any).user : null,
    }),
  );
});

// ─── POST /auth/register ───────────────────────────────────────────────────
router.post("/auth/register", async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email et mot de passe requis" });
    return;
  }

  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (existing.length > 0) {
    res.status(409).json({ error: "Cet email est déjà utilisé" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const [user] = await db
    .insert(usersTable)
    .values({
      email,
      password: hashedPassword,
      firstName: firstName || null,
      lastName: lastName || null,
      profileImageUrl: null,
    })
    .returning();

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

  res.status(201).json({
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
    },
  });
});

// ─── POST /auth/login ──────────────────────────────────────────────────────
router.post("/auth/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email et mot de passe requis" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (!user || !user.password) {
    res.status(401).json({ error: "Email ou mot de passe incorrect" });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ error: "Email ou mot de passe incorrect" });
    return;
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
    },
  });
});

// ─── POST /auth/logout ─────────────────────────────────────────────────────
router.post("/auth/logout", (_req: Request, res: Response) => {
  res.json({ success: true });
});

router.get("/login", (_req: Request, res: Response) => {
  res.redirect("/login");
});

router.get("/logout", (_req: Request, res: Response) => {
  res.redirect("/");
});

export default router;
