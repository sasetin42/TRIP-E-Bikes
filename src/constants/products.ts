import type { Product } from "@/types";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export let PRODUCTS: Product[] = [];

export const PRODUCT_CATEGORIES = [
  { id: "all", label: "All Models" },
  { id: "delivery", label: "Delivery" },
  { id: "folding", label: "Folding" },
  { id: "mountain", label: "Mountain" },
];

export const syncLiveProducts = async (): Promise<Product[]> => {
  try {
    const q = query(collection(db, "products_cms"), orderBy("created_at", "desc"));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const liveList = snapshot.docs
        .map((d) => {
          const p = d.data() as any;
          const cat = (p.category || "").toLowerCase();
          return {
            id: p.product_key || d.id,
            name: p.name || "",
            tagline: p.tagline || "",
            description: p.description || "",
            price: Number(p.price) || 0,
            category:
              cat.includes("cargo") || cat.includes("delivery")
                ? "delivery"
                : cat.includes("fold")
                ? "folding"
                : "mountain",
            image: p.primary_image_url || p.gallery_images?.[0] || "",
            badge: p.badge || null,
            brochureUrl: p.brochure_url || null,
            videoUrl: p.video_url || null,
            specs: {
              motor: p.specs?.motor || p.specs?.["Motor Power"] || "",
              battery: p.specs?.battery || p.specs?.["Battery specifications"] || "",
              range: p.specs?.range || p.specs?.["Range"] || "",
              topSpeed: p.specs?.topSpeed || p.specs?.top_speed || p.specs?.["Max Speed"] || "",
              payload: p.specs?.payload || p.specs?.["Load Capacity"] || "",
              weight: p.specs?.weight || p.specs?.["weight"] || "",
              ...(p.specs || {})
            },
            features: p.features || [],
            useCases: p.use_cases || p.useCases || [],
            colors: p.colors || [],
            inStock: p.in_stock !== undefined ? p.in_stock : true,
            published: p.published !== undefined ? p.published : true,
            galleryImages: p.gallery_images || [],
          } as any;
        })
        .filter((item) => item.published !== false);

      PRODUCTS.length = 0;
      liveList.forEach((item) => PRODUCTS.push(item as Product));
    }
  } catch (e) {
    console.error("Failed to sync live products:", e);
  }
  return PRODUCTS;
};
