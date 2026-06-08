import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AdminLayout from "./AdminLayout";
import { Loader2, Plus, Trash2 } from "lucide-react";

type Outfit = { id: number; name: string; description: string; imageUrl: string; isActive: boolean };
type Product = { id: number; name: string; imageUrl: string; price: string; category: string };

export default function OutfitsPage() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { data: outfits, isLoading } = useQuery<Outfit[]>({ queryKey: ["/api/admin/outfits"] });
  const { data: products } = useQuery<Product[]>({ queryKey: ["/api/admin/products"] });

  const createMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/outfits", { name, description, imageUrl, productIds: selectedIds }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/admin/outfits"] }); setShowForm(false); setName(""); setDescription(""); setImageUrl(""); setSelectedIds([]); },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => apiRequest("PATCH", `/api/admin/outfits/${id}`, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/outfits"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/admin/outfits/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/outfits"] }),
  });

  const toggleProduct = (id: number) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <AdminLayout>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Outfits</h1>
          <p className="text-muted-foreground text-sm mt-1">Curate "Complete the Look" bundles for the Lookbook</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-foreground text-background px-4 py-2 text-xs uppercase tracking-widest font-semibold hover:opacity-90">
          <Plus className="w-4 h-4" /> New Outfit
        </button>
      </div>

      {showForm && (
        <div className="bg-background border border-border p-6 mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Outfit Name *</label>
              <input value={name} onChange={e => setName(e.target.value)} className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Hero Image URL</label>
              <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Description</label>
              <input value={description} onChange={e => setDescription(e.target.value)} className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-semibold mb-3">Select Products (min 2) *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-64 overflow-y-auto border border-border p-3">
              {(products ?? []).map(p => (
                <label key={p.id} className={`flex items-center gap-2 p-2 cursor-pointer border transition-colors text-xs ${selectedIds.includes(p.id) ? "border-foreground bg-foreground/5" : "border-transparent hover:border-border"}`}>
                  <input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleProduct(p.id)} className="w-3 h-3" />
                  <span className="truncate">{p.name}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{selectedIds.length} selected</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => createMutation.mutate()} disabled={!name || selectedIds.length < 2 || createMutation.isPending} className="bg-foreground text-background px-6 py-2 text-xs uppercase tracking-widest font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
              {createMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />} Create Outfit
            </button>
            <button onClick={() => setShowForm(false)} className="border border-border px-6 py-2 text-xs uppercase tracking-widest font-semibold hover:bg-secondary">Cancel</button>
          </div>
        </div>
      )}

      {isLoading ? <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(outfits ?? []).map(outfit => (
            <div key={outfit.id} className="bg-background border border-border p-5">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold">{outfit.name}</h3>
                <span className={`text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 ${outfit.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{outfit.isActive ? "Active" : "Inactive"}</span>
              </div>
              {outfit.description && <p className="text-sm text-muted-foreground mb-3">{outfit.description}</p>}
              <div className="flex gap-2 mt-3">
                <button onClick={() => toggleMutation.mutate({ id: outfit.id, isActive: !outfit.isActive })} className="text-xs border border-border px-3 py-1.5 hover:bg-secondary">
                  {outfit.isActive ? "Deactivate" : "Activate"}
                </button>
                <button onClick={() => { if (confirm("Delete this outfit?")) deleteMutation.mutate(outfit.id); }} className="text-xs border border-red-200 text-red-600 px-3 py-1.5 hover:bg-red-50 flex items-center gap-1">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
