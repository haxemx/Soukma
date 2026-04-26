/**
 * Payment routes — soukMA
 * ----------------------------------------------------------------------------
 * Cette implémentation est un PLACEHOLDER pour CMI / CIH Pay.
 * Quand vous obtiendrez vos identifiants marchand CMI ou CIH Pay :
 *   1. Stockez vos clés dans des variables d'environnement
 *      (CMI_MERCHANT_ID, CMI_STORE_KEY, CIH_API_KEY, etc.)
 *   2. Remplacez la logique « simulée » de `initiatePayment` ci-dessous par
 *      l'appel réel à l'API CMI/CIH (génération du formulaire signé HMAC-SHA512
 *      pour CMI, ou requête REST pour CIH Pay).
 *   3. Branchez `confirmPayment` au callback IPN (Server-to-Server) du
 *      fournisseur, en vérifiant la signature avant de marquer la commande payée.
 */
import { Router, type IRouter } from "express";
import { InitiatePaymentBody, ConfirmPaymentBody } from "@workspace/api-zod";
import { db, ordersTable, orderItemsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ensureDbUser } from "../lib/dbUser";

const router: IRouter = Router();

router.post("/payment/initiate", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = InitiatePaymentBody.safeParse(req.body);
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
  const orderRows = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, parsed.data.orderId))
    .limit(1);
  const order = orderRows[0];
  if (!order || order.userId !== user.id) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const provider = order.paymentMethod === "cih_pay" ? "cih_pay" : "cmi";
  const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  await db
    .update(ordersTable)
    .set({ paymentSessionId: sessionId })
    .where(eq(ordersTable.id, order.id));

  // REMPLACER ICI: redirectUrl doit pointer vers la page CMI/CIH Pay réelle
  // (https://payment.cmi.co.ma/fim/est3Dgate ou équivalent CIH Pay).
  const redirectUrl = `/checkout/${order.id}/pay?session=${sessionId}`;

  res.json({
    orderId: order.id,
    provider,
    redirectUrl,
    sessionId,
  });
});

router.post("/payment/confirm", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const parsed = ConfirmPaymentBody.safeParse(req.body);
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
  const orderRows = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, parsed.data.orderId))
    .limit(1);
  const order = orderRows[0];
  if (!order || order.userId !== user.id) {
    res.status(404).json({ error: "Order not found" });
    return;
  }
  if (order.paymentSessionId !== parsed.data.sessionId) {
    res.status(400).json({ error: "Invalid session" });
    return;
  }

  // REMPLACER ICI: dans une vraie intégration CMI, on vérifierait ici la
  // signature HMAC-SHA512 du callback et le statut "Approved" renvoyé.
  await db
    .update(ordersTable)
    .set({ status: "paid", paymentStatus: "paid" })
    .where(eq(ordersTable.id, order.id));

  const items = await db
    .select()
    .from(orderItemsTable)
    .where(eq(orderItemsTable.orderId, order.id));

  res.json({
    id: order.id,
    reference: order.reference,
    status: "paid",
    total: Number(order.total),
    currency: order.currency,
    itemCount: items.reduce((s, i) => s + i.quantity, 0),
    paymentMethod: order.paymentMethod,
    createdAt: order.createdAt.toISOString(),
    items: items.map((i) => ({
      id: i.id,
      productId: i.productId,
      productTitle: i.productTitle,
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
  });
});

export default router;
