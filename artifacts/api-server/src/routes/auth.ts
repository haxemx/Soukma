import { Router, type IRouter, type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { GetCurrentAuthUserResponse } from "@workspace/api-zod";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  clearSession,
  getSessionId,
  createSession,
  SESSION_COOKIE,
  SESSION_TTL,
  type SessionData,
} from "../lib/auth";

const router: IRouter = Router();
const JWT_SECRET = process.env.SESSION_SECRET ?? "secret";

function setSessionCookie(res: Response, sid: string) {
  res.cookie(SESSION_COOKIE, sid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL,
  });
}

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

  const sessionData: SessionData = {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
    },
    access_token: jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" }),
    expires_at: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
  };

  const sid = await createSession(sessionData);
  setSessionCookie(res, sid);
  res.status(201).json({ user: sessionData.user });
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

  const sessionData: SessionData = {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
    },
    access_token: jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" }),
    expires_at: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
  };

  const sid = await createSession(sessionData);
  setSessionCookie(res, sid);
  res.json({ user: sessionData.user });
});

// ─── GET /logout ───────────────────────────────────────────────────────────
router.get("/logout", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  await clearSession(res, sid);
  res.redirect("/");
});

// ─── GET /login (redirect) ─────────────────────────────────────────────────
router.get("/login", (_req: Request, res: Response) => {
  res.redirect("/login");
});

export default router;
