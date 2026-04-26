import { clerkMiddleware, getAuth } from "@clerk/express";
import { type Request, type Response, type NextFunction } from "express";
import { getSession, getSessionId } from "../lib/auth";

const IS_LOCAL = process.env.NODE_ENV === "development" && !process.env.CLERK_SECRET_KEY;

// ─── Middleware principal ────────────────────────────────────────────────────
export const authMiddleware = IS_LOCAL
  ? localAuthMiddleware
  : clerkMiddleware();

// ─── Mode local : lecture de session depuis la DB ───────────────────────────
async function localAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const sid = getSessionId(req);
  if (sid) {
    const session = await getSession(sid);
    if (session) {
      (req as any).user = session.user;
      (req as any).isAuthenticated = () => true;
      return next();
    }
  }
  (req as any).isAuthenticated = () => false;
  next();
}

// ─── Mode production : lecture du token Clerk ───────────────────────────────
export function attachUser(req: Request, res: Response, next: NextFunction) {
  if (IS_LOCAL) return next();

  const auth = getAuth(req);
  if (auth.userId) {
    (req as any).user = {
      id: auth.userId,
      email: null,
      firstName: null,
      lastName: null,
      profileImageUrl: null,
    };
    (req as any).isAuthenticated = () => true;
  } else {
    (req as any).isAuthenticated = () => false;
  }
  next();
}

// ─── Guard : routes protégées ────────────────────────────────────────────────
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!(req as any).isAuthenticated?.()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
