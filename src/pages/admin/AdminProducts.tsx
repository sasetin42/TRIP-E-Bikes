import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus, Edit, Trash2, Eye, EyeOff, Loader2, Save, X, Upload,
  Zap, Battery, Gauge, Package, Star, Tag, DollarSign, Award,
  CheckCircle, ToggleLeft, ToggleRight, Grid3X3, List,
  Sparkles, Settings, RefreshCw, Search, Filter, TrendingUp,
  BarChart3, MessageSquare, ThumbsUp, ThumbsDown, Reply, AlertCircle,
  Info, Image as ImageIcon, CircleDollarSign, Sliders, ChevronDown, Copy, Lock
} from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { PRODUCTS } from "@/constants/products";
import { CustomSelect } from "@/components/ui/custom-select";
import { db } from "@/lib/firebase";
import {
  collection, onSnapshot, doc, setDoc, deleteDoc,
  updateDoc, query, orderBy
} from "firebase/firestore";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import MediaSourceModal from "@/components/features/MediaSourceModal";

interface ProductCMS {
  id: string;
  product_key: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  original_price: number | null;
  badge: string | null;
  category: string;
  primary_image_url: string | null;
  gallery_images: string[];
  specs: Record<string, string>;
  features: string[];
  use_cases: string[];
  colors: string[];
  addons: { name: string; price: number; description: string }[];
  in_stock: boolean;
  published: boolean;
  sort_order: number;
  brochure_url?: string | null;
  video_url?: string | null;
  created_at: string;
  updated_at: string;
}

interface ProductReview {
  id: string;
  product_id: string;
  customer_id: string;
  rating: number;
  review_text: string | null;
  verified_purchase: boolean;
  helpful_count: number;
  moderation_status: string;
  admin_reply: string | null;
  admin_reply_at: string | null;
  created_at: string;
  username?: string;
}

const emptyForm: Omit<ProductCMS, "id" | "created_at" | "updated_at"> = {
  product_key: "", name: "", tagline: "", description: "",
  price: 0, original_price: null, badge: null,
  category: "Electric Bike", primary_image_url: null,
  gallery_images: [], specs: { motor: "", battery: "", range: "", topSpeed: "", weight: "", payload: "", chargingTime: "" },
  features: [""], use_cases: [""], colors: ["Matte Black"],
  addons: [], in_stock: true, published: true, sort_order: 0,
  brochure_url: null, video_url: null,
};

const CATEGORIES = ["Electric Bike","Cargo E-Bike","Folding E-Bike","Mountain E-Bike","City E-Bike","Fleet Vehicle"];
const CATEGORY_OPTIONS = [{ value: "all", label: "All Categories" }, ...CATEGORIES.map(c => ({ value: c, label: c }))];

const BADGE_OPTIONS = [
  { value: "", label: "No Badge", icon: <X className="w-3.5 h-3.5 text-gray-500" /> },
  { value: "Best Seller", label: "Best Seller", icon: <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> },
  { value: "New Release", label: "New Release", icon: <Zap className="w-3.5 h-3.5 text-green-400 fill-green-400" /> },
  { value: "Limited", label: "Limited", icon: <Sparkles className="w-3.5 h-3.5 text-[#00FFFF] fill-[#00FFFF]" /> },
  { value: "On Sale", label: "On Sale", icon: <Tag className="w-3.5 h-3.5 text-rose-400 fill-rose-400" /> },
  { value: "Most Versatile", label: "Most Versatile", icon: <Award className="w-3.5 h-3.5 text-[#00FFFF] fill-[#00FFFF]" /> },
  { value: "Most Powerful", label: "Most Powerful", icon: <Zap className="w-3.5 h-3.5 text-[#39FF14] fill-[#39FF14]" /> },
];

function CategorySelect({
  value,
  onChange,
  categories
}: {
  value: string;
  onChange: (val: string) => void;
  categories: string[];
}) {
  const [open, setOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clickOut = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", clickOut);
    return () => document.removeEventListener("mousedown", clickOut);
  }, []);

  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!newCatName.trim()) return;
    try {
      const id = newCatName.trim().toLowerCase().replace(/\s+/g, "-");
      await setDoc(doc(db, "product_categories", id), { name: newCatName.trim() });
      setNewCatName("");
      toast.success("Category added successfully.");
    } catch (err: any) {
      toast.error("Failed to add category: " + err.message);
    }
  };

  const handleSaveEdit = async (e: React.MouseEvent, oldName: string) => {
    e.stopPropagation();
    if (!editingValue.trim() || editingValue.trim() === oldName) {
      setEditingIndex(null);
      return;
    }
    try {
      const oldId = oldName.toLowerCase().replace(/\s+/g, "-");
      const newId = editingValue.trim().toLowerCase().replace(/\s+/g, "-");
      
      await deleteDoc(doc(db, "product_categories", oldId));
      await setDoc(doc(db, "product_categories", newId), { name: editingValue.trim() });
      
      if (value === oldName) {
        onChange(editingValue.trim());
      }
      setEditingIndex(null);
      toast.success("Category updated successfully.");
    } catch (err: any) {
      toast.error("Failed to update category: " + err.message);
    }
  };

  const handleDelete = async (e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const id = name.toLowerCase().replace(/\s+/g, "-");
      await deleteDoc(doc(db, "product_categories", id));
      if (value === name) {
        onChange("");
      }
      toast.success("Category deleted successfully.");
    } catch (err: any) {
      toast.error("Failed to delete category: " + err.message);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between border border-white/10 rounded-xl px-4 py-3 bg-[#1A1A1A] text-white text-sm focus:outline-none focus:border-[#39FF14]/50 transition-all text-left"
      >
        <span className="truncate">{value || "Select Category..."}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-full rounded-xl bg-[#0D0D0D]/95 backdrop-blur-xl border border-white/10 shadow-2xl z-[250] overflow-hidden p-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="max-h-48 overflow-y-auto space-y-1 pr-1 scrollbar-none">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                onClick={() => {
                  if (editingIndex !== idx) {
                    onChange(cat);
                    setOpen(false);
                  }
                }}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                  value === cat ? "bg-[#39FF14]/15 text-[#39FF14]" : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {editingIndex === idx ? (
                  <input
                    type="text"
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-0.5 text-xs text-white focus:outline-none focus:border-[#39FF14]"
                    autoFocus
                  />
                ) : (
                  <span className="truncate">{cat}</span>
                )}

                <div className="flex items-center gap-1.5 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                  {editingIndex === idx ? (
                    <button
                      onClick={(e) => handleSaveEdit(e, cat)}
                      className="p-1 text-green-400 hover:bg-green-500/10 rounded transition-colors"
                      title="Save"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        setEditingIndex(idx);
                        setEditingValue(cat);
                      }}
                      className="p-1 text-gray-500 hover:text-white hover:bg-white/5 rounded transition-colors"
                      title="Rename"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => handleDelete(e, cat)}
                    className="p-1 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {categories.length === 0 && (
              <p className="text-[10px] text-gray-600 text-center py-2">No categories defined</p>
            )}
          </div>

          <div className="border-t border-white/5 mt-2 pt-2 flex gap-1.5" onClick={(e) => e.stopPropagation()}>
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Add category..."
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#39FF14]"
            />
            <button
              onClick={handleAdd}
              className="p-1.5 bg-[#39FF14] text-[#0A0A0A] hover:bg-white rounded-lg flex items-center justify-center transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
const STOCK_OPTIONS = [{ value: "all", label: "All Stock Status" }, { value: "in_stock", label: "In Stock" }, { value: "out_of_stock", label: "Out of Stock" }];
const PUBLISHED_OPTIONS = [{ value: "all", label: "All Visibility" }, { value: "published", label: "Published" }, { value: "hidden", label: "Hidden" }];

const INP_STYLE = { style: { background: "#1A1A1A" } };
const inputCls = "w-full border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-[#39FF14]/50 transition-all";

const PRODUCT_TABS = [
  { id: "catalog", label: "Product Catalog", icon: Package },
  { id: "reviews", label: "Reviews Moderation", icon: Star },
];

