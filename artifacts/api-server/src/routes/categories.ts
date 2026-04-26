import { Router, type IRouter } from "express";
import { db, categoriesTable, productsTable } from "@workspace/db";
import { eq, sql, asc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/categories", async (_req, res) => {
  const rows = await db
    .select({
      id: categoriesTable.id,
      slug: categoriesTable.slug,
      name: categoriesTable.name,
      nameAr: categoriesTable.nameAr,
      icon: categoriesTable.icon,
      productCount: sql<number>`coalesce(count(${productsTable.id}), 0)::int`,
    })
    .from(categoriesTable)
    .leftJoin(productsTable, eq(productsTable.categoryId, categoriesTable.id))
    .groupBy(categoriesTable.id)
    .orderBy(asc(categoriesTable.sortOrder), asc(categoriesTable.name));

  res.json(rows);
});

export default router;
