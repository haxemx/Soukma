import { Router, type IRouter } from "express";
import {
  db,
  productsTable,
  categoriesTable,
  vendorsTable,
  ordersTable,
  orderItemsTable,
  usersTable,
} from "@workspace/db";
import { desc, eq, sql } from "drizzle-orm";
import { ensureDbUser } from "../lib/dbUser";

const router: IRouter = Router();

async function requireAdmin(req: Express.Request) {
  if (!req.user) return null;
  const user = await ensureDbUser({
    id: req.user.id,
    email: req.user.email ?? null,
    firstName: req.user.firstName ?? null,
    lastName: req.user.lastName ?? null,
    profileImageUrl: req.user.profileImageUrl ?? null,
  });
  if (user.role !== "admin") return null;
  return user;
}

const baseSelect = {
  id: productsTable.id,
  slug: productsTable.slug,
  title: productsTable.title,
  description: productsTable.description,
  price: productsTable.price,
  compareAtPrice: productsTable.compareAtPrice,
  currency: productsTable.currency,
  stock: productsTable.stock,
  categorySlug: categoriesTable.slug,
  categoryName: categoriesTable.name,
  vendorId: productsTable.vendorId,
  vendorName: vendorsTable.shopName,
  imageUrl: productsTable.imageUrl,
  rating: productsTable.rating,
  reviewCount: productsTable.reviewCount,
  isFeatured: productsTable.isFeatured,
  createdAt: productsTable.createdAt,
};

function serializeProduct(row: any) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    price: Number(row.price),
    compareAtPrice: row.compareAtPrice == null ? null : Number(row.compareAtPrice),
    currency: row.currency,
    stock: row.stock,
    categorySlug: row.categorySlug ?? "",
    categoryName: row.categoryName,
    vendorId: row.vendorId,
    vendorName: row.vendorName ?? "soukMA Officiel",
    // REMPLACER ICI: image principale du produit
    imageUrl: row.imageUrl,
    rating: Number(row.rating),
    reviewCount: row.reviewCount,
    isFeatured: row.isFeatured,
    createdAt: row.createdAt.toISOString(),
  };
}

router.get("/admin/stats", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const admin = await requireAdmin(req);
  if (!admin) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const [usersRow] = await db.select({ c: sql<number>`count(*)::int` }).from(usersTable);
  const [vendorsRow] = await db.select({ c: sql<number>`count(*)::int` }).from(vendorsTable);
  const [productsRow] = await db.select({ c: sql<number>`count(*)::int` }).from(productsTable);
  const [ordersRow] = await db.select({ c: sql<number>`count(*)::int` }).from(ordersTable);
  const [revenueRow] = await db.select({
    revenue: sql<number>`coalesce(sum(${ordersTable.total}), 0)::float`,
  }).from(ordersTable);

  const ordersByStatus = await db
    .select({
      status: ordersTable.status,
      count: sql<number>`count(*)::int`,
    })
    .from(ordersTable)
    .groupBy(ordersTable.status);

  const recent = await db
    .select({
      o: ordersTable,
      itemCount: sql<number>`coalesce(sum(${orderItemsTable.quantity}), 0)::int`,
    })
    .from(ordersTable)
    .leftJoin(orderItemsTable, eq(orderItemsTable.orderId, ordersTable.id))
    .groupBy(ordersTable.id)
    .orderBy(desc(ordersTable.createdAt))
    .limit(8);

  const topCategories = await db
    .select({
      slug: categoriesTable.slug,
      name: categoriesTable.name,
      productCount: sql<number>`count(${productsTable.id})::int`,
    })
    .from(categoriesTable)
    .leftJoin(productsTable, eq(productsTable.categoryId, categoriesTable.id))
    .groupBy(categoriesTable.id)
    .orderBy(desc(sql`count(${productsTable.id})`))
    .limit(6);

  res.json({
    totalUsers: usersRow?.c ?? 0,
    totalVendors: vendorsRow?.c ?? 0,
    totalProducts: productsRow?.c ?? 0,
    totalOrders: ordersRow?.c ?? 0,
    revenue: revenueRow?.revenue ?? 0,
    currency: "MAD",
    ordersByStatus,
    recentOrders: recent.map((r) => ({
      id: r.o.id,
      reference: r.o.reference,
      status: r.o.status,
      total: Number(r.o.total),
      currency: r.o.currency,
      itemCount: r.itemCount,
      paymentMethod: r.o.paymentMethod,
      createdAt: r.o.createdAt.toISOString(),
    })),
    topCategories,
  });
});

