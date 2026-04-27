import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.SESSION_SECRET ?? "secret";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
      const [user] = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.id, payload.userId))
        .limit(1);

      if (user) {
        (req as any).user = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
        };
        (req as any).isAuthenticated = () => true;
        return next();
      }
    } catch {
      // token invalide
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
