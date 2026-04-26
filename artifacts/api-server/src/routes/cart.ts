import { Router, type IRouter } from "express";
import {
  AddCartItemBody,
  UpdateCartItemBody,
  UpdateCartItemParams,
  RemoveCartItemParams,
} from "@workspace/api-zod";
import {
  db,
  cartsTable,
  cartItemsTable,
  productsTable,
} from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { ensureDbUser } from "../lib/dbUser";

const router: IRouter = Router();

async function getOrCreateCartId(userId: string): Promise<string> {
  const existing = await db
    .select({ id: cartsTable.id })
    .from(cartsTable)
    .where(eq(cartsTable.userId, userId))
    .limit(1);
  if (existing[0]) return existing[0].id;
  const [created] = await db.insert(cartsTable).values({ userId }).returning();
  return created!.id;
}

async function buildCart(userId: string) {
  const cartId = await getOrCreateCartId(userId);
  const rows = await db
    .select({
      id: cartItemsTable.id,
      productId: cartItemsTable.productId,
      productTitle: productsTable.title,
      productImage: productsTable.imageUrl,
      unitPrice: cartItemsTable.unitPrice,
      quantity: cartItemsTable.quantity,
      currency: productsTable.currency,
    })
    .from(cartItemsTable)
    .innerJoin(productsTable, eq(productsTable.id, cartItemsTable.productId))
    .where(eq(cartItemsTable.cartId, cartId));

  let subtotal = 0;
  let itemCount = 0;
  let currency = "MAD";
  const items = rows.map((r) => {
    const unit = Number(r.unitPrice);
    const lineTotal = unit * r.quantity;
    subtotal += lineTotal;
    itemCount += r.quantity;
    currency = r.currency;
    return {
      id: r.id,
      productId: r.productId,
      productTitle: r.productTitle,
      // REMPLACER ICI: image du produit dans le panier (URL).
      productImage: r.productImage,
      unitPrice: unit,
      quantity: r.quantity,
      lineTotal,
    };
  });

  return { items, subtotal, currency, itemCount };
}

router.get("/cart", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.json({ items: [], subtotal: 0, currency: "MAD", itemCount: 0 });
    return;
  }
  const user = await ensureDbUser({
    id: req.user.id,
    email: req.user.email ?? null,
    firstName: req.user.firstName ?? null,
    lastName: req.user.lastName ?? null,
    profileImageUrl: req.user.profileImageUrl ?? null,
  });
  res.json(await buildCart(user.id));
});

router.post("/cart/items", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = AddCartItemBody.safeParse(req.body);
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
  const cartId = await getOrCreateCartId(user.id);

  const productRows = await db
    .select({ id: productsTable.id, price: productsTable.price, stock: productsTable.stock })
    .from(productsTable)
    .where(eq(productsTable.id, parsed.data.productId))
    .limit(1);
  const product = productRows[0];
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }

  const existing = await db
    .select()
    .from(cartItemsTable)
    .where(and(eq(cartItemsTable.cartId, cartId), eq(cartItemsTable.productId, product.id)))
    .limit(1);

  if (existing[0]) {
    const newQty = Math.min(99, existing[0].quantity + parsed.data.quantity);
    await db
      .update(cartItemsTable)
      .set({ quantity: newQty })
      .where(eq(cartItemsTable.id, existing[0].id));
  } else {
    await db.insert(cartItemsTable).values({
      cartId,
      productId: product.id,
      quantity: parsed.data.quantity,
      unitPrice: product.price,
    });
  }

  res.json(await buildCart(user.id));
});

router.patch("/cart/items/:itemId", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = UpdateCartItemParams.safeParse(req.params);
  const body = UpdateCartItemBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }
  const user = await ensureDbUser({
    id: req.user.id,
    email: req.user.email ?? null,
    firstName: req.user.firstName ?? null,
    lastName: req.user.lastName ?? null,
    profileImageUrl: req.user.profileImageUrl ?? null,
  });
  const cartId = await getOrCreateCartId(user.id);
  await db
    .update(cartItemsTable)
    .set({ quantity: body.data.quantity })
    .where(and(eq(cartItemsTable.id, params.data.itemId), eq(cartItemsTable.cartId, cartId)));
  res.json(await buildCart(user.id));
});

router.delete("/cart/items/:itemId", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = RemoveCartItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const user = await ensureDbUser({
    id: req.user.id,
    email: req.user.email ?? null,
    firstName: req.user.firstName ?? null,
    lastName: req.user.lastName ?? null,
    profileImageUrl: req.user.profileImageUrl ?? null,
  });
  const cartId = await getOrCreateCartId(user.id);
  await db
    .delete(cartItemsTable)
    .where(and(eq(cartItemsTable.id, params.data.itemId), eq(cartItemsTable.cartId, cartId)));
  res.json(await buildCart(user.id));
});

router.post("/cart/clear", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const user = await ensureDbUser({
    id: req.user.id,
    email: req.user.email ?? null,
    firstName: req.user.firstName ?? null,
    lastName: req.user.lastName ?? null,
    profileImageUrl: req.user.profileImageUrl ?? null,
  });
  const cartId = await getOrCreateCartId(user.id);
  await db.delete(cartItemsTable).where(eq(cartItemsTable.cartId, cartId));
  res.json(await buildCart(user.id));
});

export default router;
