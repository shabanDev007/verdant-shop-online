import type { Category, Coupon, Order, Product, Review, SmartCollection } from "@/types";
import { categories as mockCategories, products as mockProducts } from "@/data/mockData";
import {
  getReviewsForProduct as _getReviewsForProduct,
  validateCoupon as validateLocalCoupon,
} from "@/data/reviewsCoupons";
import { supabase } from "@/lib/supabase";

type SupabaseCategory = {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
  parent_id: string | null;
  image_url: string | null;
  active: boolean;
};

type SupabaseProduct = {
  id: string;
  category_id: string | null;
  slug: string;
  sku: string | null;
  name_en: string;
  name_ar: string;
  description_en: string | null;
  description_ar: string | null;
  price: number;
  old_price: number | null;
  stock: number;
  image_url: string | null;
  featured: boolean;
  active: boolean;
};

type SupabaseProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  is_primary: boolean;
};

const mergeBySlug = <T extends { slug: string }>(fallback: T[], remote: T[]) => {
  const remoteSlugs = new Set(remote.map((item) => item.slug));
  return [...remote, ...fallback.filter((item) => !remoteSlugs.has(item.slug))];
};

const mapCategory = (row: SupabaseCategory): Category => ({
  id: row.id,
  slug: row.slug,
  name: row.name_en,
  nameAr: row.name_ar,
  description: row.description_en ?? "",
  descriptionAr: row.description_ar ?? "",
  parentId: row.parent_id ?? undefined,
  image: row.image_url ?? "/placeholder.svg",
});

const mapProduct = (
  row: SupabaseProduct,
  categoriesById: Map<string, SupabaseCategory>,
  productImages: SupabaseProductImage[] = [],
): Product => {
  const category = row.category_id ? categoriesById.get(row.category_id) : undefined;
  const gallery = productImages
    .filter((image) => image.product_id === row.id)
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order)
    .map((image) => image.image_url);
  if (row.image_url && !gallery.includes(row.image_url)) gallery.push(row.image_url);
  if (!gallery.length) gallery.push("/placeholder.svg");
  return {
    id: row.id,
    slug: row.slug,
    sku: row.sku ?? undefined,
    name: row.name_en,
    nameAr: row.name_ar,
    description: row.description_en ?? "",
    descriptionAr: row.description_ar ?? "",
    categoryId: row.category_id ?? "uncategorized",
    categoryName: category?.name_en ?? "Uncategorized",
    categoryNameAr: category?.name_ar ?? "غير مصنف",
    price: Number(row.price),
    oldPrice: row.old_price == null ? undefined : Number(row.old_price),
    image: gallery[0],
    gallery,
    stock: row.stock,
    featured: row.featured,
    badges: row.featured ? ["staff-pick"] : [],
    rating: 0,
    reviewsCount: 0,
    care: {
      water: "Weekly",
      sunlight: "Bright Indirect",
      temperature: "18–28°C",
      difficulty: "Beginner",
    },
  };
};

/**
 * API service layer.
 * All backend calls are isolated here. Swap the mock implementations
 * for real `fetch(API_BASE_URL + ...)` calls when the Spring Boot backend is ready.
 */
export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8080/api";

const delay = <T>(data: T, ms = 200): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

const useMockData = import.meta.env.VITE_USE_MOCK_DATA !== "false";

// ---------- Products ----------

export async function getProducts(): Promise<Product[]> {
  if (supabase) {
    const [productsResult, categoriesResult, imagesResult] = await Promise.all([
      supabase.from("products").select("*").eq("active", true),
      supabase.from("categories").select("*").eq("active", true),
      supabase.from("product_images").select("id,product_id,image_url,sort_order,is_primary"),
    ]);
    if (!productsResult.error) {
      const categoryRows = (categoriesResult.data ?? []) as SupabaseCategory[];
      const categoriesById = new Map(categoryRows.map((category) => [category.id, category]));
      const productImages = imagesResult.error
        ? []
        : ((imagesResult.data ?? []) as SupabaseProductImage[]);
      if (imagesResult.error) {
        console.warn("Could not load product gallery images:", imagesResult.error.message);
      }
      const remote = (productsResult.data as SupabaseProduct[]).map((row) =>
        mapProduct(row, categoriesById, productImages),
      );
      return useMockData ? mergeBySlug(mockProducts, remote) : remote;
    }
    console.error("Could not load Supabase products:", productsResult.error.message);
  }
  return delay(useMockData ? mockProducts : []);
}

export async function getProductById(id: string): Promise<Product | null> {
  const products = await getProducts();
  const found = products.find((p) => p.id === id) ?? products.find((p) => p.slug === id) ?? null;
  return delay(found);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.featured).slice(0, limit);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const products = await getProducts();
  const q = query.toLowerCase().trim();
  if (!q) return products;
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q),
  );
}

