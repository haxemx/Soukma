import { type Request, type Response, type NextFunction } from "express";
import { getSession, getSessionId } from "../lib/auth";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
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

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!(req as any).isAuthenticated?.()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
