import { Router, type IRouter } from "express";
import { BecomeVendorBody } from "@workspace/api-zod";
import { db, vendorsTable, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ensureDbUser, getUserVendor } from "../lib/dbUser";

const router: IRouter = Router();

router.get("/me", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.json({ authenticated: false, role: "guest", user: null, vendor: null });
    return;
  }
  const user = await ensureDbUser({
    id: req.user.id,
    email: req.user.email ?? null,
    firstName: req.user.firstName ?? null,
    lastName: req.user.lastName ?? null,
    profileImageUrl: req.user.profileImageUrl ?? null,
  });
  const vendor = user.role === "vendor" || user.role === "admin"
    ? await getUserVendor(user.id)
    : null;
  res.json({
    authenticated: true,
    role: user.role,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
    },
    vendor: vendor
      ? {
          id: vendor.id,
          shopName: vendor.shopName,
          description: vendor.description,
          phone: vendor.phone,
          city: vendor.city,
          createdAt: vendor.createdAt.toISOString(),
        }
      : null,
  });
});

router.post("/me/become-vendor", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = BecomeVendorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const user = await ensureDbUser({
    id: req.user.id,
    email: req.user.email ?? null,
    firstName: req.user.firstName ?? null,
    lastName: req.user.lastName ?? null,
    profileImageUrl: req.user.profileImageUrl ?? null,
  });

  const existing = await getUserVendor(user.id);
  let vendor = existing;
  if (!existing) {
    const [created] = await db
      .insert(vendorsTable)
      .values({
        userId: user.id,
        shopName: parsed.data.shopName,
        description: parsed.data.description ?? null,
        phone: parsed.data.phone,
        city: parsed.data.city,
      })
      .returning();
    vendor = created ?? null;
  }

  if (user.role === "customer") {
    await db.update(usersTable).set({ role: "vendor" }).where(eq(usersTable.id, user.id));
    user.role = "vendor";
  }

  res.json({
    authenticated: true,
    role: user.role,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
    },
    vendor: vendor
      ? {
          id: vendor.id,
          shopName: vendor.shopName,
          description: vendor.description,
          phone: vendor.phone,
          city: vendor.city,
          createdAt: vendor.createdAt.toISOString(),
        }
      : null,
  });
});

export default router;
