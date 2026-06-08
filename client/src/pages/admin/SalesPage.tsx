import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "./AdminLayout";
import { Loader2, TrendingUp, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SalesData {
  report: { date: string; orders: number; revenue: number }[];
  topProducts: { productId: number; name: string; totalQuantity: number; totalRevenue: number }[];
  categoryBreakdown: { category: string; revenue: number; orders: number; profit: number }[];
  grossProfit: { revenue: number; cost: number; profit: number };
}

type ChartMode = "revenue" | "orders";

export default function SalesPage() {
  const [days, setDays] = useState(30);
  const [chartMode, setChartMode] = useState<ChartMode>("revenue");

  const { data: customerData } = useQuery<any>({ queryKey: ["/api/admin/customer-analytics"] });

  const { data, isLoading } = useQuery<SalesData>({
    queryKey: ["/api/admin/sales", { days }],
    queryFn: async () => {
      const res = await fetch(`/api/admin/sales?days=${days}`, { credentials: "include" });
      return res.json();
    },
  });

  const totalRevenue = data?.report.reduce((sum, r) => sum + r.revenue, 0) || 0;
  const totalOrders = data?.report.reduce((sum, r) => sum + r.orders, 0) || 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const grossProfit = data?.grossProfit ?? { revenue: 0, cost: 0, profit: 0 };
  const marginPct = grossProfit.revenue > 0 ? (grossProfit.profit / grossProfit.revenue) * 100 : 0;

  const chartValues = data?.report.map(r => chartMode === "revenue" ? r.revenue : r.orders) ?? [];
  const maxChartValue = Math.max(...chartValues, 1);

  const maxCatRevenue = Math.max(...(data?.categoryBreakdown.map(c => c.revenue) ?? [1]));

  return (
    <AdminLayout>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="text-admin-sales-title">Sales Report</h1>
          <p className="text-muted-foreground text-sm mt-1">Revenue and sales analytics</p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              data-testid={`btn-days-${d}`}
              className={cn(
                "px-4 py-2 text-[10px] uppercase tracking-widest font-semibold border transition-colors",
                days === d
                  ? "bg-foreground text-background border-foreground"
                  : "bg-background text-muted-foreground border-border hover:border-foreground"
              )}
            >
              {d}D
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <div className="bg-background border border-border p-6" data-testid="stat-total-revenue">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Revenue ({days}D)</span>
              <p className="text-2xl font-bold mt-2">₹{totalRevenue.toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-background border border-border p-6" data-testid="stat-total-orders">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Orders ({days}D)</span>
              <p className="text-2xl font-bold mt-2">{totalOrders}</p>
            </div>
            <div className="bg-background border border-border p-6" data-testid="stat-avg-order">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Avg Order Value</span>
              <p className="text-2xl font-bold mt-2">₹{Math.round(avgOrderValue).toLocaleString("en-IN")}</p>
            </div>
            <div className="bg-background border border-border p-6">
              <span className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Gross Profit ({days}D)</span>
              <p className="text-2xl font-bold mt-2">₹{Math.round(grossProfit.profit).toLocaleString("en-IN")}</p>
              <p className="text-xs text-muted-foreground mt-1">{marginPct.toFixed(1)}% margin</p>
            </div>
          </div>

          {/* Daily chart */}
          <div className="bg-background border border-border p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Daily Trend</h2>
              <div className="flex gap-1">
                {(["revenue", "orders"] as ChartMode[]).map((m) => (
                  <button key={m} onClick={() => setChartMode(m)}
                    className={cn("px-3 py-1 text-[10px] uppercase tracking-widest font-semibold border transition-colors",
                      chartMode === m ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:border-foreground"
                    )}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            {data?.report && data.report.length > 0 ? (
              <div className="flex items-end gap-1 h-48">
                {data.report.map((day, i) => {
                  const val = chartMode === "revenue" ? day.revenue : day.orders;
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                        {chartMode === "revenue" ? `₹${day.revenue.toLocaleString("en-IN")}` : `${day.orders} orders`}
                        <span className="block text-center text-[9px] opacity-70">
                          {new Date(day.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                      <div
                        className="w-full bg-foreground/80 hover:bg-foreground transition-colors rounded-t min-h-[2px]"
                        style={{ height: `${Math.max((val / maxChartValue) * 100, 2)}%` }}
                      />
                      {i % Math.ceil(data.report.length / 10) === 0 && (
                        <span className="text-[8px] text-muted-foreground mt-1 hidden lg:block">
                          {new Date(day.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No sales data for this period</p>
            )}
          </div>

          {/* Category breakdown + top products side by side on large screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

            {/* Category breakdown */}
            <div className="bg-background border border-border">
              <div className="p-6 border-b border-border flex items-center gap-2">
                <BarChart2 className="w-4 h-4" />
                <h2 className="text-lg font-semibold">Revenue by Category</h2>
              </div>
              <div className="p-6 space-y-4">
                {(!data?.categoryBreakdown || data.categoryBreakdown.length === 0) ? (
                  <p className="text-center text-muted-foreground py-4 text-sm">No data yet</p>
                ) : (
                  data.categoryBreakdown.map((cat) => {
                    const pct = maxCatRevenue > 0 ? (cat.revenue / maxCatRevenue) * 100 : 0;
                    const catMargin = cat.revenue > 0 ? (cat.profit / cat.revenue) * 100 : 0;
                    return (
                      <div key={cat.category}>
                        <div className="flex items-center justify-between text-sm mb-1.5">
                          <span className="font-medium">{cat.category}</span>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{cat.orders} orders</span>
                            <span className="font-semibold text-foreground">₹{cat.revenue.toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-foreground rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">{catMargin.toFixed(1)}% margin · ₹{Math.round(cat.profit).toLocaleString("en-IN")} profit</p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Top selling products */}
            <div className="bg-background border border-border">
              <div className="p-6 border-b border-border flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <h2 className="text-lg font-semibold">Top Selling Products</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left">
                      <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">#</th>
                      <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Product</th>
                      <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Qty</th>
                      <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(!data?.topProducts || data.topProducts.length === 0) ? (
                      <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No sales data yet</td></tr>
                    ) : (
                      data.topProducts.map((p, i) => (
                        <tr key={p.productId} className="border-b border-border/50" data-testid={`row-top-product-${p.productId}`}>
                          <td className="px-6 py-3 text-muted-foreground">{i + 1}</td>
                          <td className="px-6 py-3 font-medium leading-tight">{p.name}</td>
                          <td className="px-6 py-3">{p.totalQuantity}</td>
                          <td className="px-6 py-3 font-semibold">₹{Number(p.totalRevenue).toLocaleString("en-IN")}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {customerData && (<div className="mt-8"><div className="flex items-center gap-2 mb-4"><Users className="w-4 h-4" /><h2 className="text-sm font-bold uppercase tracking-widest">Customer Analytics</h2></div><div className="grid grid-cols-3 gap-4 mb-6"><div className="border border-border p-4"><p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Total Customers</p><p className="text-2xl font-bold">{customerData.totalCustomers}</p></div><div className="border border-border p-4"><p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Repeat Customers</p><p className="text-2xl font-bold">{customerData.repeatCustomers}</p></div><div className="border border-border p-4"><p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Repeat Rate</p><p className="text-2xl font-bold">{customerData.repeatRate}%</p></div></div><div className="border border-border"><table className="w-full text-sm"><thead><tr className="border-b border-border text-left"><th className="px-4 py-3 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Customer</th><th className="px-4 py-3 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Mobile</th><th className="px-4 py-3 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Orders</th><th className="px-4 py-3 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Total Spend</th></tr></thead><tbody>{customerData.topCustomers?.map((c) => (<tr key={c.userId} className="border-b border-border/50 hover:bg-secondary/30"><td className="px-4 py-3 font-medium">{c.name}</td><td className="px-4 py-3 text-muted-foreground">{c.mobile}</td><td className="px-4 py-3">{c.orderCount}</td><td className="px-4 py-3 font-semibold">₹{c.totalSpend.toLocaleString("en-IN")}</td></tr>))}</tbody></table></div></div>)}
        </>
      )}
    </AdminLayout>
  );
}
