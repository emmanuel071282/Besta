import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AdminLayout from "./AdminLayout";
import { Loader2, Plus, X, Printer, Barcode, Upload, Pencil, ImageIcon } from "lucide-react";
import type { Product, Store } from "@shared/schema";
import { SUBCATEGORIES, getAllSubcategories, getSizesForProduct } from "@shared/schema";
import JsBarcode from "jsbarcode";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = ["Mens", "Ladies", "Kids", "Accessories", "Footwear", "Cosmetics"];

function BarcodeModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (product.barcode && svgRef.current) {
      JsBarcode(svgRef.current, product.barcode, {
        format: "EAN13",
        width: 2,
        height: 80,
        displayValue: true,
        font: "monospace",
        fontSize: 14,
        textMargin: 6,
      });
    }
  }, [product.barcode]);

  const handlePrint = () => {
    if (!svgRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head><title>Barcode - ${product.name}</title>
        <style>
          body { display:flex; flex-direction:column; justify-content:center; align-items:center; min-height:100vh; margin:0; font-family:sans-serif; }
          .name { font-size:14px; font-weight:bold; margin-bottom:8px; text-transform:uppercase; letter-spacing:2px; }
          .price { font-size:12px; color:#666; margin-top:4px; }
        </style></head>
        <body>
          <div class="name">${product.name}</div>
          ${svgRef.current.outerHTML}
          <div class="price">MRP: Rs. ${product.price}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-background border border-border p-8 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-bold uppercase tracking-widest">Barcode</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="text-center space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider">{product.name}</p>
          <div className="flex justify-center">
            <svg ref={svgRef} />
          </div>
          <p className="text-xs text-muted-foreground">MRP: Rs. {product.price}</p>
        </div>
        <div className="flex gap-2 mt-6">
          <button
            onClick={handlePrint}
            className="flex-1 bg-foreground text-background py-2.5 text-xs uppercase tracking-widest font-semibold hover:opacity-90 flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" /> Print Barcode
          </button>
          <button
            onClick={onClose}
            className="border border-border px-4 py-2.5 text-xs uppercase tracking-widest font-semibold hover:bg-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function ImageUploadField({
  value,
  onChange,
  label = "Product Image",
}: {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const [mode, setMode] = useState<"url" | "file">(value && !value.startsWith("/uploads/") ? "url" : "file");
  const [preview, setPreview] = useState<string>(value || "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(value || "");
  }, [value]);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert("Image must be under 8 MB");
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setPreview(base64);
      try {
        const res = await apiRequest("POST", "/api/admin/upload", {
          data: base64,
          filename: file.name,
        });
        const { url } = await res.json();
        onChange(url);
        setPreview(url);
      } catch {
        alert("Upload failed. Please try again.");
        setPreview(value || "");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-[10px] uppercase tracking-widest font-semibold">{label}</label>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setMode("file")}
            className={`text-[10px] uppercase tracking-widest px-2 py-0.5 border transition-colors ${
              mode === "file" ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:border-foreground"
            }`}
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`text-[10px] uppercase tracking-widest px-2 py-0.5 border transition-colors ${
              mode === "url" ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:border-foreground"
            }`}
          >
            URL
          </button>
        </div>
      </div>

      {mode === "file" ? (
        <div
          onClick={() => !uploading && fileRef.current?.click()}
          className="relative border-2 border-dashed border-border hover:border-foreground transition-colors cursor-pointer rounded-sm"
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFile}
            disabled={uploading}
          />
          {preview ? (
            <div className="relative group">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-40 object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-xs uppercase tracking-widest font-semibold flex items-center gap-1">
                  <Upload className="w-4 h-4" /> Change Image
                </span>
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center gap-2 text-muted-foreground">
              {uploading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  <ImageIcon className="w-8 h-8" />
                  <span className="text-xs uppercase tracking-widest">Click to upload</span>
                  <span className="text-[10px]">JPEG, PNG, WEBP · max 8 MB</span>
                </>
              )}
            </div>
          )}
        </div>
      ) : (
        <input
          type="url"
          value={value}
          onChange={(e) => { onChange(e.target.value); setPreview(e.target.value); }}
          className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
          placeholder="https://images.unsplash.com/..."
          required
        />
      )}
    </div>
  );
}

function EditImageModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [imageUrl, setImageUrl] = useState(product.imageUrl || "");

  const updateMutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await apiRequest("PATCH", `/api/admin/products/${product.id}`, { imageUrl: url });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      onClose();
    },
    onError: () => alert("Failed to update image. Please try again."),
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-background border border-border p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-widest">Update Image</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground mb-4 truncate">{product.name}</p>
        <ImageUploadField value={imageUrl} onChange={setImageUrl} />
        <div className="flex gap-2 mt-6">
          <button
            onClick={() => imageUrl && updateMutation.mutate(imageUrl)}
            disabled={updateMutation.isPending || !imageUrl}
            className="flex-1 bg-foreground text-background py-2.5 text-xs uppercase tracking-widest font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {updateMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
            Save Image
          </button>
          <button
            onClick={onClose}
            className="border border-border px-4 py-2.5 text-xs uppercase tracking-widest font-semibold hover:bg-secondary"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ArticlesPage() {
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [barcodeProduct, setBarcodeProduct] = useState<Product | null>(null);
  const [editImageProduct, setEditImageProduct] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    costPrice: "",
    imageUrl: "",
    category: "",
    subcategory: "",
  });
  const [autoSizes, setAutoSizes] = useState<string[]>([]);
  const [sizeQty, setSizeQty] = useState<Record<string, number>>({});
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/admin/products"],
  });

  const { data: allStores } = useQuery<Store[]>({
    queryKey: ["/api/admin/stores"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form & { sizes: string[]; sizeQty: Record<string, number>; storeId: string }) => {
      // Sanitise numeric fields — empty string is not a valid numeric in PostgreSQL
      const payload = {
        ...data,
        costPrice: data.costPrice || "0",
        price: data.price || "0",
      };
      const res = await apiRequest("POST", "/api/admin/products", payload);
      return res.json();
    },
    onSuccess: (newProduct: Product) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inventory"] });
      setBarcodeProduct(newProduct);
      setShowAddForm(false);
      setForm({ name: "", description: "", price: "", costPrice: "", imageUrl: "", category: "", subcategory: "" });
      setAutoSizes([]);
      setSizeQty({});
      toast({ title: "Article created", description: `${newProduct.name} added successfully` });
    },
    onError: (err: Error) => {
      toast({ title: "Failed to create article", description: err.message, variant: "destructive" });
    },
  });

  const handleCategoryChange = (category: string) => {
    setForm((prev) => ({ ...prev, category, subcategory: "" }));
    setAutoSizes([]);
  };

  const handleSubcategoryChange = (subcategory: string) => {
    setForm((prev) => ({ ...prev, subcategory }));
    const sizes = getSizesForProduct(form.category, subcategory);
    setAutoSizes(sizes);
    // Initialise all sizes to 0 qty
    setSizeQty(Object.fromEntries(sizes.map(s => [s, 0])));
  };

  const subcategoryList = form.category && SUBCATEGORIES[form.category]
    ? getAllSubcategories(SUBCATEGORIES[form.category])
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ ...form, sizes: autoSizes, sizeQty, storeId: selectedStoreId });
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Articles</h1>
          <p className="text-muted-foreground text-sm mt-1">Product catalogue with EAN-13 barcodes</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-foreground text-background px-4 py-2 text-xs uppercase tracking-widest font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" /> Add Article
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-background border border-border p-6 mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Article Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                placeholder="e.g. Cotton Linen Shirt"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground min-h-[80px]"
                placeholder="Product description (optional)"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Selling Price (Rs.)</label>
              <input
                type="text"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value.replace(/[^0-9.]/g, "") })}
                className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                placeholder="999"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Cost Price (Rs.)</label>
              <input
                type="text"
                value={form.costPrice}
                onChange={(e) => setForm({ ...form, costPrice: e.target.value.replace(/[^0-9.]/g, "") })}
                className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                placeholder="500 (optional)"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Category</label>
              <select
                value={form.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                required
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Subcategory</label>
              <select
                value={form.subcategory}
                onChange={(e) => handleSubcategoryChange(e.target.value)}
                className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                required
                disabled={!form.category}
              >
                <option value="">Select subcategory</option>
                {subcategoryList.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <ImageUploadField
                value={form.imageUrl}
                onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
              />
            </div>
          </div>

          {autoSizes.length > 0 && (
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Store for Inventory</label>
                <select
                  value={selectedStoreId}
                  onChange={(e) => setSelectedStoreId(e.target.value)}
                  className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none md:max-w-xs"
                >
                  <option value="">— No inventory yet —</option>
                  {allStores?.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.city})</option>
                  ))}
                </select>
              </div>
              {selectedStoreId && (
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Opening Stock by Size</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {autoSizes.map((size) => (
                      <div key={size} className="flex flex-col gap-1">
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{size}</span>
                        <input
                          type="number"
                          min="0"
                          value={sizeQty[size] ?? 0}
                          onChange={(e) => setSizeQty(prev => ({ ...prev, [size]: Number(e.target.value) }))}
                          className="w-full border border-border bg-background px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-foreground"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-foreground text-background px-6 py-2.5 text-xs uppercase tracking-widest font-semibold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            >
              {createMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
              Add Article
            </button>
            <button
              type="button"
              onClick={() => { setShowAddForm(false); setAutoSizes([]); }}
              className="border border-border px-6 py-2.5 text-xs uppercase tracking-widest font-semibold hover:bg-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="bg-background border border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">ID</th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Image</th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Barcode</th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Name</th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Category</th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Selling Price</th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Cost Price</th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Stock</th>
                  <th className="px-4 py-3 text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(!products || products.length === 0) ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                      No articles yet. Click "Add Article" to create one.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="px-4 py-3 text-muted-foreground">#{p.id}</td>
                      <td className="px-4 py-3">
                        <div className="relative group w-10 h-10">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="w-10 h-10 object-cover border border-border"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-secondary border border-border flex items-center justify-center">
                              <ImageIcon className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                          <button
                            onClick={() => setEditImageProduct(p)}
                            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            title="Update image"
                          >
                            <Pencil className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{p.barcode || "—"}</td>
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.category} / {p.subcategory}</td>
                      <td className="px-4 py-3">Rs. {p.price}</td>
                      <td className="px-4 py-3 text-muted-foreground">Rs. {p.costPrice || "0"}</td>
                      <td className="px-4 py-3">
                        {(() => {
                          const stock = (p as any).totalStock ?? 0;
                          return (
                            <span className={`text-xs font-semibold ${stock === 0 ? "text-red-600" : stock < 10 ? "text-amber-600" : "text-green-600"}`}>
                              {stock}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditImageProduct(p)}
                            className="flex items-center gap-1.5 text-xs border border-border px-3 py-1.5 hover:bg-secondary transition-colors"
                            title="Update image"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Image
                          </button>
                          {p.barcode && (
                            <button
                              onClick={() => setBarcodeProduct(p)}
                              className="flex items-center gap-1.5 text-xs border border-border px-3 py-1.5 hover:bg-secondary transition-colors"
                            >
                              <Barcode className="w-3.5 h-3.5" /> View
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {barcodeProduct && (
        <BarcodeModal product={barcodeProduct} onClose={() => setBarcodeProduct(null)} />
      )}
      {editImageProduct && (
        <EditImageModal product={editImageProduct} onClose={() => setEditImageProduct(null)} />
      )}
    </AdminLayout>
  );
}