const convertToWebP = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas 2d context"));
          return;
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("WebP conversion failed"));
            }
          },
          "image/webp",
          0.85
        );
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductCMS[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editing, setEditing] = useState<ProductCMS | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadingBrochure, setUploadingBrochure] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast.error("Please upload a valid video file.");
      return;
    }
    setUploadingVideo(true);
    const tid = toast.loading("Uploading video...");
    try {
      const fileExt = file.name.split(".").pop() || "mp4";
      const storePath = `videos/${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
      const storageRef = ref(storage, storePath);
      await uploadBytes(storageRef, file, { contentType: file.type });
      const url = await getDownloadURL(storageRef);
      setForm(f => ({ ...f, video_url: url }));
      toast.success("Product video uploaded successfully!");
    } catch (err: unknown) {
      toast.error("Video upload failed: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      toast.dismiss(tid);
      setUploadingVideo(false);
    }
  };

  const handleBrochureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file.");
      return;
    }
    setUploadingBrochure(true);
    try {
      const fileExt = "pdf";
      const storePath = `brochures/${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
      const storageRef = ref(storage, storePath);
      await uploadBytes(storageRef, file, { contentType: "application/pdf" });
      const url = await getDownloadURL(storageRef);
      setForm(f => ({ ...f, brochure_url: url }));
      toast.success("Product brochure uploaded!");
    } catch (err: unknown) {
      toast.error("Brochure upload failed: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setUploadingBrochure(false);
    }
  };
  const [activeSection, setActiveSection] = useState<string>("basic");
  const [activeTab, setActiveTab] = useState("catalog");
  // Filters
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStock, setFilterStock] = useState("all");
  const [filterPublished, setFilterPublished] = useState("all");

  const [categories, setCategories] = useState<string[]>([]);
  useEffect(() => {
    const qRef = collection(db, "product_categories");
    const unsubscribe = onSnapshot(qRef, (snapshot) => {
      const list: string[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data().name);
      });
      setCategories(list.sort());
    });
    return () => unsubscribe();
  }, []);

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...categories.map(c => ({ value: c, label: c }))
  ];
  // Reviews
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [reviewFilter, setReviewFilter] = useState("all");
  const primaryImgRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [mediaModalTarget, setMediaModalTarget] = useState<"primary" | "gallery" | "color" | "video" | null>(null);
  const [activeColorUploadIndex, setActiveColorUploadIndex] = useState<number | null>(null);

  const handleMediaModalSelect = (urls: string[]) => {
    if (mediaModalTarget === "primary") {
      setForm((f) => ({ ...f, primary_image_url: urls[0] }));
    } else if (mediaModalTarget === "gallery") {
      setForm((f) => ({ ...f, gallery_images: [...f.gallery_images, ...urls] }));
    } else if (mediaModalTarget === "color") {
      if (activeColorUploadIndex !== null) {
        const c = [...form.colors];
        const colorStr = c[activeColorUploadIndex];
        const hasImage = colorStr.includes("[") && colorStr.includes("]");
        const hasPrice = colorStr.includes("{") && colorStr.includes("}");
        const colorPrice = hasPrice ? colorStr.substring(colorStr.indexOf("{") + 1, colorStr.indexOf("}")) : "";
        let baseName = colorStr;
        if (hasImage) {
          baseName = baseName.substring(0, baseName.indexOf("[")).trim();
        } else if (hasPrice) {
          baseName = baseName.substring(0, baseName.indexOf("{")).trim();
        }
        baseName = baseName.trim();
        
        let finalStr = baseName;
        if (urls[0]) finalStr += ` [${urls[0]}]`;
        if (colorPrice) finalStr += ` {${colorPrice}}`;
        c[activeColorUploadIndex] = finalStr;
        setForm(f => ({ ...f, colors: c }));
      }
    } else if (mediaModalTarget === "video") {
      setForm((f) => ({ ...f, video_url: urls[0] }));
    }
  };

  const fetchReviews = useCallback(async () => {
    setReviewsLoading(true);
    const { data, error } = await apiClient.get("/products.php?action=review_moderation");
    if (!error && data && data.reviews) {
      setReviews(data.reviews);
    }
    setReviewsLoading(false);
  }, []);

  // Live Firestore listener for products
  useEffect(() => {
    const q = query(collection(db, "products_cms"), orderBy("sort_order", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const list: ProductCMS[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as ProductCMS));
      setProducts(list);
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const seedStaticProducts = async () => {
    let successCount = 0;
    for (const [i, p] of PRODUCTS.entries()) {
      try {
        const docRef = doc(db, "products_cms", p.id);
        await setDoc(docRef, {
          product_key: p.id, name: p.name, tagline: p.tagline, description: p.description,
          price: p.price, original_price: null, badge: p.badge || null, category: "Electric Bike",
          primary_image_url: p.image, gallery_images: [p.image], specs: p.specs,
          features: p.features, use_cases: p.useCases, colors: p.colors,
          addons: [], in_stock: p.inStock, published: true, sort_order: i,
          created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        }, { merge: true });
        successCount++;
      } catch {}
    }
    toast.success(`Imported ${successCount}/${PRODUCTS.length} products!`);
  };

  // ── KPI calculations ──
  const kpis = {
    total: products.length,
    published: products.filter(p => p.published).length,
    inStock: products.filter(p => p.in_stock).length,
    avgPrice: products.length > 0 ? Math.round(products.reduce((s, p) => s + p.price, 0) / products.length) : 0,
    avgRating: reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—",
    pendingReviews: reviews.filter(r => r.moderation_status === "pending").length,
  };

  const openNew = () => {
    setEditing(null);
    setForm({ 
      ...emptyForm, 
      specs: { 
        motor: "", 
        battery: "", 
        range: "", 
        topSpeed: "", 
        weight: "", 
        payload: "", 
        chargingTime: "" 
      } 
    });
    setActiveSection("basic");
    setShowEditor(true);
  };

  const openEdit = (p: ProductCMS) => {
    setEditing(p);
    const existingSpecs = p.specs || {};
    // Ensure core specs (motor, battery, range, topSpeed) are locked at the top in exact order
    const orderedSpecs: Record<string, string> = {
      motor: existingSpecs.motor || "",
      battery: existingSpecs.battery || "",
      range: existingSpecs.range || "",
      topSpeed: existingSpecs.topSpeed || existingSpecs.top_speed || "",
    };

    // Append remaining custom specs
    Object.keys(existingSpecs).forEach((key) => {
      if (!["motor", "battery", "range", "topSpeed", "top_speed"].includes(key)) {
        orderedSpecs[key] = existingSpecs[key];
      }
    });

    setForm({
      product_key: p.product_key, name: p.name, tagline: p.tagline || "",
      description: p.description || "", price: p.price, original_price: p.original_price,
      badge: p.badge, category: p.category, primary_image_url: p.primary_image_url,
      gallery_images: p.gallery_images || [], specs: orderedSpecs,
      features: p.features?.length ? p.features : [""],
      use_cases: p.use_cases?.length ? p.use_cases : [""],
      colors: p.colors?.length ? p.colors : [""],
      addons: p.addons || [], in_stock: p.in_stock, published: p.published, sort_order: p.sort_order,
      brochure_url: p.brochure_url || null,
      video_url: p.video_url || null,
    });
    setActiveSection("basic");
    setShowEditor(true);
  };

  const uploadToStorage = async (file: File | Blob, name: string): Promise<string> => {
    const fileExt = name.split(".").pop() || "webp";
    const storePath = `products/${Date.now()}_${Math.random().toString(36).slice(2)}.${fileExt}`;
    const storageRef = ref(storage, storePath);
    const contentType = fileExt === "webp" ? "image/webp" : (file as File).type || "image/jpeg";
    await uploadBytes(storageRef, file, { contentType });
    return await getDownloadURL(storageRef);
  };

  const handlePrimaryImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      let fileToUpload: File | Blob = file;
      let uploadFilename = file.name;
      try {
        const webpBlob = await convertToWebP(file);
        fileToUpload = webpBlob;
        const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
        uploadFilename = `${baseName}.webp`;
      } catch {
        console.warn("WebP conversion failed, uploading original");
      }
      const url = await uploadToStorage(fileToUpload, uploadFilename);
      setForm(f => ({ ...f, primary_image_url: url }));
      toast.success("Primary image uploaded!");
    } catch (err: any) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleGalleryUpload = async (files: FileList) => {
    setUploadingGallery(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      try {
        let fileToUpload: File | Blob = file;
        let uploadFilename = file.name;
        try {
          const webpBlob = await convertToWebP(file);
          fileToUpload = webpBlob;
          const baseName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
          uploadFilename = `${baseName}.webp`;
        } catch {
          console.warn("WebP conversion failed, uploading original");
        }
        const url = await uploadToStorage(fileToUpload, uploadFilename);
        urls.push(url);
      } catch (err: any) {
        toast.error(`Failed to upload ${file.name}: ${err.message}`);
      }
    }
    if (urls.length > 0) {
      setForm(f => ({ ...f, gallery_images: [...f.gallery_images, ...urls] }));
      toast.success(`${urls.length} image${urls.length > 1 ? "s" : ""} added!`);
    }
    setUploadingGallery(false);
  };


  const handleSave = async () => {
    if (!form.name.trim()) { toast.error("Product name is required"); return; }
    if (!form.product_key.trim()) { toast.error("Product key is required"); return; }
    if (form.price <= 0) { toast.error("Price must be greater than 0"); return; }
    setSaving(true);
    try {
      const payload = {
        product_key: form.product_key, name: form.name, tagline: form.tagline,
        description: form.description, price: form.price, original_price: form.original_price,
        badge: form.badge || null, category: form.category, primary_image_url: form.primary_image_url,
        gallery_images: form.gallery_images, specs: form.specs,
        features: form.features.filter(Boolean), use_cases: form.use_cases.filter(Boolean),
        colors: form.colors.filter(Boolean), addons: form.addons,
        in_stock: form.in_stock, published: form.published, sort_order: form.sort_order,
        brochure_url: form.brochure_url,
        video_url: form.video_url,
        updated_at: new Date().toISOString(),
      };
      if (editing) {
        const docRef = doc(db, "products_cms", editing.id || editing.product_key);
        await updateDoc(docRef, payload);
        toast.success("Product updated!");
      } else {
        const docRef = doc(db, "products_cms", form.product_key);
        await setDoc(docRef, { ...payload, created_at: new Date().toISOString() });
        toast.success("Product created!");
      }
      setShowEditor(false);
    } catch (err: any) {
      toast.error((editing ? "Update" : "Create") + " failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: ProductCMS) => {
    if (!confirm(`Delete product "${p.name}" permanently?`)) return;
    try {
      await deleteDoc(doc(db, "products_cms", p.id || p.product_key));
      toast.success("Product deleted.");
    } catch (err: any) {
      toast.error("Delete failed: " + err.message);
    }
  };

  const togglePublished = async (p: ProductCMS) => {
    try {
      await updateDoc(doc(db, "products_cms", p.id || p.product_key), {
        published: !p.published, updated_at: new Date().toISOString()
      });
      toast.success(p.published ? "Product hidden" : "Product published!");
    } catch (err: any) { toast.error(err.message); }
  };

  const toggleStock = async (p: ProductCMS) => {
    try {
      await updateDoc(doc(db, "products_cms", p.id || p.product_key), {
        in_stock: !p.in_stock, updated_at: new Date().toISOString()
      });
      toast.success("Stock status updated.");
    } catch (err: any) { toast.error(err.message); }
  };

  const handleDuplicate = async (p: ProductCMS) => {
    const tid = toast.loading("Duplicating product...");
    try {
      const newKey = `${p.product_key}_copy_${Math.random().toString(36).substring(2, 6)}`;
      const docRef = doc(db, "products_cms", newKey);
      const duplicateData = {
        product_key: newKey,
        name: `${p.name} (Copy)`,
        tagline: p.tagline || "",
        description: p.description || "",
        price: p.price,
        original_price: p.original_price || null,
        badge: p.badge || null,
        category: p.category,
        primary_image_url: p.primary_image_url || null,
        gallery_images: p.gallery_images || [],
        specs: p.specs || {},
        features: p.features || [],
        use_cases: p.use_cases || [],
        colors: p.colors || [],
        addons: p.addons || [],
        in_stock: p.in_stock,
        published: false, // Default duplicated to hidden first
        sort_order: (p.sort_order || 0) + 1,
        brochure_url: p.brochure_url || null,
        video_url: p.video_url || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      await setDoc(docRef, duplicateData);
      toast.success(`Duplicated product as "${p.name} (Copy)"!`);
    } catch (err: any) {
      toast.error("Duplicate failed: " + err.message);
    } finally {
      toast.dismiss(tid);
    }
  };

  const moderateReview = async (id: string, status: string) => {
    const { error } = await apiClient.post("/products.php?action=review_moderation", { review_id: id, status });
    if (!error) { fetchReviews(); toast.success(`Review ${status}`); }
  };

  const deleteReview = async (id: string) => {
    const { error } = await apiClient.delete(`/products.php?action=review_moderation&id=${id}`);
    if (!error) { fetchReviews(); toast.success("Review deleted"); }
  };

  const submitReply = async (id: string) => {
    const { error } = await apiClient.post("/products.php?action=review_moderation", { review_id: id, admin_reply: replyText.trim(), status: "approved" });
    if (!error) { fetchReviews(); setReplyingTo(null); setReplyText(""); toast.success("Reply posted!"); }
  };

  // Filtered products
  const filteredProducts = (products.length > 0 ? products : PRODUCTS.map((p, i) => ({
    id: p.id, product_key: p.id, name: p.name, tagline: p.tagline, description: p.description,
    price: p.price, original_price: null, badge: p.badge || null, category: "Electric Bike",
    primary_image_url: p.image, gallery_images: [p.image], specs: p.specs as Record<string, string>,
    features: p.features, use_cases: p.useCases, colors: p.colors, addons: [],
    in_stock: p.inStock, published: true, sort_order: i, created_at: "", updated_at: "",
  })) as ProductCMS[]).filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.tagline?.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "all" || p.category === filterCategory;
    const matchStock = filterStock === "all" || (filterStock === "in_stock" ? p.in_stock : !p.in_stock);
    const matchPub = filterPublished === "all" || (filterPublished === "published" ? p.published : !p.published);
    return matchSearch && matchCat && matchStock && matchPub;
  });

  const filteredReviews = reviews.filter(r => reviewFilter === "all" || r.moderation_status === reviewFilter);

  const SECTIONS = [
    { id: "basic", label: "Basic Info", icon: Info },
    { id: "media", label: "Images & Gallery", icon: ImageIcon },
    { id: "pricing", label: "Pricing & Addons", icon: CircleDollarSign },
    { id: "specs", label: "Specifications", icon: Sliders },
    { id: "features", label: "Features & Use Cases", icon: Sparkles },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div>
      {/* ── Top Tabs ── */}
      <div className="flex gap-1 border-b border-white/10 mb-8">
        {PRODUCT_TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all border-b-2 -mb-px ${activeTab === tab.id ? "border-[#39FF14] text-[#39FF14]" : "border-transparent text-gray-500 hover:text-gray-300"}`}>
            <tab.icon className="w-4 h-4" />{tab.label}
            {tab.id === "reviews" && kpis.pendingReviews > 0 && (
              <span className="w-5 h-5 rounded-full bg-yellow-500 text-[#0A0A0A] text-[10px] font-black flex items-center justify-center">{kpis.pendingReviews}</span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "catalog" && (
        <>
          {/* ── KPI Row ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {[
              { label: "Total", value: kpis.total, color: "text-white", sub: "products" },
              { label: "Published", value: kpis.published, color: "text-[#39FF14]", sub: "live" },
              { label: "In Stock", value: kpis.inStock, color: "text-blue-400", sub: "available" },
              { label: "Avg Price", value: kpis.avgPrice > 0 ? `₱${(kpis.avgPrice / 1000).toFixed(0)}K` : "—", color: "text-yellow-400", sub: "per unit" },
              { label: "Avg Rating", value: kpis.avgRating, color: "text-orange-400", sub: "stars" },
              { label: "Reviews", value: reviews.length, color: "text-purple-400", sub: "total" },
            ].map(kpi => (
              <div key={kpi.label} className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/5 text-center hover:border-white/10 transition-all">
                <p className={`font-orbitron font-bold text-2xl ${kpi.color}`}>{kpi.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{kpi.label}</p>
                <p className="text-[10px] text-gray-700">{kpi.sub}</p>
              </div>
            ))}
          </div>

          {/* ── Header + Controls ── */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="font-orbitron font-bold text-2xl text-white">Product Catalog</h1>
              <p className="text-gray-500 text-sm mt-1">{filteredProducts.length} of {products.length || PRODUCTS.length} products</p>
            </div>
             <div className="flex items-center gap-3">
              {products.length === 0 && (
                <button onClick={seedStaticProducts} className="flex items-center justify-center gap-2 px-8 py-4 bg-white/5 backdrop-blur-md border border-[#39FF14]/30 text-[#39FF14] text-xs font-bold uppercase tracking-widest hover:bg-[#39FF14]/10 rounded-lg transition-all h-[48px]">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin-hover" />Import
                </button>
              )}
              <div className="flex gap-1 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-1 h-[48px] items-center">
                <button onClick={() => setViewMode("grid")} className={`p-2 rounded-md transition-all ${viewMode === "grid" ? "bg-[#39FF14]/20 text-[#39FF14]" : "text-gray-500 hover:text-white"}`}><Grid3X3 className="w-4 h-4" /></button>
                <button onClick={() => setViewMode("list")} className={`p-2 rounded-md transition-all ${viewMode === "list" ? "bg-[#39FF14]/20 text-[#39FF14]" : "text-gray-500 hover:text-white"}`}><List className="w-4 h-4" /></button>
              </div>
              <button onClick={openNew} className="btn-primary text-xs flex items-center gap-2">
                <Plus className="w-4 h-4" />Add Product
              </button>
            </div>
          </div>

          {/* ── Search + Filters ── */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="relative flex-1 min-w-48">
              <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="text" id="admin-products-search" name="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products by name or tagline..." className="w-full h-[48px] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#39FF14]/30 transition-all" style={{ background: "#111" }} />
            </div>
            <CustomSelect value={filterCategory} onChange={setFilterCategory} options={categoryOptions} size="sm" className="w-44" />
            <CustomSelect value={filterStock} onChange={setFilterStock} options={STOCK_OPTIONS} size="sm" className="w-40" />
            <CustomSelect value={filterPublished} onChange={setFilterPublished} options={PUBLISHED_OPTIONS} size="sm" className="w-36" />
            {(search || filterCategory !== "all" || filterStock !== "all" || filterPublished !== "all") && (
              <button onClick={() => { setSearch(""); setFilterCategory("all"); setFilterStock("all"); setFilterPublished("all"); }}
                className="px-4 py-2.5 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 text-xs text-gray-400 hover:text-white transition-all flex items-center gap-2">
                <X className="w-3.5 h-3.5" />Clear
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-[#39FF14] animate-spin" /></div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map(p => (
                <div key={p.id} className="bg-white/5 backdrop-blur-md rounded-xl border border-white/5 overflow-hidden hover:border-white/10 transition-all group">
                  <div className="relative h-48 overflow-hidden bg-[#111]">
                    <img src={p.primary_image_url || ""} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />
                    {p.badge && (
                      <span className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-0.5 bg-black/60 backdrop-blur-sm border border-[#39FF14]/30 text-[#39FF14] text-[9px] font-bold rounded-full uppercase tracking-wider shadow-[0_0_8px_rgba(57,255,20,0.15)]">
                        {BADGE_OPTIONS.find(opt => opt.value === p.badge)?.icon || <Award className="w-3 h-3 text-cyan-400" />}
                        <span>{p.badge}</span>
                      </span>
                    )}
                    {!p.published && <span className="absolute top-3 right-3 px-2 py-1 bg-gray-800 text-gray-400 text-xs font-bold rounded-full border border-white/20">Hidden</span>}
                    <div className="absolute bottom-3 right-3 flex gap-1.5">
                      <button onClick={() => togglePublished(p)} className="p-1.5 bg-white/5 backdrop-blur-md rounded-lg border border-white/15 text-xs text-gray-300 hover:text-[#39FF14] transition-colors" title={p.published ? "Hide Product" : "Publish Product"}>{p.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}</button>
                      <button onClick={() => toggleStock(p)} className="p-1.5 bg-white/5 backdrop-blur-md rounded-lg border border-white/15 text-xs transition-colors" title="Toggle Stock Status">{p.in_stock ? <ToggleRight className="w-3.5 h-3.5 text-[#39FF14]" /> : <ToggleLeft className="w-3.5 h-3.5 text-gray-500" />}</button>
                      <button onClick={() => handleDuplicate(p)} className="p-1.5 bg-white/5 backdrop-blur-md rounded-lg border border-white/15 text-gray-300 hover:text-cyan-400 transition-colors" title="Duplicate Product"><Copy className="w-3.5 h-3.5" /></button>
                      <button onClick={() => openEdit(p)} className="p-1.5 bg-white/5 backdrop-blur-md rounded-lg border border-white/15 text-gray-300 hover:text-white transition-colors" title="Edit Product"><Edit className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(p)} className="p-1.5 bg-white/5 backdrop-blur-md rounded-lg border border-white/15 text-gray-300 hover:text-red-400 transition-colors" title="Delete Product"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-[10px] text-[#39FF14] font-semibold tracking-widest uppercase mb-0.5">{p.category}</p>
                        <h3 className="font-orbitron font-bold text-base text-white">{p.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{p.tagline}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-orbitron font-bold text-lg text-[#39FF14]">₱{p.price.toLocaleString()}</p>
                        {p.original_price && <p className="text-xs text-gray-600 line-through">₱{p.original_price.toLocaleString()}</p>}
                        <span className={`text-[10px] font-bold ${p.in_stock ? "text-green-400" : "text-red-400"}`}>{p.in_stock ? "In Stock" : "Out of Stock"}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 my-3">
                      {[
                        { icon: Zap, val: (p.specs as any)?.motor?.split?.(" ")?.[0] || "—" },
                        { icon: Battery, val: (p.specs as any)?.range || "—" },
                        { icon: Gauge, val: (p.specs as any)?.topSpeed || "—" },
                      ].map((s, i) => (
                        <div key={i} className="text-center p-2 bg-white/3 rounded-lg border border-white/5">
                          <s.icon className="w-3 h-3 text-[#39FF14] mx-auto mb-0.5" />
                          <p className="text-[11px] text-gray-300 font-medium">{s.val}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-gray-600 pt-2 border-t border-white/5">
                      <span>{(p.features || []).length} features</span>
                      <span>{(p.gallery_images || []).length} images</span>
                      <span>{(p.addons || []).length} addons</span>
                    </div>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-3 text-center py-16">
                  <Package className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-500">No products match your filters.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredProducts.map(p => (
                <div key={p.id} className="bg-white/5 backdrop-blur-md rounded-xl border border-white/5 hover:border-white/10 transition-all flex gap-4 p-4 items-center">
                  <img src={p.primary_image_url || ""} alt={p.name} className="w-20 h-16 object-cover rounded-lg shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-white text-sm">{p.name}</p>
                      {p.badge && (
                        <span className="inline-flex items-center gap-1 text-[9px] px-2 py-0.5 bg-black/60 border border-[#39FF14]/30 text-[#39FF14] rounded-full font-bold uppercase tracking-wider">
                          {BADGE_OPTIONS.find(opt => opt.value === p.badge)?.icon || <Award className="w-3 h-3 text-cyan-400" />}
                          <span>{p.badge}</span>
                        </span>
                      )}
                      <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded-full ${p.published ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-500"}`}>{p.published ? "Live" : "Hidden"}</span>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span className="text-[#39FF14] font-bold">₱{p.price.toLocaleString()}</span>
                      <span>{(p.specs as any)?.motor?.split?.(" ")?.[0] || "—"} motor</span>
                      <span>{(p.specs as any)?.range || "—"} range</span>
                      <span className={p.in_stock ? "text-green-400" : "text-red-400"}>{p.in_stock ? "In Stock" : "Out of Stock"}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => togglePublished(p)} className="p-2 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 text-gray-400 hover:text-[#39FF14] transition-colors" title={p.published ? "Hide Product" : "Publish Product"}>{p.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}</button>
                    <button onClick={() => handleDuplicate(p)} className="p-2 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 text-gray-400 hover:text-cyan-400 transition-colors" title="Duplicate Product"><Copy className="w-3.5 h-3.5" /></button>
                    <button onClick={() => openEdit(p)} className="p-2 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 text-gray-400 hover:text-white transition-colors" title="Edit Product"><Edit className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleDelete(p)} className="p-2 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 text-gray-400 hover:text-red-400 transition-colors" title="Delete Product"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── REVIEWS TAB ── */}
      {activeTab === "reviews" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-orbitron font-bold text-xl text-white">Reviews Moderation</h2>
              <p className="text-gray-500 text-sm mt-1">{reviews.length} total · {kpis.pendingReviews} pending review</p>
            </div>
            <div className="flex gap-1 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-1">
              {[{ v: "all", l: "All" }, { v: "approved", l: "Approved" }, { v: "rejected", l: "Rejected" }].map(opt => (
                <button key={opt.v} onClick={() => setReviewFilter(opt.v)}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${reviewFilter === opt.v ? "bg-[#39FF14]/20 text-[#39FF14]" : "text-gray-500 hover:text-white"}`}>
                  {opt.l}
                </button>
              ))}
            </div>
          </div>

          {/* Per-product rating summaries */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...new Set(reviews.map(r => r.product_id))].slice(0, 4).map(pid => {
              const prodReviews = reviews.filter(r => r.product_id === pid);
              const avg = prodReviews.reduce((s, r) => s + r.rating, 0) / prodReviews.length;
              const name = PRODUCTS.find(p => p.id === pid)?.name || pid;
              return (
                <div key={pid} className="bg-white/5 backdrop-blur-md rounded-xl border border-white/5 p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1 truncate">{name}</p>
                  <p className="font-orbitron font-bold text-2xl text-[#39FF14]">{avg.toFixed(1)}</p>
                  <div className="flex justify-center gap-0.5 my-1">
                    {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= Math.round(avg) ? "text-[#39FF14] fill-[#39FF14]" : "text-gray-600"}`} />)}
                  </div>
                  <p className="text-xs text-gray-600">{prodReviews.length} reviews</p>
                </div>
              );
            })}
          </div>

          {reviewsLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-[#39FF14] animate-spin" /></div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-16">
              <Star className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500">No reviews found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map(review => {
                const productName = PRODUCTS.find(p => p.id === review.product_id)?.name || review.product_id;
                const statusCfg = {
                  approved: { color: "text-[#39FF14]", bg: "bg-[#39FF14]/15", border: "border-[#39FF14]/30" },
                  rejected: { color: "text-red-400", bg: "bg-red-500/15", border: "border-red-500/30" },
                  pending: { color: "text-yellow-400", bg: "bg-yellow-500/15", border: "border-yellow-500/30" },
                }[review.moderation_status] || { color: "text-gray-400", bg: "bg-gray-500/15", border: "border-gray-500/30" };

                return (
                  <div key={review.id} className={`bg-white/5 backdrop-blur-md rounded-xl border p-5 ${review.moderation_status === "rejected" ? "border-red-500/20 opacity-70" : "border-white/5"}`}>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/8 border border-white/10 flex items-center justify-center font-bold text-white text-sm">
                          {(review.username || "A")[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-white text-sm">{review.username}</p>
                            {review.verified_purchase && (
                              <span className="flex items-center gap-1 px-1.5 py-0.5 bg-[#39FF14]/10 border border-[#39FF14]/20 rounded-full text-[9px] text-[#39FF14] font-semibold">
                                <CheckCircle className="w-2.5 h-2.5" />Verified
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">{productName} · {new Date(review.created_at).toLocaleDateString("en-PH")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => <Star key={s} className={`w-4 h-4 ${s <= review.rating ? "text-[#39FF14] fill-[#39FF14]" : "text-gray-600"}`} />)}
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusCfg.bg} ${statusCfg.border} ${statusCfg.color}`}>
                          {review.moderation_status}
                        </span>
                      </div>
                    </div>
                    {review.review_text && <p className="text-gray-300 text-sm leading-relaxed mb-3">{review.review_text}</p>}

                    {/* Admin reply */}
                    {review.admin_reply && (
                      <div className="mt-3 p-3 rounded-xl bg-[#39FF14]/5 border border-[#39FF14]/15">
                        <p className="text-xs text-[#39FF14] font-semibold mb-1">Official TRIP Response</p>
                        <p className="text-xs text-gray-300">{review.admin_reply}</p>
                      </div>
                    )}

                    {/* Reply form */}
                    {replyingTo === review.id && (
                      <div className="mt-3 space-y-2">
                        <textarea
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          placeholder="Write official TRIP response visible to all customers..."
                          rows={3}
                          className={inputCls + " resize-none text-xs"}
                          style={{ background: "#1A1A1A" }}
                        />
                        <div className="flex gap-2">
                          <button onClick={() => submitReply(review.id)} className="px-4 py-2 bg-[#39FF14] text-[#0A0A0A] rounded-xl text-xs font-bold hover:bg-white transition-all">Post Reply</button>
                          <button onClick={() => { setReplyingTo(null); setReplyText(""); }} className="px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 text-gray-400 rounded-xl text-xs hover:text-white transition-all">Cancel</button>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                      <span className="text-xs text-gray-600 flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{review.helpful_count} helpful</span>
                      <div className="flex gap-2 ml-auto">
                        <button onClick={() => { setReplyingTo(replyingTo === review.id ? null : review.id); setReplyText(review.admin_reply || ""); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 backdrop-blur-md border border-white/10 text-gray-400 hover:text-[#39FF14] rounded-lg text-xs transition-all">
                          <Reply className="w-3.5 h-3.5" />{review.admin_reply ? "Edit Reply" : "Reply"}
                        </button>
                        {review.moderation_status !== "approved" && (
                          <button onClick={() => moderateReview(review.id, "approved")}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#39FF14]/15 border border-[#39FF14]/30 text-[#39FF14] rounded-lg text-xs hover:bg-[#39FF14]/25 transition-all">
                            <ThumbsUp className="w-3.5 h-3.5" />Approve
                          </button>
                        )}
                        {review.moderation_status !== "rejected" && (
                          <button onClick={() => moderateReview(review.id, "rejected")}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/15 border border-red-500/30 text-red-400 rounded-lg text-xs hover:bg-red-500/25 transition-all">
                            <ThumbsDown className="w-3.5 h-3.5" />Reject
                          </button>
                        )}
                        <button onClick={() => deleteReview(review.id)}
                          className="p-1.5 bg-white/5 backdrop-blur-md border border-white/10 text-gray-500 hover:text-red-400 rounded-lg text-xs transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── PRODUCT EDITOR MODAL ── */}
      {showEditor && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-black/90 backdrop-blur-xl p-4">
          <div className="w-full max-w-5xl neon-trail-border-container p-[2px] rounded-2xl overflow-hidden shadow-2xl">
            <div className="relative w-full h-[85vh] max-h-[700px] flex flex-col rounded-[14px] overflow-hidden"
              style={{ background: "linear-gradient(145deg, #0F0F0F 0%, #0D0D0D 100%)" }}>

            {/* Animated top bar */}
            <div className="h-[2px] w-full bg-gradient-to-r from-[#39FF14] via-[#00FFFF] to-[#39FF14] animate-pulse shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between px-8 py-3.5 border-b border-white/8 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#39FF14]/15 border border-[#39FF14]/25 flex items-center justify-center">
                  {editing ? <Edit className="w-5 h-5 text-[#39FF14]" /> : <Plus className="w-5 h-5 text-[#39FF14]" />}
                </div>
                <div>
                  <h2 className="font-orbitron font-bold text-xl text-white">{editing ? "Edit Product" : "Add New Product"}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Manage all product details, images, pricing, specs, and addons</p>
                </div>
              </div>
              <button onClick={() => setShowEditor(false)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/10 text-gray-500 hover:text-white hover:border-white/30 transition-all"><X className="w-4 h-4" /></button>
            </div>

            <div className="flex flex-1 min-h-0">
              {/* Section Nav */}
              <div className="w-56 shrink-0 border-r border-white/5 bg-[#0C0C0C] flex flex-col justify-between p-4">
                <div className="space-y-1">
                  {SECTIONS.map(s => {
                    const Icon = s.icon;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setActiveSection(s.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition-all ${
                          activeSection === s.id
                            ? "text-[#39FF14] bg-[#39FF14]/8 border border-[#39FF14]/20"
                            : "text-gray-500 hover:text-gray-300 hover:bg-white/3"
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{s.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 pt-4 border-t border-white/5">
                  <button onClick={handleSave} disabled={saving} className="w-full btn-primary flex items-center justify-center gap-2 py-3 text-xs min-h-[40px] rounded-xl font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(57,255,20,0.15)] whitespace-nowrap">
                    <Save className="w-4 h-4" />
                    <span>{saving ? "Saving..." : editing ? "Save Changes" : "Create Product"}</span>
                  </button>
                </div>
              </div>

              <div className="flex-1 p-8 space-y-6 overflow-y-auto">
                {/* ── BASIC INFO ── */}
                {activeSection === "basic" && (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                      <div className="col-span-2">
                        <label htmlFor="prod-name" className="block text-xs text-gray-400 mb-2 uppercase tracking-widest">Product Name <span className="text-[#39FF14]">*</span></label>
                        <input 
                          id="prod-name" 
                          name="name" 
                          value={form.name} 
                          onChange={e => {
                            const newName = e.target.value;
                            // Automate product key generation: lowercase, replace spaces/specials with hyphens
                            const generatedKey = newName
                              .toLowerCase()
                              .replace(/[^a-z0-9\s-]/g, "") // remove non-alphanumeric/spaces/hyphens
                              .trim()
                              .replace(/\s+/g, "-");
                            setForm(f => ({ 
                              ...f, 
                              name: newName,
                              product_key: f.product_key === "" || f.product_key === f.name.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-") ? generatedKey : f.product_key
                            }));
                          }} 
                          placeholder="TRIP Cargo Pro" 
                          className={inputCls} 
                          {...INP_STYLE} 
                        />
                      </div>
                      <div>
                        <label htmlFor="prod-key" className="block text-xs text-gray-400 mb-2 uppercase tracking-widest">Product Key <span className="text-[#39FF14]">*</span></label>
                        <input id="prod-key" name="product_key" value={form.product_key} onChange={e => setForm(f => ({ ...f, product_key: e.target.value.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-") }))} placeholder="cargo-pro" className={inputCls + " font-mono"} {...INP_STYLE} />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-2 uppercase tracking-widest">Category</label>
                        <CategorySelect value={form.category} onChange={v => setForm(f => ({ ...f, category: v }))} categories={categories} />
                      </div>
                      <div className="col-span-2">
                        <label htmlFor="prod-tagline" className="block text-xs text-gray-400 mb-2 uppercase tracking-widest">Product Tags (comma separated)</label>
                        <input id="prod-tagline" name="tagline" value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} placeholder="folding, commuter, fat tire, cargo" className={inputCls} {...INP_STYLE} />
                      </div>
                      <div className="col-span-2">
                        <label htmlFor="prod-description" className="block text-xs text-gray-400 mb-2 uppercase tracking-widest">Description</label>
                        <textarea 
                          id="prod-description" 
                          name="description" 
                          value={form.description} 
                          onChange={e => {
                            const desc = e.target.value;
                            
                            // Automate Product Tags generation: extracts key bike terms
                            let autoTags = form.tagline;
                            const isCurrentlyEmptyOrAuto = !form.tagline || form.tagline.trim() === "" || form.tagline.split(",").length <= 3;
                            
                            if (isCurrentlyEmptyOrAuto) {
                              const tagsSet = new Set<string>();
                              
                              // 1. Gather keywords from Category
                              if (form.category) {
                                const catLower = form.category.toLowerCase();
                                if (catLower.includes("fold")) tagsSet.add("folding");
                                if (catLower.includes("cargo")) tagsSet.add("cargo");
                                if (catLower.includes("mountain")) tagsSet.add("mountain");
                                if (catLower.includes("city")) tagsSet.add("urban");
                                tagsSet.add("e-bike");
                              }
                              
                              // 2. Gather keywords from Title/Name
                              const titleWords = form.name.toLowerCase().split(/\s+/);
                              titleWords.forEach(word => {
                                const clean = word.replace(/[^a-z0-9]/g, "");
                                if (["fat", "tire", "long", "range", "pro", "max", "lite", "utility", "commuter", "foldable", "heavy", "duty"].includes(clean)) {
                                  tagsSet.add(clean);
                                }
                              });
                              
                              // 3. Scan Description for core tech specs/use cases
                              const descLower = desc.toLowerCase();
                              if (descLower.includes("fat tire") || descLower.includes("fat-tire")) {
                                tagsSet.add("fat tire");
                              }
                              if (descLower.includes("commute") || descLower.includes("daily ride")) {
                                tagsSet.add("commuter");
                              }
                              if (descLower.includes("delivery") || descLower.includes("cargo") || descLower.includes("carrier")) {
                                tagsSet.add("utility");
                              }
                              if (descLower.includes("lithium") || descLower.includes("battery") || descLower.includes("range")) {
                                tagsSet.add("long range");
                              }
                              if (descLower.includes("speed") || descLower.includes("motor") || descLower.includes("500w") || descLower.includes("750w")) {
                                tagsSet.add("high performance");
                              }
                              
                              // Fallback keywords if not enough tags are found
                              const defaultTags = ["e-bike", "smart travel", "clean energy", "eco-friendly"];
                              let defaultIdx = 0;
                              while (tagsSet.size < 4 && defaultIdx < defaultTags.length) {
                                tagsSet.add(defaultTags[defaultIdx]);
                                defaultIdx++;
                              }
                              
                              // Slice to exactly 4-5 tags max
                              autoTags = Array.from(tagsSet).slice(0, 5).join(", ");
                            }
                            
                            setForm(f => ({ ...f, description: desc, tagline: autoTags }));
                          }} 
                          rows={4} 
                          placeholder="Full product description..." 
                          className={inputCls + " resize-none"} 
                          style={{ background: "#1A1A1A" }} 
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-2 uppercase tracking-widest">Badge Label</label>
                        <CustomSelect
                          value={form.badge || ""}
                          onChange={(v) => setForm((f) => ({ ...f, badge: v || null }))}
                          options={BADGE_OPTIONS}
                          placeholder="Select Badge..."
                          size="md"
                        />
                      </div>
                      <div>
                        <label htmlFor="prod-sort-order" className="block text-xs text-gray-400 mb-2 uppercase tracking-widest">Sort Order</label>
                        <input type="number" id="prod-sort-order" name="sort_order" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} className={inputCls} {...INP_STYLE} />
                      </div>
                    </div>
                  </div>
                )}

                {/* ── IMAGES ── */}
                {activeSection === "media" && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs text-gray-400 mb-3 uppercase tracking-widest font-medium">Primary Product Image</label>
                      {form.primary_image_url ? (
                        <div className="relative rounded-xl overflow-hidden h-48 border border-white/10 group">
                          <img src={form.primary_image_url} alt="Primary" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3">
                            <button onClick={() => setMediaModalTarget("primary")} className="px-4 py-2 bg-[#39FF14] text-[#0A0A0A] rounded-lg text-xs font-bold">Change</button>
                            <button onClick={() => setForm(f => ({ ...f, primary_image_url: null }))} className="px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-bold">Remove</button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setMediaModalTarget("primary")} className="w-full h-48 rounded-xl border-2 border-dashed border-white/20 hover:border-[#39FF14]/50 transition-all flex flex-col items-center justify-center gap-3 text-gray-500 hover:text-[#39FF14]">
                          {uploadingImage ? <Loader2 className="w-8 h-8 animate-spin" /> : <><Upload className="w-8 h-8" /><p className="text-sm font-medium">Click to upload primary image</p><p className="text-xs">JPG, PNG, WebP · Max 20MB</p></>}
                        </button>
                      )}
                      <div className="mt-3">
                        <label htmlFor="prod-primary-image-url" className="block text-xs text-gray-500 mb-1.5">Or paste image URL</label>
                        <input id="prod-primary-image-url" name="primary_image_url" value={form.primary_image_url || ""} onChange={e => setForm(f => ({ ...f, primary_image_url: e.target.value || null }))} placeholder="https://..." className={inputCls + " font-mono text-xs"} {...INP_STYLE} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs text-gray-400 mb-3 uppercase tracking-widest font-medium">Product Brochure (PDF)</label>
                        {form.brochure_url ? (
                          <div className="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-[#39FF14] font-semibold truncate">{form.brochure_url.split("/").pop() || "Brochure PDF"}</p>
                              <a href={form.brochure_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-gray-500 hover:underline">View Document</a>
                            </div>
                            <button onClick={() => setForm(f => ({ ...f, brochure_url: null }))} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold transition-all">Remove</button>
                          </div>
                        ) : (
                          <div className="relative">
                            <input
                              type="file"
                              accept=".pdf,application/pdf"
                              onChange={handleBrochureUpload}
                              id="brochure-file-upload"
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => document.getElementById("brochure-file-upload")?.click()}
                              className="w-full h-24 rounded-xl border-2 border-dashed border-white/15 hover:border-[#39FF14]/40 transition-all flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-[#39FF14]"
                            >
                              {uploadingBrochure ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <>
                                  <Upload className="w-5 h-5" />
                                  <p className="text-sm">Click to upload product brochure PDF</p>
                                  <p className="text-xs">PDF only · Max 20MB</p>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                        <div className="mt-3">
                          <label htmlFor="prod-brochure-url" className="block text-xs text-gray-500 mb-1.5">Or paste brochure PDF URL</label>
                          <input id="prod-brochure-url" name="brochure_url" value={form.brochure_url || ""} onChange={e => setForm(f => ({ ...f, brochure_url: e.target.value || null }))} placeholder="https://.../brochure.pdf" className={inputCls + " font-mono text-xs"} {...INP_STYLE} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-3 uppercase tracking-widest font-medium">Product Video (HD Showreel)</label>
                        {form.video_url ? (
                          <div className="flex flex-col gap-3 p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
                            <video src={form.video_url} controls className="w-full h-36 object-cover rounded-lg bg-black/60 border border-white/5" />
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-gray-500 truncate max-w-[200px]">{form.video_url.split("/").pop()}</span>
                              <div className="flex gap-2">
                                <button onClick={() => setMediaModalTarget("video")} className="px-3 py-1.5 bg-[#39FF14] text-[#0A0A0A] rounded-lg text-xs font-bold transition-all">Change</button>
                                <button onClick={() => setForm(f => ({ ...f, video_url: null }))} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold transition-all">Remove</button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setMediaModalTarget("video")}
                              className="w-full h-24 rounded-xl border-2 border-dashed border-white/15 hover:border-[#39FF14]/40 transition-all flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-[#39FF14]"
                            >
                              <Upload className="w-5 h-5" />
                              <p className="text-sm">Click to choose or upload video</p>
                              <p className="text-xs">MP4, WebM · Max 50MB</p>
                            </button>
                          </div>
                        )}
                        <div className="mt-3">
                          <label htmlFor="prod-video-url" className="block text-xs text-gray-500 mb-1.5">Or paste video URL</label>
                          <input id="prod-video-url" name="video_url" value={form.video_url || ""} onChange={e => setForm(f => ({ ...f, video_url: e.target.value || null }))} placeholder="https://.../video.mp4" className={inputCls + " font-mono text-xs"} {...INP_STYLE} />
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-xs text-gray-400 uppercase tracking-widest font-medium">Gallery ({form.gallery_images.length} images)</label>
                        {form.gallery_images.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setForm(f => ({ ...f, gallery_images: [] }))}
                            className="text-xs text-red-400 hover:underline flex items-center gap-1"
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                      <button 
                        type="button"
                        onClick={() => setMediaModalTarget("gallery")} 
                        className="w-full h-20 rounded-xl border-2 border-dashed border-white/15 hover:border-[#39FF14]/40 transition-all flex items-center justify-center gap-3 text-gray-500 hover:text-[#39FF14] mb-4 bg-white/2"
                      >
                        {uploadingGallery ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Upload className="w-5 h-5" /><p className="text-sm font-medium">Upload / Add Multiple Gallery Images</p></>}
                      </button>
                      {form.gallery_images.length > 0 && (
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 max-h-[320px] overflow-y-auto pr-1 scrollbar-thin">
                          {form.gallery_images.map((url, i) => (
                            <div key={url + i} className="relative rounded-lg overflow-hidden aspect-square border border-white/10 bg-black/40 group contain-strict">
                              <img 
                                src={url} 
                                alt={`Gallery ${i + 1}`} 
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-contain p-1.5 transition-transform duration-200 group-hover:scale-105" 
                              />
                              <button 
                                type="button"
                                onClick={() => setForm(f => ({ ...f, gallery_images: f.gallery_images.filter((_, j) => j !== i) }))} 
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                title="Remove image"
                              >
                                <X className="w-5 h-5 text-red-400 hover:scale-110 transition-transform" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── PRICING & ADDONS ── */}
                {activeSection === "pricing" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="prod-price" className="block text-xs text-gray-400 mb-2 uppercase tracking-widest">Base Price (PHP) <span className="text-[#39FF14]">*</span></label>
                        <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₱</span>
                          <input type="number" id="prod-price" name="price" value={form.price} onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) || 0 }))} className={inputCls + " pl-8"} {...INP_STYLE} /></div>
                      </div>
                      <div>
                        <label htmlFor="prod-original-price" className="block text-xs text-gray-400 mb-2 uppercase tracking-widest">Original Price (Strike-through)</label>
                        <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₱</span>
                          <input type="number" id="prod-original-price" name="original_price" value={form.original_price || ""} onChange={e => setForm(f => ({ ...f, original_price: parseFloat(e.target.value) || null }))} placeholder="Optional" className={inputCls + " pl-8"} {...INP_STYLE} /></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-xs text-gray-400 uppercase tracking-widest font-medium">Colors</label>
                        <button onClick={() => setForm(f => ({ ...f, colors: [...f.colors, ""] }))} className="text-xs text-[#39FF14] hover:underline flex items-center gap-1"><Plus className="w-3 h-3" />Add</button>
                      </div>
                      {form.colors.map((colorStr, i) => {
                        const hasImage = colorStr.includes("[") && colorStr.includes("]");
                        const imageUrl = hasImage ? colorStr.substring(colorStr.indexOf("[") + 1, colorStr.indexOf("]")) : "";
                        
                        const hasPrice = colorStr.includes("{") && colorStr.includes("}");
                        const colorPrice = hasPrice ? colorStr.substring(colorStr.indexOf("{") + 1, colorStr.indexOf("}")) : "";
                        
                        // Extract base name
                        let baseName = colorStr;
                        if (hasImage) {
                          baseName = baseName.substring(0, baseName.indexOf("[")).trim();
                        } else if (hasPrice) {
                          baseName = baseName.substring(0, baseName.indexOf("{")).trim();
                        }
                        baseName = baseName.trim();

                        const updateColorString = (newName: string, newUrl: string, newPrice: string) => {
                          let finalStr = newName.trim();
                          if (newUrl) finalStr += ` [${newUrl}]`;
                          if (newPrice) finalStr += ` {${newPrice}}`;
                          
                          const c = [...form.colors];
                          c[i] = finalStr;
                          setForm(f => ({ ...f, colors: c }));
                        };

                        return (
                          <div key={i} className="space-y-3 mb-4 p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/8 relative group/item">
                            <div className="flex gap-4 items-center">
                              <div className="flex-1">
                                <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-widest">Color Name</label>
                                <input 
                                  value={baseName} 
                                  onChange={e => updateColorString(e.target.value, imageUrl, colorPrice)} 
                                  placeholder="Matte Black" 
                                  className={inputCls} 
                                  {...INP_STYLE} 
                                />
                              </div>
                              <div className="w-40">
                                <label className="block text-[10px] text-gray-500 mb-1 uppercase tracking-widest">Base Price (₱)</label>
                                <input 
                                  type="number"
                                  value={colorPrice} 
                                  onChange={e => updateColorString(baseName, imageUrl, e.target.value)} 
                                  placeholder="0" 
                                  className={inputCls} 
                                  {...INP_STYLE} 
                                />
                              </div>
                              {form.colors.length > 1 && (
                                <button 
                                  onClick={() => setForm(f => ({ ...f, colors: f.colors.filter((_, j) => j !== i) }))} 
                                  className="text-red-400 p-2 hover:bg-red-500/10 rounded-lg mt-5 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                            
                            {/* Color Image Upload Component */}
                            <div className="flex items-center gap-3 pt-1 border-t border-white/5">
                              <button
                                type="button"
                                onClick={() => {
                                  setMediaModalTarget("color");
                                  setActiveColorUploadIndex(i);
                                }}
                                className="px-3 py-1.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg text-xs hover:border-[#39FF14]/50 transition-colors text-gray-300"
                              >
                                Upload Color Image
                              </button>
                              {imageUrl ? (
                                <div className="flex items-center gap-1.5">
                                  <img
                                    src={imageUrl}
                                    alt="Color Preview"
                                    className="w-8 h-8 rounded-lg object-cover border border-white/20"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => updateColorString(baseName, "", colorPrice)}
                                    className="text-[10px] text-red-400 hover:underline"
                                  >
                                    Remove Image
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-gray-500">No color-specific image</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div><label className="text-xs text-gray-400 uppercase tracking-widest font-medium">Addons</label><p className="text-[10px] text-gray-600 mt-0.5">Optional upgrades customers can add</p></div>
                        <button onClick={() => setForm(f => ({ ...f, addons: [...f.addons, { name: "", price: 0, description: "" }] }))} className="text-xs text-[#39FF14] hover:underline flex items-center gap-1"><Plus className="w-3 h-3" />Add Addon</button>
                      </div>
                      {form.addons.length === 0 ? (
                        <div className="text-center py-8 bg-white/5 backdrop-blur-md rounded-xl border border-white/5 text-gray-600 text-sm"><Sparkles className="w-8 h-8 mx-auto mb-2 opacity-30" />No addons yet.</div>
                      ) : form.addons.map((addon, i) => (
                        <div key={i} className="p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/8 mb-3 space-y-3">
                          <div className="flex items-center justify-between"><p className="text-xs text-gray-400 font-semibold">Addon #{i + 1}</p><button onClick={() => setForm(f => ({ ...f, addons: f.addons.filter((_, j) => j !== i) }))} className="text-red-400"><X className="w-4 h-4" /></button></div>
                          <div className="grid grid-cols-2 gap-3">
                            <div><label className="block text-[10px] text-gray-500 mb-1.5 uppercase tracking-widest">Name</label><input value={addon.name} onChange={e => { const a = [...form.addons]; a[i] = { ...a[i], name: e.target.value }; setForm(f => ({ ...f, addons: a })); }} className={inputCls + " py-2"} {...INP_STYLE} /></div>
                            <div><label className="block text-[10px] text-gray-500 mb-1.5 uppercase tracking-widest">Price (PHP)</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">₱</span><input type="number" value={addon.price} onChange={e => { const a = [...form.addons]; a[i] = { ...a[i], price: parseFloat(e.target.value) || 0 }; setForm(f => ({ ...f, addons: a })); }} className={inputCls + " py-2 pl-7"} {...INP_STYLE} /></div></div>
                          </div>
                          <div><label className="block text-[10px] text-gray-500 mb-1.5 uppercase tracking-widest">Description</label><input value={addon.description} onChange={e => { const a = [...form.addons]; a[i] = { ...a[i], description: e.target.value }; setForm(f => ({ ...f, addons: a })); }} className={inputCls + " py-2"} {...INP_STYLE} /></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── SPECS ── */}
                {activeSection === "specs" && (
                  <div className="space-y-4">
                    <div className="p-3 bg-[#39FF14]/5 border border-[#39FF14]/20 rounded-xl mb-4">
                      <p className="text-xs text-[#39FF14] font-semibold flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" /> Permanent Core Specs Locked
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Motor, Battery, Range, and Top Speed are fixed core parameters displayed prominently on product cards and comparison tables.
                      </p>
                    </div>

                    {Object.entries(form.specs).map(([key, value]) => {
                      const isCoreSpec = ["motor", "battery", "range", "topSpeed"].includes(key);
                      return (
                        <div key={key} className={`grid grid-cols-5 gap-3 items-center p-2 rounded-xl transition-all ${isCoreSpec ? "bg-white/3 border border-white/8" : ""}`}>
                          <div className="col-span-2 relative">
                            <input 
                              value={key} 
                              disabled={isCoreSpec}
                              onChange={e => { 
                                if (isCoreSpec) return;
                                const s: Record<string, string> = {}; 
                                Object.keys(form.specs).forEach(k => { 
                                  s[k === key ? e.target.value : k] = form.specs[k]; 
                                }); 
                                setForm(f => ({ ...f, specs: s })); 
                              }} 
                              className={`${inputCls} py-2 text-xs font-mono ${isCoreSpec ? "bg-black/60 text-[#39FF14] font-bold cursor-not-allowed border-[#39FF14]/20 pr-8" : "text-gray-400"}`} 
                              {...INP_STYLE} 
                            />
                            {isCoreSpec && (
                              <Lock className="w-3.5 h-3.5 text-[#39FF14]/70 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            )}
                          </div>
                          <div className="col-span-2">
                            <input 
                              value={value} 
                              onChange={e => setForm(f => ({ ...f, specs: { ...f.specs, [key]: e.target.value } }))} 
                              placeholder={`Enter ${key || "specification"}...`} 
                              className={inputCls + " py-2"} 
                              {...INP_STYLE} 
                            />
                          </div>
                          <div>
                            {!isCoreSpec ? (
                              <button 
                                type="button"
                                onClick={() => { const s = { ...form.specs }; delete s[key]; setForm(f => ({ ...f, specs: s })); }} 
                                className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Remove Specification"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            ) : (
                              <span className="text-[10px] text-gray-500 font-semibold px-2 py-1 bg-white/5 rounded border border-white/10 uppercase tracking-wider">
                                Fixed
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    <button 
                      type="button"
                      onClick={() => setForm(f => ({ ...f, specs: { ...f.specs, "": "" } }))} 
                      className="flex items-center gap-2 text-xs text-[#39FF14] hover:underline pt-2 font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Additional Custom Specification
                    </button>
                  </div>
                )}

                {/* ── FEATURES ── */}
                {activeSection === "features" && (
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-3"><label className="text-xs text-gray-400 uppercase tracking-widest font-medium">Key Features</label><button onClick={() => setForm(f => ({ ...f, features: [...f.features, ""] }))} className="text-xs text-[#39FF14] hover:underline flex items-center gap-1"><Plus className="w-3 h-3" />Add</button></div>
                      {form.features.map((feat, i) => (
                        <div key={i} className="flex gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-[#39FF14]/40 mt-3 shrink-0" />
                          <input value={feat} onChange={e => { const f = [...form.features]; f[i] = e.target.value; setForm(prev => ({ ...prev, features: f })); }} placeholder="Feature description" className={inputCls} {...INP_STYLE} />
                          {form.features.length > 1 && <button onClick={() => setForm(f => ({ ...f, features: f.features.filter((_, j) => j !== i) }))} className="text-red-400"><X className="w-4 h-4" /></button>}
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-3"><label className="text-xs text-gray-400 uppercase tracking-widest font-medium">Use Cases</label><button onClick={() => setForm(f => ({ ...f, use_cases: [...f.use_cases, ""] }))} className="text-xs text-[#39FF14] hover:underline flex items-center gap-1"><Plus className="w-3 h-3" />Add</button></div>
                      {form.use_cases.map((uc, i) => (
                        <div key={i} className="flex gap-2 mb-2">
                          <Package className="w-4 h-4 text-[#39FF14]/40 mt-3 shrink-0" />
                          <input value={uc} onChange={e => { const u = [...form.use_cases]; u[i] = e.target.value; setForm(prev => ({ ...prev, use_cases: u })); }} placeholder="e.g. Last-mile delivery" className={inputCls} {...INP_STYLE} />
                          {form.use_cases.length > 1 && <button onClick={() => setForm(f => ({ ...f, use_cases: f.use_cases.filter((_, j) => j !== i) }))} className="text-red-400"><X className="w-4 h-4" /></button>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── SETTINGS ── */}
                {activeSection === "settings" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/8">
                      <div><p className="font-semibold text-white text-sm">Published</p><p className="text-xs text-gray-500">Visible to public website visitors</p></div>
                      <button onClick={() => setForm(f => ({ ...f, published: !f.published }))} className={`relative w-12 h-6 rounded-full transition-all ${form.published ? "bg-[#39FF14]" : "bg-white/15"}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.published ? "left-7" : "left-1"}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/8">
                      <div><p className="font-semibold text-white text-sm">In Stock</p><p className="text-xs text-gray-500">Shows "In Stock" badge on product card</p></div>
                      <button onClick={() => setForm(f => ({ ...f, in_stock: !f.in_stock }))} className={`relative w-12 h-6 rounded-full transition-all ${form.in_stock ? "bg-[#39FF14]" : "bg-white/15"}`}>
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${form.in_stock ? "left-7" : "left-1"}`} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>


          </div>
        </div>
      </div>
      )}
      {/* Media source modal overlay */}
      <MediaSourceModal
        isOpen={mediaModalTarget !== null}
        onClose={() => setMediaModalTarget(null)}
        onSelect={handleMediaModalSelect}
        multiple={mediaModalTarget === "gallery"}
        acceptType={mediaModalTarget === "video" ? "video" : "image"}
      />
    </div>
  );
}

