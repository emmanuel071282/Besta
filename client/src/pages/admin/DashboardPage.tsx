import { useQuery } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { Loader2, TrendingUp, TrendingDown, ShoppingBag, Clock, PackageCheck, BarChart3 } from "lucide-react";
import type { Order } from "@shared/schema";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

type PeriodMetrics = {
  orders: number;
  sale: number;
  marginPercent: number;
  valuePerOrder: number;
  delivered: number;
  pending: number;
};

type DashboardMetrics = {
  ld: PeriodMetrics;
  wtd: PeriodMetrics;
  mtd: PeriodMetrics;
  ytd: PeriodMetrics;
};

type SalesData = {
  report: { date: string; orders: number; revenue: number }[];
};

const STATUS_COLORS: Record<string, string> = {
  placed: "#f59e0b",
  confirmed: "#3b82f6",
  shipped: "#6366f1",
  delivered: "#22c55e",
  cancelled: "#ef4444",
  returned: "#6b7280",
};

const STATUS_LABELS: Record<string, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};

function KpiCard({
  label, value, sub, icon: Icon, trend, trendLabel, color = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  color?: "default" | "green" | "amber" | "red";
}) {
  const borderColor = color === "green" ? "border-green-200 dark:border-green-800" :
    color === "amber" ? "border-amber-200 dark:border-amber-800" :
    color === "red" ? "border-red-200 dark:border-red-800" : "border-border";
  const iconBg = color === "green" ? "bg-green-100 dark:bg-green-900/30 text-green-600" :
    color === "amber" ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600" :
    color === "red" ? "bg-red-100 dark:bg-red-900/30 text-red-600" :
    "bg-secondary text-foreground";

  return (
    <div className={`bg-background border ${borderColor} p-5`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">{label}</p>
        <div className={`p-2 rounded-sm ${iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-bold mb-1">{value}</p>
      {(sub || trendLabel) && (
        <div className="flex items-center gap-1.5">
          {trend === "up" && <TrendingUp className="w-3 h-3 text-green-500" />}
          {trend === "down" && <TrendingDown className="w-3 h-3 text-red-500" />}
          <p className="text-xs text-muted-foreground">{trendLabel || sub}</p>
        </div>
      )}
    </div>
  );
}

const ROWS = [
  { key: "orders" as keyof PeriodMetrics, label: "Orders" },
  { key: "sale" as keyof PeriodMetrics, label: "Sale (₹K)" },
  { key: "marginPercent" as keyof PeriodMetrics, label: "Margin %" },
  { key: "valuePerOrder" as keyof PeriodMetrics, label: "Avg Order (₹)" },
  { key: "delivered" as keyof PeriodMetrics, label: "Delivered" },
  { key: "pending" as keyof PeriodMetrics, label: "Pending" },
];
const PERIODS = ["ld", "wtd", "mtd", "ytd"] as const;
const PERIOD_LABELS: Record<string, string> = { ld: "Today", wtd: "This Week", mtd: "This Month", ytd: "This Year" };

export default function DashboardPage() {
  const { data: metrics, isLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/admin/dashboard/metrics"],
  });

  const { data: lowStockItems } = useQuery<any[]>({ queryKey: ["/api/admin/low-stock"] });

  const { data: recentOrders } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  const { data: salesData } = useQuery<SalesData>({
    queryKey: ["/api/admin/sales", { days: 14 }],
    queryFn: async () => {
      const res = await fetch("/api/admin/sales?days=14", { credentials: "include" });
      return res.json();
    },
  });

  // Order status breakdown from recent orders
  const statusCounts = (recentOrders ?? []).reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(statusCounts)
    .filter(([, v]) => v > 0)
    .map(([status, value]) => ({ name: STATUS_LABELS[status] ?? status, value, status }));

  // Revenue chart — last 14 days
  const revenueChart = (salesData?.report ?? []).map(d => ({
    date: new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    Revenue: d.revenue,
    Orders: d.orders,
  }));

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
        <p className="text-muted-foreground text-sm mt-1">Business performance overview</p>
      </div>

      {lowStockItems && lowStockItems.length > 0 && (
        <div className="mb-6 border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 mb-3"><AlertTriangle className="w-4 h-4 text-amber-600" /><span className="text-sm font-semibold uppercase tracking-widest text-amber-700">Low Stock — {lowStockItems.length} item{lowStockItems.length > 1 ? "s" : ""} need restocking</span></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">{lowStockItems.map((item) => (<div key={item.id} className="flex items-center justify-between bg-white border border-amber-100 px-3 py-2"><span className="text-xs font-medium truncate">{item.name}</span><span className={`text-xs font-bold ml-2 ${item.totalStock === 0 ? "text-red-600" : "text-amber-600"}`}>{item.totalStock === 0 ? "Out of stock" : `${item.totalStock} left`}</span></div>))}</div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KpiCard
              label="Today's Revenue"
              value={`₹${((metrics?.ld.sale ?? 0) * 1000).toLocaleString("en-IN")}`}
              icon={BarChart3}
              color="green"
              trendLabel={`${metrics?.ld.orders ?? 0} orders`}
            />
            <KpiCard
              label="MTD Revenue"
              value={`₹${((metrics?.mtd.sale ?? 0) * 1000).toLocaleString("en-IN")}`}
              icon={TrendingUp}
              color="default"
              trendLabel={`${metrics?.mtd.marginPercent?.toFixed(1) ?? 0}% margin`}
            />
            <KpiCard
              label="Pending Orders"
              value={String(metrics?.wtd.pending ?? 0)}
              icon={Clock}
              color={(metrics?.wtd.pending ?? 0) > 10 ? "red" : "amber"}
              trendLabel="need attention"
            />
            <KpiCard
              label="YTD Delivered"
              value={String(metrics?.ytd.delivered ?? 0)}
              icon={PackageCheck}
              color="green"
              trendLabel={`of ${metrics?.ytd.orders ?? 0} total orders`}
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

            {/* Revenue trend — takes 2/3 width */}
            <div className="lg:col-span-2 bg-background border border-border p-6">
              <h2 className="text-sm font-semibold uppercase tracking-widest mb-6">Revenue — Last 14 Days</h2>
              {revenueChart.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={revenueChart} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false}
                      tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}K` : `₹${v}`} />
                    <Tooltip
                      formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Revenue"]}
                      contentStyle={{ fontSize: 12, border: "1px solid hsl(var(--border))", borderRadius: 0 }}
                    />
                    <Bar dataKey="Revenue" fill="hsl(var(--foreground))" radius={[2, 2, 0, 0]} opacity={0.85} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">No sales data yet</div>
              )}
            </div>

            {/* Order status pie — takes 1/3 width */}
            <div className="bg-background border border-border p-6">
              <h2 className="text-sm font-semibold uppercase tracking-widest mb-6">Order Status</h2>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={75} innerRadius={45} paddingAngle={2}>
                      {pieData.map((entry) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#6b7280"} />
                      ))}
                    </Pie>
                    <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ fontSize: 12, border: "1px solid hsl(var(--border))", borderRadius: 0 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">No orders yet</div>
              )}
            </div>
          </div>

          {/* Period metrics table */}
          <div className="bg-background border border-border mb-8">
            <div className="p-5 border-b border-border">
              <h2 className="text-sm font-semibold uppercase tracking-widest">Performance Summary</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-6 py-3 text-left text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Metric</th>
                    {PERIODS.map((p) => (
                      <th key={p} className="px-6 py-3 text-right text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
                        {PERIOD_LABELS[p]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row) => (
                    <tr key={row.key} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="px-6 py-3 font-medium text-foreground">{row.label}</td>
                      {PERIODS.map((p) => {
                        const val = metrics ? metrics[p][row.key] : 0;
                        const display = row.key === "sale" ? `₹${(val * 1000).toLocaleString("en-IN")}` :
                          row.key === "marginPercent" ? `${val.toFixed(1)}%` :
                          row.key === "valuePerOrder" ? `₹${val.toLocaleString("en-IN")}` :
                          val.toLocaleString("en-IN");
                        return (
                          <td key={p} className="px-6 py-3 text-right tabular-nums font-medium">
                            {metrics ? display : "—"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-background border border-border">
            <div className="p-5 border-b border-border flex items-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              <h2 className="text-sm font-semibold uppercase tracking-widest">Recent Orders</h2>
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
                        <td className="px-6 py-4 font-medium">₹{Number(order.totalAmount).toLocaleString("en-IN")}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold rounded ${statusColors[order.status] || "bg-gray-100"}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
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
