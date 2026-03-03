import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Layout & UI
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import NotFound from "@/pages/not-found";

// Pages
import Home from "@/pages/Home";
import CategoryPage from "@/pages/CategoryPage";
import ProductPage from "@/pages/ProductPage";
import WishlistPage from "@/pages/WishlistPage";
import CheckoutPage from "@/pages/CheckoutPage";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/category/:category" component={CategoryPage} />
          <Route path="/product/:id" component={ProductPage} />
          <Route path="/wishlist" component={WishlistPage} />
          <Route path="/checkout" component={CheckoutPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
