import { sql, relations } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  integer,
  numeric,
  timestamp,
  boolean,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { usersTable } from "./auth";

export const categoriesTable = pgTable(
  "categories",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    slug: varchar("slug", { length: 80 }).notNull(),
    name: varchar("name", { length: 80 }).notNull(),
    nameAr: varchar("name_ar", { length: 80 }),
    icon: varchar("icon", { length: 80 }),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("uq_categories_slug").on(table.slug)],
);

export const vendorsTable = pgTable(
  "vendors",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    shopName: varchar("shop_name", { length: 120 }).notNull(),
    description: text("description"),
    phone: varchar("phone", { length: 30 }).notNull(),
    city: varchar("city", { length: 80 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("uq_vendors_user").on(table.userId)],
);

export const productsTable = pgTable(
  "products",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    slug: varchar("slug", { length: 160 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description"),
    price: numeric("price", { precision: 12, scale: 2 }).notNull(),
    compareAtPrice: numeric("compare_at_price", { precision: 12, scale: 2 }),
    currency: varchar("currency", { length: 8 }).notNull().default("MAD"),
    stock: integer("stock").notNull().default(0),
    categoryId: varchar("category_id").notNull().references(() => categoriesTable.id),
    vendorId: varchar("vendor_id").references(() => vendorsTable.id, { onDelete: "set null" }),
    // REMPLACER ICI: image principale du produit (URL). Ajoutez votre URL/cdn ici plus tard.
    imageUrl: text("image_url"),
    // REMPLACER ICI: tableau d'URLs d'images pour la galerie produit.
    images: text("images").array().notNull().default(sql`ARRAY[]::text[]`),
    rating: numeric("rating", { precision: 3, scale: 2 }).notNull().default("0"),
    reviewCount: integer("review_count").notNull().default(0),
  viewCount: integer("view_count").notNull().default(0),
    isFeatured: boolean("is_featured").notNull().default(false),
    salesCount: integer("sales_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("uq_products_slug").on(table.slug),
    index("idx_products_category").on(table.categoryId),
    index("idx_products_vendor").on(table.vendorId),
  ],
);

export const productSpecsTable = pgTable("product_specs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => productsTable.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 80 }).notNull(),
  value: varchar("value", { length: 200 }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const cartsTable = pgTable(
  "carts",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    userId: varchar("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("uq_carts_user").on(table.userId)],
);

export const cartItemsTable = pgTable(
  "cart_items",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    cartId: varchar("cart_id").notNull().references(() => cartsTable.id, { onDelete: "cascade" }),
    productId: varchar("product_id").notNull().references(() => productsTable.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull().default(1),
    unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("uq_cart_items_cart_product").on(table.cartId, table.productId)],
);

export const ordersTable = pgTable(
  "orders",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    reference: varchar("reference", { length: 32 }).notNull(),
    userId: varchar("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    paymentMethod: varchar("payment_method", { length: 30 }).notNull(),
    paymentStatus: varchar("payment_status", { length: 20 }).notNull().default("unpaid"),
    paymentSessionId: varchar("payment_session_id", { length: 64 }),
    total: numeric("total", { precision: 12, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 8 }).notNull().default("MAD"),
    shippingFullName: varchar("shipping_full_name", { length: 120 }).notNull(),
    shippingPhone: varchar("shipping_phone", { length: 30 }).notNull(),
    shippingAddress: text("shipping_address").notNull(),
    shippingCity: varchar("shipping_city", { length: 80 }).notNull(),
    shippingNotes: text("shipping_notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("uq_orders_reference").on(table.reference),
    index("idx_orders_user").on(table.userId),
    index("idx_orders_status").on(table.status),
  ],
);

export const orderItemsTable = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => ordersTable.id, { onDelete: "cascade" }),
  productId: varchar("product_id").notNull().references(() => productsTable.id),
  vendorId: varchar("vendor_id").references(() => vendorsTable.id, { onDelete: "set null" }),
  productTitle: varchar("product_title", { length: 200 }).notNull(),
  productImage: text("product_image"),
  vendorName: varchar("vendor_name", { length: 120 }).notNull(),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull(),
  lineTotal: numeric("line_total", { precision: 12, scale: 2 }).notNull(),
});

export const productsRelations = relations(productsTable, ({ one, many }) => ({
  category: one(categoriesTable, { fields: [productsTable.categoryId], references: [categoriesTable.id] }),
  vendor: one(vendorsTable, { fields: [productsTable.vendorId], references: [vendorsTable.id] }),
  specs: many(productSpecsTable),
}));

export const ordersRelations = relations(ordersTable, ({ many, one }) => ({
  items: many(orderItemsTable),
  user: one(usersTable, { fields: [ordersTable.userId], references: [usersTable.id] }),
}));

export const orderItemsRelations = relations(orderItemsTable, ({ one }) => ({
  order: one(ordersTable, { fields: [orderItemsTable.orderId], references: [ordersTable.id] }),
  product: one(productsTable, { fields: [orderItemsTable.productId], references: [productsTable.id] }),
}));

export const cartItemsRelations = relations(cartItemsTable, ({ one }) => ({
  cart: one(cartsTable, { fields: [cartItemsTable.cartId], references: [cartsTable.id] }),
  product: one(productsTable, { fields: [cartItemsTable.productId], references: [productsTable.id] }),
}));

export const cartsRelations = relations(cartsTable, ({ many }) => ({
  items: many(cartItemsTable),
}));

export type Category = typeof categoriesTable.$inferSelect;
export type Vendor = typeof vendorsTable.$inferSelect;
export type Product = typeof productsTable.$inferSelect;
export type ProductSpec = typeof productSpecsTable.$inferSelect;
export type Cart = typeof cartsTable.$inferSelect;
export type CartItem = typeof cartItemsTable.$inferSelect;
export type Order = typeof ordersTable.$inferSelect;
export type OrderItem = typeof orderItemsTable.$inferSelect;

export const productViewsTable = pgTable(
  "product_views",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    productId: varchar("product_id").notNull().references(() => productsTable.id, { onDelete: "cascade" }),
    userId: varchar("user_id").references(() => usersTable.id, { onDelete: "set null" }),
    sessionId: text("session_id"),
    viewedAt: timestamp("viewed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_product_views_product").on(table.productId),
    index("idx_product_views_user").on(table.userId),
  ],
);
