import { Router, type IRouter } from "express";
import {
  PlaceOrderBody,
  GetOrderParams,
  UpdateOrderStatusParams,
  UpdateOrderStatusBody,
} from "@workspace/api-zod";
import {
  db,
  ordersTable,
  orderItemsTable,
  cartsTable,
  cartItemsTable,
  productsTable,
  vendorsTable,
} from "@workspace/db";
import { and, desc, eq, sql } from "drizzle-orm";
import { ensureDbUser } from "../lib/dbUser";

const router: IRouter = Router();

function makeReference(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MA-${ts}-${rand}`;
}

function serializeOrder(row: typeof ordersTable.$inferSelect, itemCount: number) {
  return {
    id: row.id,
    reference: row.reference,
    status: row.status,
    total: Number(row.total),
    currency: row.currency,
    itemCount,
    paymentMethod: row.paymentMethod,
    createdAt: row.createdAt.toISOString(),
  };
}

async function loadOrderDetail(orderId: string) {
  const orderRows = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, orderId))
    .limit(1);
  const order = orderRows[0];
  if (!order) return null;
  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, order.id));
  return {
    ...serializeOrder(order, items.reduce((s, i) => s + i.quantity, 0)),
    items: items.map((i) => ({
      id: i.id,
      productId: i.productId,
      productTitle: i.productTitle,
      // REMPLACER ICI: image du produit dans la commande (URL).
      productImage: i.productImage,
      unitPrice: Number(i.unitPrice),
      quantity: i.quantity,
      lineTotal: Number(i.lineTotal),
      vendorName: i.vendorName,
    })),
    shipping: {
      fullName: order.shippingFullName,
      phone: order.shippingPhone,
      address: order.shippingAddress,
      city: order.shippingCity,
      notes: order.shippingNotes,
    },
  };
}

router.get("/orders", async (req, res) => {
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
  const orders = await db
    .select({
      o: ordersTable,
      itemCount: sql<number>`coalesce(sum(${orderItemsTable.quantity}), 0)::int`,
    })
    .from(ordersTable)
    .leftJoin(orderItemsTable, eq(orderItemsTable.orderId, ordersTable.id))
    .where(eq(ordersTable.userId, user.id))
    .groupBy(ordersTable.id)
    .orderBy(desc(ordersTable.createdAt));
  res.json(orders.map((row) => serializeOrder(row.o, row.itemCount)));
});

router.post("/orders", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = PlaceOrderBody.safeParse(req.body);
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

  const cartRow = await db
    .select({ id: cartsTable.id })
    .from(cartsTable)
    .where(eq(cartsTable.userId, user.id))
    .limit(1);
  if (!cartRow[0]) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }

  const items = await db
    .select({
      ci: cartItemsTable,
      p: productsTable,
      vendorName: vendorsTable.shopName,
      vendorId: vendorsTable.id,
    })
    .from(cartItemsTable)
    .innerJoin(productsTable, eq(productsTable.id, cartItemsTable.productId))
    .leftJoin(vendorsTable, eq(vendorsTable.id, productsTable.vendorId))
    .where(eq(cartItemsTable.cartId, cartRow[0].id));

  if (items.length === 0) {
    res.status(400).json({ error: "Cart is empty" });
    return;
  }

  let total = 0;
  const orderItems = items.map((row) => {
    const unit = Number(row.ci.unitPrice);
    const lineTotal = unit * row.ci.quantity;
    total += lineTotal;
    return {
      productId: row.p.id,
      vendorId: row.vendorId,
      productTitle: row.p.title,
      productImage: row.p.imageUrl,
      vendorName: row.vendorName ?? "soukMA Officiel",
      unitPrice: row.ci.unitPrice,
      quantity: row.ci.quantity,
      lineTotal: lineTotal.toFixed(2),
    };
  });

  const reference = makeReference();
  const initialStatus =
    parsed.data.paymentMethod === "cash_on_delivery" ? "processing" : "pending";
  const initialPaymentStatus =
    parsed.data.paymentMethod === "cash_on_delivery" ? "pending" : "unpaid";

  const [order] = await db
    .insert(ordersTable)
    .values({
      reference,
      userId: user.id,
      status: initialStatus,
      paymentMethod: parsed.data.paymentMethod,
      paymentStatus: initialPaymentStatus,
      total: total.toFixed(2),
      currency: "MAD",
      shippingFullName: parsed.data.shipping.fullName,
      shippingPhone: parsed.data.shipping.phone,
      shippingAddress: parsed.data.shipping.address,
      shippingCity: parsed.data.shipping.city,
      shippingNotes: parsed.data.shipping.notes ?? null,
    })
    .returning();

  await db.insert(orderItemsTable).values(
    orderItems.map((it) => ({
      orderId: order!.id,
      productId: it.productId,
      vendorId: it.vendorId,
      productTitle: it.productTitle,
      productImage: it.productImage,
      vendorName: it.vendorName,
      unitPrice: it.unitPrice,
      quantity: it.quantity,
      lineTotal: it.lineTotal,
    })),
  );

  // Decrement stock and bump sales count
  for (const it of items) {
    await db
      .update(productsTable)
      .set({
        stock: sql`greatest(0, ${productsTable.stock} - ${it.ci.quantity})`,
        salesCount: sql`${productsTable.salesCount} + ${it.ci.quantity}`,
      })
      .where(eq(productsTable.id, it.p.id));
  }

  // Empty the cart
  await db.delete(cartItemsTable).where(eq(cartItemsTable.cartId, cartRow[0].id));

  const detail = await loadOrderDetail(order!.id);
  res.json(detail);
});

router.get("/orders/:id", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = GetOrderParams.safeParse(req.params);
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
  const orderRows = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, params.data.id))
    .limit(1);
  const order = orderRows[0];
  if (!order) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  if (order.userId !== user.id && user.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  res.json(await loadOrderDetail(order.id));
});

router.patch("/orders/:id/status", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const params = UpdateOrderStatusParams.safeParse(req.params);
  const body = UpdateOrderStatusBody.safeParse(req.body);
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
  if (user.role !== "admin" && user.role !== "vendor") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  await db
    .update(ordersTable)
    .set({ status: body.data.status })
    .where(eq(ordersTable.id, params.data.id));
  const detail = await loadOrderDetail(params.data.id);
  if (!detail) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json(detail);
});

export default router;