export async function filterProductsByCategory(categoryId: string): Promise<Product[]> {
  const [products, allCategories] = await Promise.all([getProducts(), getCategories()]);
  if (!categoryId || categoryId === "all") return products;
  // Match product's category OR any descendant category if the id is a parent.
  const descendantIds = new Set<string>([categoryId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const c of allCategories) {
      if (c.parentId && descendantIds.has(c.parentId) && !descendantIds.has(c.id)) {
        descendantIds.add(c.id);
        changed = true;
      }
    }
  }
  return products.filter((p) => descendantIds.has(p.categoryId));
}

export async function getRelatedProducts(id: string, limit = 4): Promise<Product[]> {
  const products = await getProducts();
  const product = products.find((p) => p.id === id);
  if (!product) return [];
  return products.filter((p) => p.categoryId === product.categoryId && p.id !== id).slice(0, limit);
}

export async function getProductsByCollection(
  collection: SmartCollection,
  limit = 12,
): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.collections?.includes(collection)).slice(0, limit);
}

export async function getProductsByFacet(
  facet: "room" | "light" | "water" | "difficulty" | "benefit" | "occasion",
  value: string,
): Promise<Product[]> {
  const match = (p: Product): boolean => {
    switch (facet) {
      case "room":
        return !!p.rooms?.includes(value as never);
      case "light":
        return p.lightTag === value;
      case "water":
        return p.waterTag === value;
      case "difficulty":
        return p.difficultyLevel === (value as never);
      case "benefit":
        return !!p.benefits?.includes(value as never);
      case "occasion":
        return !!p.occasions?.includes(value as never);
    }
  };
  const products = await getProducts();
  return products.filter(match);
}

// ---------- Categories ----------

export async function getCategories(): Promise<Category[]> {
  if (supabase) {
    const { data, error } = await supabase.from("categories").select("*").eq("active", true);
    if (!error) {
      const remote = (data as SupabaseCategory[]).map(mapCategory);
      return useMockData ? mergeBySlug(mockCategories, remote) : remote;
    }
    console.error("Could not load Supabase categories:", error.message);
  }
  return delay(useMockData ? mockCategories : []);
}

export async function getRootCategories(): Promise<Category[]> {
  const categories = await getCategories();
  return categories.filter((c) => !c.parentId);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const s = slug.replace(/^\//, "");
  const categories = await getCategories();
  return categories.find((c) => c.slug === s) ?? null;
}

export async function getCategoryChildren(parentId: string): Promise<Category[]> {
  const categories = await getCategories();
  return categories.filter((c) => c.parentId === parentId);
}

// ---------- Reviews ----------

export async function getReviews(productId: string): Promise<Review[]> {
  return delay(_getReviewsForProduct(productId));
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  const products = await getProducts();
  const set = new Set(ids);
  const map = new Map(products.map((p) => [p.id, p]));
  return ids.map((id) => map.get(id)).filter((p): p is Product => !!p && set.has(p.id));
}

// ---------- Orders ----------

export async function createOrder(order: Order): Promise<Order> {
  const liveOrdersEnabled = import.meta.env.VITE_ENABLE_LIVE_ORDERS === "true";
  if (liveOrdersEnabled) {
    if (!supabase) throw new Error("Supabase is not configured");
    const { data, error } = await supabase.functions.invoke("create-order", {
      body: {
        customer: order.customer,
        items: order.items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        notes: order.notes,
        couponCode: order.couponCode,
      },
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error as string);
    return {
      ...order,
      id: data.orderNumber ? `ORD-${data.orderNumber}` : data.id,
      subtotal: data.subtotal,
      deliveryFee: data.deliveryFee,
      total: data.total,
      discount: data.discount,
      couponCode: data.couponCode,
      createdAt: data.createdAt,
      status: "pending",
    };
  }

  const stored: Order = {
    ...order,
    id: `ORD-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  return delay(stored, 500);
}

export async function validateCoupon(
  code: string,
  subtotal: number,
): Promise<{ coupon: Coupon; discount: number; deliveryDiscount: number }> {
  if (import.meta.env.VITE_ENABLE_LIVE_ORDERS !== "true") {
    const result = validateLocalCoupon(code, subtotal);
    if (!result.ok) throw new Error(result.reason);
    return { coupon: result.coupon, discount: result.discount, deliveryDiscount: 0 };
  }
  if (!supabase) throw new Error("Supabase is not configured");
  const { data, error } = await supabase.functions.invoke("validate-coupon", {
    body: { code, subtotal },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error as string);
  return data as { coupon: Coupon; discount: number; deliveryDiscount: number };
}
