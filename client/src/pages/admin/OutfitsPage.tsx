import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AdminLayout from "./AdminLayout";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import type { Product } from "@shared/schema";

type Outfit = { id: number; name: string; description: string; imageUrl: string; isActive: boolean };

export default function OutfitsPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", imageUrl: "", productIds: [] as number[] });
  const [productSearch, setProductSearch] = useState("");

  const { data: outfits, isLoading } = useQuery<Outfit[]>({
    queryKey: ["/api/admin/outfits"],
  });

  const { data: allProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      await apiRequest("POST", "/api/admin/outfits", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/outfits"] });
      setShowForm(false);
      setForm({ name: "", description: "", imageUrl: "", productIds: [] });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      await apiRequest("PATCH", `/api/admin/outfits/${id}`, { isActive });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/outfits"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/outfits/${id}`, {});
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/outfits"] }),
  });

  const filteredProducts = (allProducts ?? []).filter(p =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const selectedProducts = (allProducts ?? []).filter(p => form.productIds.includes(p.id));

  const toggleProduct = (id: number) => {
    setForm(prev => ({
      ...prev,
      productIds: prev.productIds.includes(id)
        ? prev.productIds.filter(x => x !== id)
        : [...prev.productIds, id],
    }));
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Outfit Bundles</h1>
          <p className="text-muted-foreground text-sm mt-1">Curate "Complete the Look" collections shown on product pages and the Lookbook</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-foreground text-background px-4 py-2 text-xs uppercase tracking-widest font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> New Outfit
        </button>
      </div>

      {showForm && (
        <div className="bg-background border border-border p-6 mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-6">Create Outfit</h2>
          <form
            onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Outfit Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Urban Summer Edit"
                  className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Cover Image URL</label>
                <input
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://…"
                  className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none resize-none"
              />
            </div>

            {/* Product selection */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">
                Select Products * (min 2)
              </label>
              <input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products…"
                className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none mb-2"
              />

              {selectedProducts.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedProducts.map(p => (
                    <span key={p.id} className="flex items-center gap-1 bg-foreground text-background text-xs px-2 py-1">
                      {p.name}
                      <button type="button" onClick={() => toggleProduct(p.id)}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )}

              <div className="border border-border max-h-40 overflow-y-auto">
                {filteredProducts.slice(0, 30).map(p => (
                  <label key={p.id} className="flex items-center gap-3 px-3 py-2 hover:bg-secondary/50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.productIds.includes(p.id)}
                      onChange={() => toggleProduct(p.id)}
                      className="accent-foreground"
                    />
                    <span className="text-sm flex-1 truncate">{p.name}</span>
                    <span className="text-xs text-muted-foreground">₹{Number(p.price).toLocaleString("en-IN")}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={createMutation.isPending || form.productIds.length < 2}
                className="bg-foreground text-background px-6 py-2 text-xs uppercase tracking-widest font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
              >
                {createMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                Create Outfit
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="border border-border px-4 py-2 text-xs uppercase tracking-widest font-semibold hover:bg-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin" /></div>
      ) : !outfits || outfits.length === 0 ? (
        <div className="bg-background border border-border p-12 text-center">
          <p className="text-muted-foreground text-sm">No outfit bundles yet. Create one to show curated looks on product pages and the Lookbook.</p>
        </div>
      ) : (
        <div className="bg-background border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Name</th>
                <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Description</th>
                <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Status</th>
                <th className="px-6 py-3 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {outfits.map((outfit) => (
                <tr key={outfit.id} className="border-b border-border/50 hover:bg-secondary/30">
                  <td className="px-6 py-4 font-medium">{outfit.name}</td>
                  <td className="px-6 py-4 text-muted-foreground text-xs max-w-xs truncate">{outfit.description || "—"}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggleActiveMutation.mutate({ id: outfit.id, isActive: !outfit.isActive })}
                      className={`px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold ${
                        outfit.isActive
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {outfit.isActive ? "Active" : "Hidden"}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => deleteMutation.mutate(outfit.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
