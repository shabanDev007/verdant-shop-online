import type { Category, Order, Product } from "@/types";
import { categories as mockCategories, products as mockProducts } from "@/data/mockData";

/**
 * API service layer.
 * All backend calls are isolated here. Swap the mock implementations
 * for real `fetch(API_BASE_URL + ...)` calls when the Spring Boot backend is ready.
 */
export const API_BASE_URL = "http://localhost:8080/api";

// Simulate small network latency for realistic loading states.
const delay = <T>(data: T, ms = 250): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

// ---------- Products ----------

/** GET /api/products */
export async function getProducts(): Promise<Product[]> {
  // BACKEND: return fetch(`${API_BASE_URL}/products`).then(r => r.json());
  return delay(mockProducts);
}

/** GET /api/products/{id} */
export async function getProductById(id: string): Promise<Product | null> {
  // BACKEND: return fetch(`${API_BASE_URL}/products/${id}`).then(r => r.json());
  const found = mockProducts.find((p) => p.id === id || p.slug === id) ?? null;
  return delay(found);
}

/** GET /api/products/featured */
export async function getFeaturedProducts(): Promise<Product[]> {
  // BACKEND: return fetch(`${API_BASE_URL}/products/featured`).then(r => r.json());
  return delay(mockProducts.filter((p) => p.featured));
}

/** GET /api/products?search= */
export async function searchProducts(query: string): Promise<Product[]> {
  // BACKEND: return fetch(`${API_BASE_URL}/products?search=${encodeURIComponent(query)}`).then(r => r.json());
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

/** GET /api/products?categoryId= */
export async function filterProductsByCategory(categoryId: string): Promise<Product[]> {
  // BACKEND: return fetch(`${API_BASE_URL}/products?categoryId=${categoryId}`).then(r => r.json());
  if (!categoryId || categoryId === "all") return delay(mockProducts);
  return delay(mockProducts.filter((p) => p.categoryId === categoryId));
}

/** GET /api/products/{id}/related */
export async function getRelatedProducts(id: string): Promise<Product[]> {
  const product = mockProducts.find((p) => p.id === id);
  if (!product) return delay([]);
  return delay(
    mockProducts.filter((p) => p.categoryId === product.categoryId && p.id !== id).slice(0, 4),
  );
}

// ---------- Categories ----------

/** GET /api/categories */
export async function getCategories(): Promise<Category[]> {
  // BACKEND: return fetch(`${API_BASE_URL}/categories`).then(r => r.json());
  return delay(mockCategories);
}

// ---------- Orders ----------

/** POST /api/orders */
export async function createOrder(order: Order): Promise<Order> {
  // BACKEND:
  // return fetch(`${API_BASE_URL}/orders`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(order),
  // }).then(r => r.json());
  const stored: Order = {
    ...order,
    id: `ORD-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  return delay(stored, 600);
}
