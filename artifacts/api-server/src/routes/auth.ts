import * as oidc from "openid-client";
import { Router, type IRouter, type Request, type Response } from "express";
import { GetCurrentAuthUserResponse } from "@workspace/api-zod";
import { db, usersTable } from "@workspace/db";
import {
  clearSession,
  getOidcConfig,
  getSessionId,
  createSession,
  SESSION_COOKIE,
  SESSION_TTL,
  type SessionData,
} from "../lib/auth";

const OIDC_COOKIE_TTL = 10 * 60 * 1000;
const router: IRouter = Router();
const IS_LOCAL = !process.env.REPL_ID;

function getOrigin(req: Request): string {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers["host"] || "localhost";
  return `${proto}://${host}`;
}

function setSessionCookie(res: Response, sid: string) {
  res.cookie(SESSION_COOKIE, sid, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL,
  });
}

function setOidcCookie(res: Response, name: string, value: string) {
  res.cookie(name, value, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: OIDC_COOKIE_TTL,
  });
}

function getSafeReturnTo(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }
  return value;
}

async function upsertUser(claims: Record<string, unknown>) {
  const userData = {
    id: claims.sub as string,
    email: (claims.email as string) || null,
    firstName: (claims.first_name as string) || null,
    lastName: (claims.last_name as string) || null,
    profileImageUrl: (claims.profile_image_url || claims.picture) as string | null,
  };
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

router.get("/auth/user", (req: Request, res: Response) => {
  res.json(
    GetCurrentAuthUserResponse.parse({
      user: req.isAuthenticated() ? req.user : null,
    }),
  );
});

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
      <input type="hidden" name="returnTo" value="/soukma/" />
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
    await db
      .insert(usersTable)
      .values({ id: userId, email, firstName, lastName, profileImageUrl: null })
      .onConflictDoUpdate({
        target: usersTable.id,
        set: { email, firstName, lastName, updatedAt: new Date() },
      });
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
    res.redirect("/soukma/");
  });

} else {
  router.get("/login", async (req: Request, res: Response) => {
    const config = await getOidcConfig();
    const callbackUrl = `${getOrigin(req)}/api/callback`;
    const returnTo = getSafeReturnTo(req.query.returnTo);
    const state = oidc.randomState();
    const nonce = oidc.randomNonce();
    const codeVerifier = oidc.randomPKCECodeVerifier();
    const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);
    const redirectTo = oidc.buildAuthorizationUrl(config, {
      redirect_uri: callbackUrl,
      scope: "openid email profile offline_access",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      prompt: "login consent",
      state,
      nonce,
    });
    setOidcCookie(res, "code_verifier", codeVerifier);
    setOidcCookie(res, "nonce", nonce);
    setOidcCookie(res, "state", state);
    setOidcCookie(res, "return_to", returnTo);
    res.redirect(redirectTo.href);
  });

  router.get("/callback", async (req: Request, res: Response) => {
    const config = await getOidcConfig();
    const callbackUrl = `${getOrigin(req)}/api/callback`;
    const codeVerifier = req.cookies?.code_verifier;
    const nonce = req.cookies?.nonce;
    const expectedState = req.cookies?.state;
    if (!codeVerifier || !expectedState) { res.redirect("/api/login"); return; }
    const currentUrl = new URL(
      `${callbackUrl}?${new URL(req.url, `http://${req.headers.host}`).searchParams}`,
    );
    let tokens: oidc.TokenEndpointResponse & oidc.TokenEndpointResponseHelpers;
    try {
      tokens = await oidc.authorizationCodeGrant(config, currentUrl, {
        pkceCodeVerifier: codeVerifier,
        expectedNonce: nonce,
        expectedState,
        idTokenExpected: true,
      });
    } catch { res.redirect("/api/login"); return; }
    const returnTo = getSafeReturnTo(req.cookies?.return_to);
    res.clearCookie("code_verifier", { path: "/" });
    res.clearCookie("nonce", { path: "/" });
    res.clearCookie("state", { path: "/" });
    res.clearCookie("return_to", { path: "/" });
    const claims = tokens.claims();
    if (!claims) { res.redirect("/api/login"); return; }
    const dbUser = await upsertUser(claims as unknown as Record<string, unknown>);
    const now = Math.floor(Date.now() / 1000);
    const sessionData: SessionData = {
      user: {
        id: dbUser.id, email: dbUser.email, firstName: dbUser.firstName,
        lastName: dbUser.lastName, profileImageUrl: dbUser.profileImageUrl,
      },
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expiresIn() ? now + tokens.expiresIn()! : claims.exp,
    };
    const sid = await createSession(sessionData);
    setSessionCookie(res, sid);
    res.redirect(returnTo);
  });

  router.get("/logout", async (req: Request, res: Response) => {
    const config = await getOidcConfig();
    const origin = getOrigin(req);
    const sid = getSessionId(req);
    await clearSession(res, sid);
    const endSessionUrl = oidc.buildEndSessionUrl(config, {
      client_id: process.env.REPL_ID!,
      post_logout_redirect_uri: origin,
    });
    res.redirect(endSessionUrl.href);
  });
}

export default router;