router.get("/admin/users", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const admin = await requireAdmin(req);
  if (!admin) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const rows = await db.select().from(usersTable).orderBy(desc(usersTable.createdAt));
  res.json(
    rows.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      createdAt: u.createdAt.toISOString(),
    })),
  );
});

router.get("/admin/orders", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const admin = await requireAdmin(req);
  if (!admin) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const rows = await db
    .select({
      o: ordersTable,
      itemCount: sql<number>`coalesce(sum(${orderItemsTable.quantity}), 0)::int`,
    })
    .from(ordersTable)
    .leftJoin(orderItemsTable, eq(orderItemsTable.orderId, ordersTable.id))
    .groupBy(ordersTable.id)
    .orderBy(desc(ordersTable.createdAt));
  res.json(
    rows.map((r) => ({
      id: r.o.id,
      reference: r.o.reference,
      status: r.o.status,
      total: Number(r.o.total),
      currency: r.o.currency,
      itemCount: r.itemCount,
      paymentMethod: r.o.paymentMethod,
      createdAt: r.o.createdAt.toISOString(),
    })),
  );
});

router.get("/admin/products", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const admin = await requireAdmin(req);
  if (!admin) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const items = await db
    .select(baseSelect)
    .from(productsTable)
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .leftJoin(vendorsTable, eq(productsTable.vendorId, vendorsTable.id))
    .orderBy(desc(productsTable.createdAt));
  res.json(items.map(serializeProduct));
});

export default router;

// ─── POST /admin/products ──────────────────────────────────────────────────
router.post("/admin/products", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const admin = await requireAdmin(req);
  if (!admin) { res.status(403).json({ error: "Forbidden" }); return; }

  const { title, description, price, compareAtPrice, stock, categoryId, imageUrl, isFeatured } = req.body;
  if (!title || !price || !categoryId) { res.status(400).json({ error: "Champs requis manquants" }); return; }

  const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") + "-" + Date.now();

  const [product] = await db.insert(productsTable).values({
    title, description, price: price.toString(),
    compareAtPrice: compareAtPrice ? compareAtPrice.toString() : null,
    stock: stock ?? 0, categoryId, imageUrl: imageUrl || null,
    isFeatured: isFeatured ?? false, slug,
  }).returning();

  res.status(201).json(product);
});

// ─── PUT /admin/products/:id ───────────────────────────────────────────────
router.put("/admin/products/:id", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const admin = await requireAdmin(req);
  if (!admin) { res.status(403).json({ error: "Forbidden" }); return; }

  const { id } = req.params;
  const { title, description, price, compareAtPrice, stock, categoryId, imageUrl, isFeatured } = req.body;

  const [product] = await db.update(productsTable).set({
    title, description,
    price: price?.toString(),
    compareAtPrice: compareAtPrice ? compareAtPrice.toString() : null,
    stock, categoryId, imageUrl, isFeatured,
  }).where(eq(productsTable.id, id)).returning();

  if (!product) { res.status(404).json({ error: "Produit introuvable" }); return; }
  res.json(product);
});

// ─── DELETE /admin/products/:id ────────────────────────────────────────────
router.delete("/admin/products/:id", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const admin = await requireAdmin(req);
  if (!admin) { res.status(403).json({ error: "Forbidden" }); return; }

  const { id } = req.params;
  await db.delete(productsTable).where(eq(productsTable.id, id));
  res.json({ success: true });
});

// ─── GET /admin/categories ─────────────────────────────────────────────────
router.get("/admin/categories", async (req, res) => {
  if (!req.isAuthenticated()) { res.status(401).json({ error: "Unauthorized" }); return; }
  const admin = await requireAdmin(req);
  if (!admin) { res.status(403).json({ error: "Forbidden" }); return; }

  const categories = await db.select().from(categoriesTable).orderBy(categoriesTable.sortOrder);
  res.json(categories);
});
