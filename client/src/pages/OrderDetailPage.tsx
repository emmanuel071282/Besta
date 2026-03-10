import { useEffect } from "react";
import { useLocation, useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, ArrowLeft, Check, Truck, Package, Clock, XCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Order, OrderItem } from "@shared/schema";
import { ORDER_STATUSES } from "@shared/schema";

type OrderDetail = Order & {
  items: (OrderItem & { productName?: string; productImage?: string })[];
};

const statusIcons: Record<string, any> = {
  placed: Clock,
  confirmed: Check,
  shipped: Truck,
  delivered: Package,
  cancelled: XCircle,
  returned: RotateCcw,
};

export default function OrderDetailPage() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/orders/:id");
  const { isLoggedIn, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !isLoggedIn) navigate("/login");
  }, [authLoading, isLoggedIn, navigate]);

  const orderId = match ? Number(params!.id) : 0;

  const { data: order, isLoading } = useQuery<OrderDetail>({
    queryKey: ["/api/orders", orderId],
    queryFn: async () => {
      const res = await fetch(`/api/orders/${orderId}`, { credentials: "include" });
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
    enabled: orderId > 0 && isLoggedIn,
  });

  if (authLoading || isLoading) {
    return <div className="min-h-screen bg-background pt-28 pb-20 flex items-start justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background pt-28 pb-20 px-4 text-center">
        <p className="text-muted-foreground">Order not found</p>
        <Link href="/orders" className="text-sm underline mt-4 inline-block">Back to orders</Link>
      </div>
    );
  }

  const activeStepIndex = ORDER_STATUSES.indexOf(order.status as any);
  const isCancelledOrReturned = order.status === "cancelled" || order.status === "returned";
  const trackingStatuses = isCancelledOrReturned
    ? ORDER_STATUSES.filter(s => s !== "cancelled" && s !== "returned")
    : ORDER_STATUSES.filter(s => s !== "cancelled" && s !== "returned");

  return (
    <div className="min-h-screen bg-background pt-28 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/orders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </Link>

        <div className="border border-border p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg font-bold" data-testid="text-order-number">{order.orderNumber}</h1>
              <p className="text-xs text-muted-foreground mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <span className={cn(
              "text-[10px] uppercase tracking-wider font-semibold px-3 py-1 rounded",
              order.status === "delivered" ? "bg-green-100 text-green-800" :
              isCancelledOrReturned ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
            )}>
              {order.status}
            </span>
          </div>

          {!isCancelledOrReturned && (
            <div className="flex items-center gap-2 mt-6 mb-2">
              {trackingStatuses.map((step, i) => {
                const isCompleted = i <= activeStepIndex;
                const Icon = statusIcons[step] || Clock;
                return (
                  <div key={step} className="flex items-center flex-1">
                    <div className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0",
                      isCompleted ? "bg-foreground border-foreground text-background" : "border-border text-muted-foreground"
                    )}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    {i < trackingStatuses.length - 1 && (
                      <div className={cn("flex-1 h-0.5 mx-1", isCompleted && i < activeStepIndex ? "bg-foreground" : "bg-border")} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {!isCancelledOrReturned && (
            <div className="flex gap-2">
              {trackingStatuses.map((step) => (
                <div key={step} className="flex-1 text-center">
                  <span className="text-[8px] uppercase tracking-widest text-muted-foreground">{step}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border border-border mb-6">
          <div className="p-4 border-b border-border">
            <h2 className="text-sm font-semibold uppercase tracking-widest">Items</h2>
          </div>
          <div className="divide-y divide-border/50">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4" data-testid={`order-item-${item.id}`}>
                {item.productImage && (
                  <img src={item.productImage} alt="" className="w-16 h-16 object-cover" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.productName || `Product #${item.productId}`}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.size && item.size !== "Free Size" && `Size: ${item.size} · `}Qty: {item.quantity}
                  </p>
                </div>
                <p className="font-semibold text-sm">₹{Number(item.price).toLocaleString("en-IN")}</p>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-border flex justify-between items-center">
            <span className="text-sm font-semibold uppercase tracking-widest">Total</span>
            <span className="text-lg font-bold">₹{Number(order.totalAmount).toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div className="border border-border p-5">
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-3">Delivery Address</h2>
          <p className="text-sm">{order.shippingName}</p>
          <p className="text-sm text-muted-foreground">{order.shippingAddress}</p>
          <p className="text-sm text-muted-foreground">{order.shippingCity}, {order.shippingState} - {order.shippingPincode}</p>
          <p className="text-sm text-muted-foreground mt-1">Phone: {order.shippingPhone}</p>
        </div>
      </div>
    </div>
  );
}
