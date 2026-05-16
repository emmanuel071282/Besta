import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { ChatWidget } from "@/components/ChatWidget";
import { SummerHeaderStrip } from "@/components/summer/SummerHeaderStrip";
import { SummerPopup } from "@/components/summer/SummerPopup";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import CategoryPage from "@/pages/CategoryPage";
import ProductPage from "@/pages/ProductPage";
import WishlistPage from "@/pages/WishlistPage";
import CheckoutPage from "@/pages/CheckoutPage";
import ExchangePolicyPage from "@/pages/ExchangePolicyPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import AccountPage from "@/pages/AccountPage";
import MyOrdersPage from "@/pages/MyOrdersPage";
import OrderDetailPage from "@/pages/OrderDetailPage";

import DashboardPage from "@/pages/admin/DashboardPage";
import AdminOrdersPage from "@/pages/admin/OrdersPage";
import SalesPage from "@/pages/admin/SalesPage";
import StoresPage from "@/pages/admin/StoresPage";
import InventoryPage from "@/pages/admin/InventoryPage";
import AdminSupportPage from "@/pages/admin/SupportPage";
import CampaignsPage from "@/pages/admin/CampaignsPage";
import SummerPage from "@/pages/SummerPage";

function StorefrontRouter() {
  return (
    <div className="flex flex-col min-h-screen">
      <SummerHeaderStrip />
      <Navbar />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/summer" component={SummerPage} />
          <Route path="/category/:category" component={CategoryPage} />
          <Route path="/product/:id" component={ProductPage} />
          <Route path="/wishlist" component={WishlistPage} />
          <Route path="/checkout" component={CheckoutPage} />
          <Route path="/exchange-policy" component={ExchangePolicyPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/account" component={AccountPage} />
          <Route path="/orders" component={MyOrdersPage} />
          <Route path="/orders/:id" component={OrderDetailPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <CartDrawer />
      <ChatWidget />
      <SummerPopup />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Switch>
          <Route path="/admin" component={DashboardPage} />
          <Route path="/admin/orders" component={AdminOrdersPage} />
          <Route path="/admin/sales" component={SalesPage} />
          <Route path="/admin/stores" component={StoresPage} />
          <Route path="/admin/inventory" component={InventoryPage} />
          <Route path="/admin/support" component={AdminSupportPage} />
          <Route path="/admin/campaigns" component={CampaignsPage} />
          <Route component={StorefrontRouter} />
        </Switch>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
