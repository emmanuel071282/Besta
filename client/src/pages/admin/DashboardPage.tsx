import { useQuery } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { IndianRupee, ShoppingCart, Store, Package, Loader2 } from "lucide-react";
import type { Order } from "@shared/schema";

export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<{ totalOrders: number; totalRevenue: number; totalProducts: number; activeStores: number }>({
    queryKey: ["/api/admin/dashboard"],
  });

  const { data: recentOrders } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  const statCards = [
    { label: "Total Revenue", value: stats ? `₹${Number(stats.totalRevenue).toLocaleString("en-IN")}` : "—", icon: IndianRupee, color: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    { label: "Total Orders", value: stats?.totalOrders ?? "—", icon: ShoppingCart, color: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    { label: "Active Stores", value: stats?.activeStores ?? "—", icon: Store, color: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
    { label: "Total Products", value: stats?.totalProducts ?? "—", icon: Package, color: "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  ];

  const statusColors: Record<string, string> = {
    placed: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    shipped: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    returned: "bg-gray-100 text-gray-800",
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight" data-testid="text-admin-dashboard-title">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Overview of your BESTA platform</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {statCards.map((card) => (
              <div key={card.label} className="bg-background border border-border p-6" data-testid={`stat-${card.label.toLowerCase().replace(/\s+/g, "-")}`}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">{card.label}</span>
                  <div className={`w-8 h-8 flex items-center justify-center rounded ${card.color}`}>
                    <card.icon className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-background border border-border">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold">Recent Orders</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Order #</th>
                    <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Amount</th>
                    <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Status</th>
                    <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(!recentOrders || recentOrders.length === 0) ? (
                    <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No orders yet</td></tr>
                  ) : (
                    recentOrders.slice(0, 10).map((order) => (
                      <tr key={order.id} className="border-b border-border/50 hover:bg-secondary/30" data-testid={`row-order-${order.id}`}>
                        <td className="px-6 py-4 font-mono text-xs">{order.orderNumber}</td>
                        <td className="px-6 py-4">₹{Number(order.totalAmount).toLocaleString("en-IN")}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded ${statusColors[order.status] || "bg-gray-100"}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("en-IN")}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
