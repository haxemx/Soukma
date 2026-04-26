import { eq } from "drizzle-orm";
import { db, usersTable, vendorsTable, type User, type Vendor } from "@workspace/db";

export type UserRole = "customer" | "vendor" | "admin";

const ADMIN_EMAILS = (process.env["ADMIN_EMAILS"] ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function ensureDbUser(authUser: {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
}): Promise<User> {
  // Determine if the email matches the admin allow-list, otherwise default to customer.
  const isAdmin = authUser.email
    ? ADMIN_EMAILS.includes(authUser.email.toLowerCase())
    : false;

  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, authUser.id))
    .limit(1);

  if (existing.length > 0) {
    const current = existing[0]!;
    // Promote to admin if email matches and not already admin
    if (isAdmin && current.role !== "admin") {
      await db
        .update(usersTable)
        .set({ role: "admin" })
        .where(eq(usersTable.id, current.id));
      current.role = "admin";
    }
    return current;
  }

  const [created] = await db
    .insert(usersTable)
    .values({
      id: authUser.id,
      email: authUser.email,
      firstName: authUser.firstName,
      lastName: authUser.lastName,
      profileImageUrl: authUser.profileImageUrl,
      role: isAdmin ? "admin" : "customer",
    })
    .returning();
  return created!;
}

export async function getUserVendor(userId: string): Promise<Vendor | null> {
  const rows = await db
    .select()
    .from(vendorsTable)
    .where(eq(vendorsTable.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

export async function getCurrentUserOr401(req: Express.Request): Promise<User | null> {
  if (!req.user) return null;
  return ensureDbUser({
    id: req.user.id,
    email: req.user.email ?? null,
    firstName: req.user.firstName ?? null,
    lastName: req.user.lastName ?? null,
    profileImageUrl: req.user.profileImageUrl ?? null,
  });
}
