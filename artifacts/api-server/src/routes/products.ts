import { Router, type IRouter } from "express";
import { ListProductsQueryParams, GetProductParams } from "@workspace/api-zod";
import {
  db,
  productsTable,
  categoriesTable,
  vendorsTable,
  productSpecsTable,
} from "@workspace/db";
import { productViewsTable } from "@workspace/db/schema";
import { and, asc, desc, eq, ilike, gte, lte, sql, or } from "drizzle-orm";

const router: IRouter = Router();

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
  viewCount: number;
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
    imageUrl: row.imageUrl,
    rating: Number(row.rating),
    reviewCount: row.reviewCount,
    viewCount: row.viewCount,
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
  viewCount: productsTable.viewCount,
  isFeatured: productsTable.isFeatured,
  createdAt: productsTable.createdAt,
};

router.get("/products", async (req, res) => {
  const parsed = ListProductsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid query" });
    return;
  }
  const { search, categorySlug, minPrice, maxPrice, sort, limit, offset } = parsed.data;
  const where = [] as ReturnType<typeof eq>[];
  if (search) {
    const like = `%${search}%`;
    const searchCondition = or(
      ilike(productsTable.title, like),
      ilike(productsTable.description, like),
    );
    if (searchCondition) where.push(searchCondition);
  }
  if (categorySlug) where.push(eq(categoriesTable.slug, categorySlug));
  if (minPrice != null) where.push(gte(sql`${productsTable.price}::numeric`, sql`${minPrice}`));
  if (maxPrice != null) where.push(lte(sql`${productsTable.price}::numeric`, sql`${maxPrice}`));

  let orderBy;
  switch (sort) {
    case "priceAsc":
      orderBy = asc(productsTable.price);
      break;
    case "priceDesc":
      orderBy = desc(productsTable.price);
      break;
    case "popular":
      orderBy = desc(productsTable.salesCount);
      break;
    default:
      orderBy = desc(productsTable.createdAt);
  }

  const finalLimit = limit ?? 24;
  const finalOffset = offset ?? 0;

  const items = await db
    .select(baseSelect)
    .from(productsTable)
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .leftJoin(vendorsTable, eq(productsTable.vendorId, vendorsTable.id))
    .where(where.length > 0 ? and(...where) : undefined)
    .orderBy(orderBy)
    .limit(finalLimit)
    .offset(finalOffset);

  const totalRow = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(productsTable)
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(where.length > 0 ? and(...where) : undefined);

  res.json({
    items: items.map(serializeProduct),
    total: totalRow[0]?.count ?? 0,
  });
});

router.get("/products/featured", async (_req, res) => {
  const items = await db
    .select(baseSelect)
    .from(productsTable)
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .leftJoin(vendorsTable, eq(productsTable.vendorId, vendorsTable.id))
    .where(eq(productsTable.isFeatured, true))
    .orderBy(desc(productsTable.createdAt))
    .limit(8);
  res.json(items.map(serializeProduct));
});

router.get("/products/trending", async (_req, res) => {
  const items = await db
    .select(baseSelect)
    .from(productsTable)
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .leftJoin(vendorsTable, eq(productsTable.vendorId, vendorsTable.id))
    .orderBy(desc(productsTable.salesCount), desc(productsTable.createdAt))
    .limit(8);
  res.json(items.map(serializeProduct));
});

router.get("/products/:id", async (req, res) => {
  const parsed = GetProductParams.safeParse(req.params);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const rows = await db
    .select(baseSelect)
    .from(productsTable)
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .leftJoin(vendorsTable, eq(productsTable.vendorId, vendorsTable.id))
    .where(eq(productsTable.id, parsed.data.id))
    .limit(1);
  const row = rows[0];
  if (!row) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  // Incrémenter le compteur de vues (clients seulement)
  const userRole = (req as any).user?.role;
  const isClient = userRole === 'customer';
  if (isClient) {
    await db
      .update(productsTable)
      .set({ viewCount: sql`${productsTable.viewCount} + 1` })
      .where(eq(productsTable.id, parsed.data.id));
    if ((req as any).user?.id) {
      await db.insert(productViewsTable).values({
        productId: parsed.data.id,
        userId: (req as any).user.id,
        viewedAt: new Date(),
      });
    }
  }

  const specs = await db
    .select({ label: productSpecsTable.label, value: productSpecsTable.value })
    .from(productSpecsTable)
    .where(eq(productSpecsTable.productId, parsed.data.id))
    .orderBy(asc(productSpecsTable.sortOrder));

  const productRow = await db
    .select({ images: productsTable.images })
    .from(productsTable)
    .where(eq(productsTable.id, parsed.data.id))
    .limit(1);

  const images = productRow[0]?.images ?? [];

  res.json({
    ...serializeProduct(row),
    images,
    specs,
  });
});

export default router;
