import type { Category, Order, Product, SmartCollection } from "@/types";
import { categories as mockCategories, products as mockProducts } from "@/data/mockData";

/**
 * API service layer.
 * All backend calls are isolated here. Swap the mock implementations
 * for real `fetch(API_BASE_URL + ...)` calls when the Spring Boot backend is ready.
 */
export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8080/api";

const delay = <T>(data: T, ms = 200): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

// ---------- Products ----------

export async function getProducts(): Promise<Product[]> {
  return delay(mockProducts);
}

export async function getProductById(id: string): Promise<Product | null> {
  const found =
    mockProducts.find((p) => p.id === id) ??
    mockProducts.find((p) => p.slug === id) ??
    null;
  return delay(found);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  return delay(mockProducts.filter((p) => p.featured).slice(0, limit));
}

export async function searchProducts(query: string): Promise<Product[]> {
  const q = query.toLowerCase().trim();
  if (!q) return delay(mockProducts);
  return delay(
    mockProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.categoryName.toLowerCase().includes(q),
    ),
  );
}

export async function filterProductsByCategory(categoryId: string): Promise<Product[]> {
  if (!categoryId || categoryId === "all") return delay(mockProducts);
  // Match product's category OR any descendant category if the id is a parent.
  const descendantIds = new Set<string>([categoryId]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const c of mockCategories) {
      if (c.parentId && descendantIds.has(c.parentId) && !descendantIds.has(c.id)) {
        descendantIds.add(c.id);
        changed = true;
      }
    }
  }
  return delay(mockProducts.filter((p) => descendantIds.has(p.categoryId)));
}

export async function getRelatedProducts(id: string, limit = 4): Promise<Product[]> {
  const product = mockProducts.find((p) => p.id === id);
  if (!product) return delay([]);
  return delay(
    mockProducts.filter((p) => p.categoryId === product.categoryId && p.id !== id).slice(0, limit),
  );
}

export async function getProductsByCollection(
  collection: SmartCollection,
  limit = 12,
): Promise<Product[]> {
  return delay(
    mockProducts.filter((p) => p.collections?.includes(collection)).slice(0, limit),
  );
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
  return delay(mockProducts.filter(match));
}

// ---------- Categories ----------

export async function getCategories(): Promise<Category[]> {
  return delay(mockCategories);
}

export async function getRootCategories(): Promise<Category[]> {
  return delay(mockCategories.filter((c) => !c.parentId));
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const s = slug.replace(/^\//, "");
  return delay(mockCategories.find((c) => c.slug === s) ?? null);
}

export async function getCategoryChildren(parentId: string): Promise<Category[]> {
  return delay(mockCategories.filter((c) => c.parentId === parentId));
}

// ---------- Orders ----------

export async function createOrder(order: Order): Promise<Order> {
  const stored: Order = {
    ...order,
    id: `ORD-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: "pending",
  };
  return delay(stored, 500);
}
