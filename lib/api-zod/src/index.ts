// Re-export operation-level Zod schemas (request bodies, params, query, responses)
export * from "./generated/api";

// Re-export non-conflicting component types from generated/types.
// We exclude the *Body schemas that already live in api.ts to avoid the
// duplicate export conflict caused by orval generating both forms.
export type {
  AdminStats,
  AdminStatsOrdersByStatusItem,
  AdminStatsTopCategoriesItem,
  AdminUser,
  AuthorizationSessionHeaderParameter,
  AuthUser,
  AuthUserEnvelope,
  BeginBrowserLoginParams,
  Cart,
  CartItem,
  Category,
  CreateProductBody,
  ErrorEnvelope,
  HandleBrowserLoginCallbackParams,
  HealthStatus,
  ListProductsParams,
  MyProfile,
  Order,
  OrderDetail,
  OrderItem,
  PaymentSession,
  Product,
  ProductDetail,
  ProductList,
  ProductSpec,
  ShippingAddress,
  SuccessEnvelope,
  UpdateProductBody,
  Vendor,
  VendorStats,
} from "./generated/types";

export {
  AdminUserRole,
  ListProductsSort,
  MyProfileRole,
  OrderPaymentMethod,
  OrderStatus,
  PaymentSessionProvider,
  PlaceOrderBodyPaymentMethod,
  UpdateOrderStatusBodyStatus,
} from "./generated/types";
