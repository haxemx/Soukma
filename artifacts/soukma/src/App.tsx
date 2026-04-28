import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import "@/lib/api";

import HomePage from "@/pages/Home";
import ProductsPage from "@/pages/Products";
import ProductDetailPage from "@/pages/ProductDetail";
import CartPage from "@/pages/Cart";
import CheckoutPage from "@/pages/Checkout";
import PaymentMockPage from "@/pages/PaymentMock";
import OrdersPage from "@/pages/Orders";
import OrderDetailPage from "@/pages/OrderDetail";
import LoginPage from "@/pages/Login";
import VendorOnboardingPage from "@/pages/VendorOnboarding";
import VendorDashboardPage from "@/pages/vendor/VendorDashboard";
import VendorProductsPage from "@/pages/vendor/VendorProducts";
import VendorOrdersPage from "@/pages/vendor/VendorOrders";
import AdminDashboardPage from "@/pages/admin/AdminDashboard";
import AdminUsersPage from "@/pages/admin/AdminUsers";
import AdminOrdersPage from "@/pages/admin/AdminOrders";
import AdminProductsPage from "@/pages/admin/AdminProducts";
import AdminLoginPage from "@/pages/admin/AdminLogin";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/products" component={ProductsPage} />
      <Route path="/products/:id" component={ProductDetailPage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/checkout/:id/pay" component={PaymentMockPage} />
      <Route path="/orders" component={OrdersPage} />
      <Route path="/orders/:id" component={OrderDetailPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/vendor/onboarding" component={VendorOnboardingPage} />
      <Route path="/vendor" component={VendorDashboardPage} />
      <Route path="/vendor/products" component={VendorProductsPage} />
      <Route path="/vendor/orders" component={VendorOrdersPage} />
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin" component={AdminDashboardPage} />
      <Route path="/admin/users" component={AdminUsersPage} />
      <Route path="/admin/orders" component={AdminOrdersPage} />
      <Route path="/admin/products" component={AdminProductsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
