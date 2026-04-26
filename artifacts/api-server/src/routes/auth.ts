import { Router, type IRouter, type Request, type Response } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { GetCurrentAuthUserResponse } from "@workspace/api-zod";
import { db, usersTable } from "@workspace/db";
import {
  clearSession,
  getSessionId,
  createSession,
  SESSION_COOKIE,
  SESSION_TTL,
  type SessionData,
} from "../lib/auth";

const router: IRouter = Router();
const IS_LOCAL = process.env.NODE_ENV === "development" && !process.env.CLERK_SECRET_KEY;

function getSafeReturnTo(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }
  return value;
}

function setSessionCookie(res: Response, sid: string) {
  res.cookie(SESSION_COOKIE, sid, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL,
  });
}

async function upsertUser(userData: {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}) {
  const [user] = await db
    .insert(usersTable)
    .values(userData)
    .onConflictDoUpdate({
      target: usersTable.id,
      set: { ...userData, updatedAt: new Date() },
    })
    .returning();
  return user;
}

// ─── GET /auth/user ────────────────────────────────────────────────────────
router.get("/auth/user", async (req: Request, res: Response) => {
  if (IS_LOCAL) {
    res.json(
      GetCurrentAuthUserResponse.parse({
        user: (req as any).isAuthenticated() ? (req as any).user : null,
      }),
    );
    return;
  }

  const auth = getAuth(req);

  if (!auth.userId) {
    res.json(GetCurrentAuthUserResponse.parse({ user: null }));
    return;
  }

  try {
    const clerkUser = await clerkClient.users.getUser(auth.userId);
    const userData = {
      id: auth.userId,
      email: clerkUser.emailAddresses[0]?.emailAddress || null,
      firstName: clerkUser.firstName || null,
      lastName: clerkUser.lastName || null,
      profileImageUrl: clerkUser.imageUrl || null,
    };
    const dbUser = await upsertUser(userData);
    res.json(GetCurrentAuthUserResponse.parse({ user: dbUser }));
  } catch (err) {
    res.status(500).json({ error: "Failed to get user" });
  }
});

// ─── MODE LOCAL (développement sans Clerk) ─────────────────────────────────
if (IS_LOCAL) {
  router.get("/login", (_req: Request, res: Response) => {
    res.send(`<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Connexion locale — soukMA</title>
  <style>
    body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: #fdf6ee; }
    .box { background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.1); width: 360px; }
    h2 { margin: 0 0 8px; color: #b85c2a; }
    p { color: #888; font-size: 14px; margin: 0 0 24px; }
    label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 6px; color: #333; }
    input { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px; box-sizing: border-box; margin-bottom: 16px; }
    button { width: 100%; padding: 12px; background: #b85c2a; color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; }
    button:hover { background: #a04e22; }
  </style>
</head>
<body>
  <div class="box">
    <h2>soukMA</h2>
    <p>Mode développement local</p>
    <form method="POST" action="/api/login-mock">
      <label>Prénom</label>
      <input name="firstName" value="Hachem" required />
      <label>Nom</label>
      <input name="lastName" value="Dev" required />
      <label>Email</label>
      <input name="email" type="email" value="dev@soukma.ma" required />
      <input type="hidden" name="returnTo" value="/" />
      <button type="submit">Se connecter</button>
    </form>
  </div>
</body>
</html>`);
  });

  router.post("/login-mock", async (req: Request, res: Response) => {
    const { firstName, lastName, email, returnTo } = req.body;
    const safeReturn = getSafeReturnTo(returnTo);
    const userId = `local-${email.replace(/[^a-z0-9]/gi, "-")}`;
    await upsertUser({ id: userId, email, firstName, lastName, profileImageUrl: null });
    const sessionData: SessionData = {
      user: { id: userId, email, firstName, lastName, profileImageUrl: null },
      access_token: "mock-token",
      expires_at: Math.floor(Date.now() / 1000) + 86400,
    };
    const sid = await createSession(sessionData);
    setSessionCookie(res, sid);
    res.redirect(safeReturn);
  });

  router.get("/logout", async (req: Request, res: Response) => {
    const sid = getSessionId(req);
    await clearSession(res, sid);
    res.redirect("/");
  });

// ─── MODE PRODUCTION (Clerk) ────────────────────────────────────────────────
} else {
  router.get("/login", (req: Request, res: Response) => {
    const returnTo = getSafeReturnTo(req.query.returnTo);
    // Clerk gère le login côté frontend, on redirige simplement
    res.redirect(`/?returnTo=${encodeURIComponent(returnTo)}`);
  });

  router.get("/logout", async (req: Request, res: Response) => {
    const sid = getSessionId(req);
    if (sid) await clearSession(res, sid);
    res.redirect("/");
  });
}

export default router;
