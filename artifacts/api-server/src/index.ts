import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});

// Auto-update featured products based on viewCount + salesCount
import { db, productsTable } from "@workspace/db";
import { desc, sql } from "drizzle-orm";

async function updateFeaturedProducts() {
  // Top 3 produits par popularité (vues + ventes) → isFeatured = true
  // Le reste → isFeatured = false
  await db.execute(sql`
    UPDATE products
    SET is_featured = false
  `);
  await db.execute(sql`
    UPDATE products
    SET is_featured = true
    WHERE id IN (
      SELECT id FROM products
      ORDER BY (view_count + sales_count * 3) DESC
      LIMIT 3
    )
  `);
}

// Run immediately on startup, then every hour
updateFeaturedProducts().catch(console.error);
setInterval(() => updateFeaturedProducts().catch(console.error), 60 * 60 * 1000);
