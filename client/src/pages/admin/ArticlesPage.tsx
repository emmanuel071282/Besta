import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import AdminLayout from "./AdminLayout";
import { Loader2, Plus, X, Printer, Barcode, Sparkles, ImageUp, Pencil, ImageIcon, FileUp, Download, AlertCircle, CheckCircle2 } from "lucide-react";
import type { Product } from "@shared/schema";
import { SUBCATEGORIES, getAllSubcategories, getSizesForProduct } from "@shared/schema";
import JsBarcode from "jsbarcode";

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

function EditProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [form, setForm] = useState({
    name: product.name,
    description: product.description || "",
    price: product.price,
    costPrice: product.costPrice || "",
    imageUrl: product.imageUrl || "",
    category: product.category,
    subcategory: product.subcategory,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((prev) => ({ ...prev, imageUrl: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const subcategoryList = form.category && SUBCATEGORIES[form.category]
    ? getAllSubcategories(SUBCATEGORIES[form.category])
    : [];

  const updateMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await apiRequest("PATCH", `/api/admin/products/${product.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      onClose();
    },
    onError: () => alert("Failed to update product. Please try again."),
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-background border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-sm font-bold uppercase tracking-widest">Edit Article</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Article Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground" required />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground min-h-[72px]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Selling Price (Rs.)</label>
              <input type="text" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value.replace(/[^0-9.]/g, "") })}
                className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground" required />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Cost Price (Rs.)</label>
              <input type="text" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value.replace(/[^0-9.]/g, "") })}
                className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value, subcategory: "" })}
                className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Subcategory</label>
              <select value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground" disabled={!form.category}>
                <option value="">Select subcategory</option>
                {subcategoryList.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[10px] uppercase tracking-widest font-semibold">Image</label>
              <div className="flex gap-2">
                <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold border border-border px-3 py-1 hover:bg-secondary transition-colors cursor-pointer">
                  <ImageUp className="w-3 h-3" /> Gallery
                  <input type="file" accept=".jpg,.jpeg,.png,.gif,.webp" className="hidden" onChange={handleFileSelect} />
                </label>
                <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold border border-border px-3 py-1 hover:bg-secondary transition-colors cursor-pointer">
                  <ImageUp className="w-3 h-3" /> Camera
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />
                </label>
              </div>
            </div>
            {form.imageUrl && (
              <img src={form.imageUrl} alt="Preview" className="w-full h-40 object-cover border border-border mb-2" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            )}
            <input type="url" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
              placeholder="https://..." />
          </div>
        </div>
        <div className="flex gap-2 p-6 border-t border-border">
          <button onClick={() => updateMutation.mutate(form)} disabled={updateMutation.isPending || !form.name || !form.price}
            className="flex-1 bg-foreground text-background py-2.5 text-xs uppercase tracking-widest font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2">
            {updateMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
            Save Changes
          </button>
          <button onClick={onClose} className="border border-border px-4 py-2.5 text-xs uppercase tracking-widest font-semibold hover:bg-secondary">Cancel</button>
        </div>
      </div>
    </div>
  );
}

const CSV_TEMPLATE = `name,description,price,costPrice,imageUrl,category,subcategory
Cotton Linen Shirt,A breathable everyday shirt,899,450,https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800,Mens,Shirts
Floral Midi Dress,Feminine floral print midi dress,1299,600,https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800,Ladies,Dresses
`;

function CsvImportModal({ onClose }: { onClose: () => void }) {
  const [csvText, setCsvText] = useState("");
  const [result, setResult] = useState<{ imported: number; errors: { row: number; reason: string }[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importMutation = useMutation({
    mutationFn: async (csv: string) => {
      const res = await apiRequest("POST", "/api/admin/products/bulk-csv", { csv });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Import failed");
      return data;
    },
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (err: Error) => {
      setResult({ imported: 0, errors: [{ row: 0, reason: err.message }] });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCsvText(reader.result as string);
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "besta_products_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-background border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-sm font-bold uppercase tracking-widest">Bulk CSV Import</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-5">
          {/* Instructions */}
          <div className="text-xs text-muted-foreground space-y-1 bg-secondary/50 px-4 py-3 border border-border">
            <p className="font-semibold text-foreground uppercase tracking-widest text-[10px] mb-2">Required columns</p>
            <p><span className="font-mono bg-background px-1">name</span>, <span className="font-mono bg-background px-1">price</span>, <span className="font-mono bg-background px-1">category</span>, <span className="font-mono bg-background px-1">subcategory</span></p>
            <p className="mt-1">Optional: <span className="font-mono bg-background px-1">description</span>, <span className="font-mono bg-background px-1">costPrice</span>, <span className="font-mono bg-background px-1">imageUrl</span></p>
            <p className="mt-1">Valid categories: Mens, Ladies, Kids, Accessories, Footwear, Cosmetics</p>
            <p>Sizes are auto-assigned based on category + subcategory. Barcodes are auto-generated.</p>
          </div>

          {/* Upload area */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] uppercase tracking-widest font-semibold">CSV File or Paste</label>
              <div className="flex gap-2">
                <button type="button" onClick={handleDownloadTemplate}
                  className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold border border-border px-3 py-1 hover:bg-secondary transition-colors">
                  <Download className="w-3 h-3" /> Template
                </button>
                <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold border border-border px-3 py-1 hover:bg-secondary transition-colors cursor-pointer">
                  <FileUp className="w-3 h-3" /> Upload CSV
                  <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFileChange} />
                </label>
              </div>
            </div>
            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder={`name,description,price,costPrice,imageUrl,category,subcategory\nCotton T-Shirt,Comfortable tee,599,299,,Mens,T-Shirts`}
              rows={8}
              className="w-full border border-border bg-background px-3 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-foreground resize-none"
            />
          </div>

          {/* Result */}
          {result && (
            <div className="space-y-3">
              <div className={`flex items-center gap-2 px-4 py-3 border text-sm font-medium ${result.imported > 0 ? "border-green-400 bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-400" : "border-border bg-secondary text-muted-foreground"}`}>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {result.imported} product{result.imported !== 1 ? "s" : ""} imported successfully
              </div>
              {result.errors.length > 0 && (
                <div className="border border-amber-400 bg-amber-50 dark:bg-amber-950/20 px-4 py-3 space-y-1">
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <AlertCircle className="w-3 h-3" /> {result.errors.length} row{result.errors.length !== 1 ? "s" : ""} skipped
                  </p>
                  {result.errors.map((e, i) => (
                    <p key={i} className="text-xs text-amber-700 dark:text-amber-500">
                      {e.row > 0 ? `Row ${e.row}: ` : ""}{e.reason}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 p-6 border-t border-border">
          {!result ? (
            <>
              <button
                onClick={() => csvText.trim() && importMutation.mutate(csvText)}
                disabled={importMutation.isPending || !csvText.trim()}
                className="flex-1 bg-foreground text-background py-2.5 text-xs uppercase tracking-widest font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {importMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                Import Products
              </button>
              <button onClick={onClose} className="border border-border px-4 py-2.5 text-xs uppercase tracking-widest font-semibold hover:bg-secondary">Cancel</button>
            </>
          ) : (
            <button onClick={onClose} className="flex-1 bg-foreground text-background py-2.5 text-xs uppercase tracking-widest font-semibold hover:opacity-90">
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ArticlesPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCsvImport, setShowCsvImport] = useState(false);
  const [barcodeProduct, setBarcodeProduct] = useState<Product | null>(null);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [aiImages, setAiImages] = useState<string[]>([]);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [aiImageError, setAiImageError] = useState("");

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/admin/products"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form & { sizes: string[]; sizeQty: Record<string, number> }) => {
      const res = await apiRequest("POST", "/api/admin/products", data);
      return res.json();
    },
    onSuccess: (newProduct: Product) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setBarcodeProduct(newProduct);
      setShowAddForm(false);
      setForm({ name: "", description: "", price: "", costPrice: "", imageUrl: "", category: "", subcategory: "" });
      setAutoSizes([]);
      setSizeQty({});
      setAiImages([]);
      setAiImageError("");
    },
  });


  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((prev) => ({ ...prev, imageUrl: reader.result }));
    reader.readAsDataURL(file);
  };
  const handleGenerateImages = async () => {
    if (!form.name) { setAiImageError("Enter an article name first"); return; }
    setIsGeneratingImages(true); setAiImages([]); setAiImageError("");
    try {
      const res = await apiRequest("POST", "/api/admin/generate-product-images", {
        name: form.name, category: form.category, subcategory: form.subcategory, description: form.description,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Generation failed");
      setAiImages(data.images || []);
    } catch (err: any) {
      setAiImageError(err.message || "Failed to generate images");
    } finally { setIsGeneratingImages(false); }
  };

  const handleCategoryChange = (category: string) => {
    setForm((prev) => ({ ...prev, category, subcategory: "" }));
    setAutoSizes([]);
  };

  const handleSubcategoryChange = (subcategory: string) => {
    setForm((prev) => ({ ...prev, subcategory }));
    const sizes = getSizesForProduct(form.category, subcategory);
    setAutoSizes(sizes);
    setSizeQty(Object.fromEntries(sizes.map(s => [s, 0])));
  };

  const subcategoryList = form.category && SUBCATEGORIES[form.category]
    ? getAllSubcategories(SUBCATEGORIES[form.category])
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ ...form, sizes: autoSizes, sizeQty });
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Articles</h1>
          <p className="text-muted-foreground text-sm mt-1">Product catalogue with EAN-13 barcodes</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCsvImport(true)}
            className="flex items-center gap-2 border border-border px-4 py-2 text-xs uppercase tracking-widest font-semibold hover:bg-secondary transition-colors"
          >
            <FileUp className="w-4 h-4" /> CSV Import
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-foreground text-background px-4 py-2 text-xs uppercase tracking-widest font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Add Article
          </button>
        </div>
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
                placeholder="Product description..."
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
                placeholder="500"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] uppercase tracking-widest font-semibold">Image</label>
                  <button type="button" onClick={handleGenerateImages} disabled={isGeneratingImages}
                  className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold border border-border px-3 py-1 hover:bg-secondary disabled:opacity-50 transition-colors">
                  {isGeneratingImages ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  {isGeneratingImages ? "Generating..." : "Generate with AI"}
                </button>
                <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold border border-border px-3 py-1 hover:bg-secondary transition-colors cursor-pointer">
                  <ImageUp className="w-3 h-3" /> Gallery
                  <input type="file" accept=".jpg,.jpeg,.png,.gif,.webp" className="hidden" onChange={handleFileSelect} />
                </label>
                <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-semibold border border-border px-3 py-1 hover:bg-secondary transition-colors cursor-pointer">
                  <ImageUp className="w-3 h-3" /> Camera
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />
                </label>
              </div>
              <input type="url" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                placeholder="https://images.unsplash.com/... or generate with AI above" />
              {aiImageError && <p className="text-xs text-red-500 mt-1">{aiImageError}</p>}
              {aiImages.length > 0 && (
                <div className="mt-3">
                  <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-2">Click an image to select it</p>
                  <div className="grid grid-cols-3 gap-2">
                    {aiImages.map((url, i) => (
                      <button key={i} type="button" onClick={() => setForm({ ...form, imageUrl: url })}
                        className={`relative aspect-square overflow-hidden border-2 transition-all ${form.imageUrl === url ? "border-foreground" : "border-border hover:border-foreground/50"}`}>
                        <img src={url} alt={`AI option ${i + 1}`} className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        {form.imageUrl === url && (
                          <div className="absolute inset-0 bg-foreground/10 flex items-center justify-center">
                            <span className="text-[10px] uppercase tracking-widest font-bold bg-foreground text-background px-2 py-0.5">Selected</span>
                          </div>
                        )}
                        <span className="absolute bottom-1 left-1 text-[9px] uppercase tracking-wider bg-background/80 px-1.5 py-0.5 font-semibold">
                          {["Studio", "Editorial", "Flat Lay"][i]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
          </div>

          {autoSizes.length > 0 && (
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-semibold mb-2">Opening Stock Qty per Size</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {autoSizes.map((size) => (
                  <div key={size}>
                    <label className="block text-[10px] text-muted-foreground font-semibold mb-1">{size}</label>
                    <input
                      type="number"
                      min="0"
                      value={sizeQty[size] ?? 0}
                      onChange={(e) => setSizeQty(prev => ({ ...prev, [size]: Math.max(0, parseInt(e.target.value) || 0) }))}
                      className="w-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-foreground"
                    />
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                Total: {Object.values(sizeQty).reduce((a, b) => a + b, 0)} units
              </p>
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
              onClick={() => { setShowAddForm(false); setAutoSizes([]); setAiImages([]); setAiImageError(""); }}
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
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-10 h-10 object-cover border border-border" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        ) : (
                          <div className="w-10 h-10 bg-secondary border border-border flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{p.barcode || "—"}</td>
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.category} / {p.subcategory}</td>
                      <td className="px-4 py-3">Rs. {p.price}</td>
                      <td className="px-4 py-3 text-muted-foreground">Rs. {p.costPrice || "0"}</td>
                      <td className="px-4 py-3">
                        <span className={cn("text-xs font-semibold", (p as any).totalStock === 0 ? "text-red-500" : (p as any).totalStock < 10 ? "text-amber-500" : "text-green-600")}>
                          {(p as any).totalStock ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setEditProduct(p)}
                            className="flex items-center gap-1.5 text-xs border border-border px-3 py-1.5 hover:bg-secondary transition-colors">
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                          {p.barcode && (
                            <button onClick={() => setBarcodeProduct(p)}
                              className="flex items-center gap-1.5 text-xs border border-border px-3 py-1.5 hover:bg-secondary transition-colors">
                              <Barcode className="w-3.5 h-3.5" /> Barcode
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
      {editProduct && (
        <EditProductModal product={editProduct} onClose={() => setEditProduct(null)} />
      )}
      {showCsvImport && (
        <CsvImportModal onClose={() => setShowCsvImport(false)} />
      )}
    </AdminLayout>
  );
}
