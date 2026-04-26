import { Router, type IRouter } from "express";
import {
  CreateVendorProductBody,
  UpdateVendorProductBody,
  UpdateVendorProductParams,
  DeleteVendorProductParams,
} from "@workspace/api-zod";
import {
  db,
  productsTable,
  categoriesTable,
  vendorsTable,
  ordersTable,
  orderItemsTable,
} from "@workspace/db";
import { and, desc, eq, inArray, sql, lte } from "drizzle-orm";
import { ensureDbUser, getUserVendor } from "../lib/dbUser";

const router: IRouter = Router();

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);
}

function serializeProduct(row: {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  price: string;
  compareAtPrice: string | null;
  currency: string;
  stock: number;
  categorySlug: string | null;
  categoryName: string | null;
  vendorId: string | null;
  vendorName: string | null;
  imageUrl: string | null;
  rating: string;
  reviewCount: number;
  isFeatured: boolean;
  createdAt: Date;
}) {
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
    // REMPLACER ICI: image principale du produit (URL).
    imageUrl: row.imageUrl,
    rating: Number(row.rating),
    reviewCount: row.reviewCount,
    isFeatured: row.isFeatured,
    createdAt: row.createdAt.toISOString(),
  };
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

async function requireVendor(req: Express.Request) {
  if (!req.user) return null;
  const user = await ensureDbUser({
    id: req.user.id,
    email: req.user.email ?? null,
    firstName: req.user.firstName ?? null,
    lastName: req.user.lastName ?? null,
    profileImageUrl: req.user.profileImageUrl ?? null,
  });
  const vendor = await getUserVendor(user.id);
  if (!vendor) return null;
  return { user, vendor };
}

router.get("/vendor/products", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const ctx = await requireVendor(req);
  if (!ctx) {
    res.status(403).json({ error: "Not a vendor" });
    return;
  }
  const items = await db
    .select(baseSelect)
    .from(productsTable)
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .leftJoin(vendorsTable, eq(productsTable.vendorId, vendorsTable.id))
    .where(eq(productsTable.vendorId, ctx.vendor.id))
    .orderBy(desc(productsTable.createdAt));
  res.json(items.map(serializeProduct));
});

router.post("/vendor/products", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const ctx = await requireVendor(req);
  if (!ctx) {
    res.status(403).json({ error: "Not a vendor" });
    return;
  }
  const parsed = CreateVendorProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid body" });
    return;
  }
  const cat = await db
    .select({ id: categoriesTable.id })
    .from(categoriesTable)
    .where(eq(categoriesTable.slug, parsed.data.categorySlug))
    .limit(1);
  if (!cat[0]) {
    res.status(400).json({ error: "Unknown category" });
    return;
  }
  const slug = `${slugify(parsed.data.title)}-${Math.random().toString(36).slice(2, 6)}`;
  const [created] = await db
    .insert(productsTable)
    .values({
      slug,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      price: parsed.data.price.toString(),
      compareAtPrice: parsed.data.compareAtPrice != null ? parsed.data.compareAtPrice.toString() : null,
      stock: parsed.data.stock,
      categoryId: cat[0].id,
      vendorId: ctx.vendor.id,
      // REMPLACER ICI: imageUrl envoyée par le vendeur (URL CDN).
      imageUrl: parsed.data.imageUrl ?? null,
    })
    .returning();

  const rows = await db
    .select(baseSelect)
    .from(productsTable)
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .leftJoin(vendorsTable, eq(productsTable.vendorId, vendorsTable.id))
    .where(eq(productsTable.id, created!.id))
    .limit(1);
  res.json(serializeProduct(rows[0]!));
});

router.patch("/vendor/products/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const ctx = await requireVendor(req);
  if (!ctx) {
    res.status(403).json({ error: "Not a vendor" });
    return;
  }
  const params = UpdateVendorProductParams.safeParse(req.params);
  const body = UpdateVendorProductBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const ownership = await db
    .select({ id: productsTable.id })
    .from(productsTable)
    .where(and(eq(productsTable.id, params.data.id), eq(productsTable.vendorId, ctx.vendor.id)))
    .limit(1);
  if (!ownership[0]) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const update: Record<string, unknown> = {};
  if (body.data.title) update["title"] = body.data.title;
  if (body.data.description !== undefined) update["description"] = body.data.description;
  if (body.data.price !== undefined) update["price"] = body.data.price.toString();
  if (body.data.compareAtPrice !== undefined)
    update["compareAtPrice"] = body.data.compareAtPrice == null ? null : body.data.compareAtPrice.toString();
  if (body.data.stock !== undefined) update["stock"] = body.data.stock;
  if (body.data.imageUrl !== undefined) update["imageUrl"] = body.data.imageUrl;
  if (body.data.isFeatured !== undefined) update["isFeatured"] = body.data.isFeatured;
  if (body.data.categorySlug) {
    const cat = await db
      .select({ id: categoriesTable.id })
      .from(categoriesTable)
      .where(eq(categoriesTable.slug, body.data.categorySlug))
      .limit(1);
    if (cat[0]) update["categoryId"] = cat[0].id;
  }

  if (Object.keys(update).length > 0) {
    await db.update(productsTable).set(update).where(eq(productsTable.id, params.data.id));
  }

  const rows = await db
    .select(baseSelect)
    .from(productsTable)
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .leftJoin(vendorsTable, eq(productsTable.vendorId, vendorsTable.id))
    .where(eq(productsTable.id, params.data.id))
    .limit(1);
  res.json(serializeProduct(rows[0]!));
});

router.delete("/vendor/products/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const ctx = await requireVendor(req);
  if (!ctx) {
    res.status(403).json({ error: "Not a vendor" });
    return;
  }
  const params = DeleteVendorProductParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  await db
    .delete(productsTable)
    .where(and(eq(productsTable.id, params.data.id), eq(productsTable.vendorId, ctx.vendor.id)));
  res.json({ success: true });
});

router.get("/vendor/orders", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const ctx = await requireVendor(req);
  if (!ctx) {
    res.status(403).json({ error: "Not a vendor" });
    return;
  }
  const orderIdsRows = await db
    .selectDistinct({ id: orderItemsTable.orderId })
    .from(orderItemsTable)
    .where(eq(orderItemsTable.vendorId, ctx.vendor.id));
  const ids = orderIdsRows.map((r) => r.id);
  if (ids.length === 0) {
    res.json([]);
    return;
  }
  const rows = await db
    .select({
      o: ordersTable,
      itemCount: sql<number>`coalesce(sum(${orderItemsTable.quantity}), 0)::int`,
    })
    .from(ordersTable)
    .leftJoin(orderItemsTable, eq(orderItemsTable.orderId, ordersTable.id))
    .where(inArray(ordersTable.id, ids))
    .groupBy(ordersTable.id)
    .orderBy(desc(ordersTable.createdAt));

  res.json(
    rows.map((row) => ({
      id: row.o.id,
      reference: row.o.reference,
      status: row.o.status,
      total: Number(row.o.total),
      currency: row.o.currency,
      itemCount: row.itemCount,
      paymentMethod: row.o.paymentMethod,
      createdAt: row.o.createdAt.toISOString(),
    })),
  );
});

router.get("/vendor/stats", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const ctx = await requireVendor(req);
  if (!ctx) {
    res.status(403).json({ error: "Not a vendor" });
    return;
  }

  const [totalProductsRow] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(productsTable)
    .where(eq(productsTable.vendorId, ctx.vendor.id));

  const [revenueRow] = await db
    .select({
      revenue: sql<number>`coalesce(sum(${orderItemsTable.lineTotal}), 0)::float`,
      orders: sql<number>`count(distinct ${orderItemsTable.orderId})::int`,
    })
    .from(orderItemsTable)
    .where(eq(orderItemsTable.vendorId, ctx.vendor.id));

  const [lowStockRow] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(productsTable)
    .where(and(eq(productsTable.vendorId, ctx.vendor.id), lte(productsTable.stock, 5)));

  const recentOrderIds = await db
    .selectDistinct({ id: orderItemsTable.orderId })
    .from(orderItemsTable)
    .where(eq(orderItemsTable.vendorId, ctx.vendor.id))
    .limit(50);

  let recentOrders: any[] = [];
  if (recentOrderIds.length > 0) {
    const rows = await db
      .select({
        o: ordersTable,
        itemCount: sql<number>`coalesce(sum(${orderItemsTable.quantity}), 0)::int`,
      })
      .from(ordersTable)
      .leftJoin(orderItemsTable, eq(orderItemsTable.orderId, ordersTable.id))
      .where(inArray(ordersTable.id, recentOrderIds.map((r) => r.id)))
      .groupBy(ordersTable.id)
      .orderBy(desc(ordersTable.createdAt))
      .limit(5);
    recentOrders = rows.map((row) => ({
      id: row.o.id,
      reference: row.o.reference,
      status: row.o.status,
      total: Number(row.o.total),
      currency: row.o.currency,
      itemCount: row.itemCount,
      paymentMethod: row.o.paymentMethod,
      createdAt: row.o.createdAt.toISOString(),
    }));
  }

  const topProducts = await db
    .select(baseSelect)
    .from(productsTable)
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .leftJoin(vendorsTable, eq(productsTable.vendorId, vendorsTable.id))
    .where(eq(productsTable.vendorId, ctx.vendor.id))
    .orderBy(desc(productsTable.salesCount))
    .limit(5);

  res.json({
    totalProducts: totalProductsRow?.c ?? 0,
    totalOrders: revenueRow?.orders ?? 0,
    revenue: revenueRow?.revenue ?? 0,
    currency: "MAD",
    lowStockCount: lowStockRow?.c ?? 0,
    recentOrders,
    topProducts: topProducts.map(serializeProduct),
  });
});

export default router;
