import type {
  Category,
  Coupon,
  Order,
  PlantPotCombination,
  PortfolioProject,
  Product,
  ProjectRequestInput,
  Review,
  SmartCollection,
} from "@/types";
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
  specs: Record<string, unknown> | null;
  care_instructions_en: string | null;
  care_instructions_ar: string | null;
  delivery_info_en: string | null;
  delivery_info_ar: string | null;
  return_policy_en: string | null;
  return_policy_ar: string | null;
  product_type: "plant" | "pot" | "other" | null;
  size_code: "S" | "M" | "L" | null;
  builder_image_url: string | null;
  builder_scale: number | null;
  builder_offset_x: number | null;
  builder_offset_y: number | null;
};

type SupabaseProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  is_primary: boolean;
};

type SupabaseProductFaq = {
  question_en: string;
  question_ar: string | null;
  answer_en: string;
  answer_ar: string | null;
  sort_order: number;
};

type SupabaseReview = {
  id: string;
  product_id: string;
  customer_name: string;
  rating: number;
  title: string | null;
  body: string;
  verified: boolean;
  created_at: string;
};

type SupabaseCombination = {
  id: string;
  plant_id: string;
  pot_id: string;
  preview_image_url: string;
  name_en: string | null;
  name_ar: string | null;
  description_en: string | null;
  description_ar: string | null;
  total_price?: number | null;
  show_in_catalog?: boolean;
  sort_order: number;
};

type SupabasePortfolioProject = {
  id: string;
  title_en: string;
  title_ar: string | null;
  description_en: string | null;
  description_ar: string | null;
  project_type: ProjectRequestInput["projectType"];
  location_en: string | null;
  location_ar: string | null;
  completed_at: string | null;
};

type SupabasePortfolioImage = {
  project_id: string;
  image_url: string;
  sort_order: number;
  is_cover: boolean;
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
  reviewStats: Map<string, { rating: number; count: number }> = new Map(),
): Product => {
  const category = row.category_id ? categoriesById.get(row.category_id) : undefined;
  const orderedImages = productImages
    .filter((image) => image.product_id === row.id)
    .sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || a.sort_order - b.sort_order);
  const explicitPrimary = orderedImages.find(
    (image) => image.is_primary && image.image_url !== "/placeholder.svg",
  )?.image_url;
  const preferredImage =
    explicitPrimary ??
    (row.image_url && row.image_url !== "/placeholder.svg" ? row.image_url : undefined) ??
    orderedImages[0]?.image_url;
  let gallery = [preferredImage, row.image_url, ...orderedImages.map((image) => image.image_url)].filter(
    (image, index, images): image is string => !!image && images.indexOf(image) === index,
  );
  // Seeds may temporarily add /placeholder.svg before a real product image is
  // uploaded. Never show that placeholder as a second gallery image once any
  // real image exists.
  if (gallery.some((image) => image !== "/placeholder.svg")) {
    gallery = gallery.filter((image) => image !== "/placeholder.svg");
  }
  if (!gallery.length) gallery.push("/placeholder.svg");
  const specs = row.specs ?? {};
  const stat = reviewStats.get(row.id);
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
    rating: stat?.rating ?? 0,
    reviewsCount: stat?.count ?? 0,
    care: {
      water: "Weekly",
      sunlight: "Bright Indirect",
      temperature: "18–28°C",
      difficulty: "Beginner",
    },
    specs: {
      plantHeight: typeof specs.plantHeight === "string" ? specs.plantHeight : undefined,
      potSize: typeof specs.potSize === "string" ? specs.potSize : undefined,
      humidity: typeof specs.humidity === "string" ? specs.humidity : undefined,
      temperature: typeof specs.temperature === "string" ? specs.temperature : undefined,
      growthRate: typeof specs.growthRate === "string" ? specs.growthRate : undefined,
    },
    petSafe: typeof specs.petSafe === "boolean" ? specs.petSafe : undefined,
    airPurifying: typeof specs.airPurifying === "boolean" ? specs.airPurifying : undefined,
    indoorOutdoor:
      specs.indoorOutdoor === "indoor" ||
      specs.indoorOutdoor === "outdoor" ||
      specs.indoorOutdoor === "both"
        ? specs.indoorOutdoor
        : undefined,
    careInstructions: row.care_instructions_en ?? undefined,
    careInstructionsAr: row.care_instructions_ar ?? undefined,
    deliveryInfo: row.delivery_info_en ?? undefined,
    deliveryInfoAr: row.delivery_info_ar ?? undefined,
    returnPolicy: row.return_policy_en ?? undefined,
    returnPolicyAr: row.return_policy_ar ?? undefined,
    productType: row.product_type ?? "other",
    sizeCode: row.size_code ?? undefined,
    builderImage: row.builder_image_url ?? undefined,
    builderScale: row.builder_scale == null ? 1 : Number(row.builder_scale),
    builderOffsetX: row.builder_offset_x == null ? 0 : Number(row.builder_offset_x),
    builderOffsetY: row.builder_offset_y == null ? 0 : Number(row.builder_offset_y),
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

// Mock catalog data must be explicitly enabled. Keeping it opt-in prevents
// missing, malformed, or cached environment values from exposing demo items.
const useMockData =
  String(import.meta.env.VITE_USE_MOCK_DATA ?? "")
    .trim()
    .toLowerCase() === "true";

/**
 * Normalise Arabic/English search text so common Arabic spelling variants and
 * optional diacritics do not prevent a match.
 */
export const normalizeSearchText = (value: string | null | undefined) =>
  (value ?? "")
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0640\u064b-\u065f\u0670\u06d6-\u06ed]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s+/g, " ")
    .trim();

export const productMatchesSearch = (product: Product, query: string) => {
  const normalisedQuery = normalizeSearchText(query);
  if (!normalisedQuery) return true;
  return [
    product.name,
    product.nameAr,
    product.description,
    product.descriptionAr,
    product.categoryName,
    product.categoryNameAr,
    product.sku,
    product.slug,
  ].some((value) => normalizeSearchText(value).includes(normalisedQuery));
};

// ---------- Products ----------

export async function getProducts(): Promise<Product[]> {
  if (supabase) {
    const [productsResult, categoriesResult, imagesResult, reviewsResult] = await Promise.all([
      supabase.from("products").select("*").eq("active", true),
      supabase.from("categories").select("*").eq("active", true),
      supabase.from("product_images").select("id,product_id,image_url,sort_order,is_primary"),
      supabase.from("product_reviews").select("product_id,rating").eq("approved", true),
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
      const reviewAccumulator = new Map<string, { sum: number; count: number }>();
      if (!reviewsResult.error) {
        for (const review of reviewsResult.data ?? []) {
          const current = reviewAccumulator.get(review.product_id) ?? { sum: 0, count: 0 };
          current.sum += Number(review.rating);
          current.count += 1;
          reviewAccumulator.set(review.product_id, current);
        }
      }
      const reviewStats = new Map(
        [...reviewAccumulator].map(([productId, value]) => [
          productId,
          { rating: Math.round((value.sum / value.count) * 10) / 10, count: value.count },
        ]),
      );
      const remote = (productsResult.data as SupabaseProduct[]).map((row) =>
        mapProduct(row, categoriesById, productImages, reviewStats),
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
  if (!found || !supabase || !found.id.includes("-")) return delay(found);
  const { data, error } = await supabase
    .from("product_faqs")
    .select("question_en,question_ar,answer_en,answer_ar,sort_order")
    .eq("product_id", found.id)
    .order("sort_order");
  if (error) return found;
  return {
    ...found,
    faq: ((data ?? []) as SupabaseProductFaq[]).map((faq) => ({
      q: faq.question_en,
      qAr: faq.question_ar ?? undefined,
      a: faq.answer_en,
      aAr: faq.answer_ar ?? undefined,
    })),
  };
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.featured).slice(0, limit);
}

export async function searchProducts(query: string): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((product) => productMatchesSearch(product, query));
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
  if (supabase && productId.includes("-")) {
    const { data, error } = await supabase
      .from("product_reviews")
      .select("id,product_id,customer_name,rating,title,body,verified,created_at")
      .eq("product_id", productId)
      .eq("approved", true)
      .order("created_at", { ascending: false });
    if (!error) {
      return ((data ?? []) as SupabaseReview[]).map((review) => ({
        id: review.id,
        productId: review.product_id,
        userName: review.customer_name,
        rating: review.rating,
        title: review.title ?? undefined,
        body: review.body,
        verified: review.verified,
        createdAt: review.created_at,
      }));
    }
  }
  return useMockData ? delay(_getReviewsForProduct(productId)) : [];
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  const products = await getProducts();
  const set = new Set(ids);
  const map = new Map(products.map((p) => [p.id, p]));
  return ids.map((id) => map.get(id)).filter((p): p is Product => !!p && set.has(p.id));
}

export async function getPlantPotCombinations(plantId: string): Promise<PlantPotCombination[]> {
  if (!supabase) return [];
  const [{ data, error }, products] = await Promise.all([
    supabase
      .from("plant_pot_combinations")
      .select(
        "id,plant_id,pot_id,preview_image_url,name_en,name_ar,description_en,description_ar,total_price,sort_order",
      )
      .eq("plant_id", plantId)
      .eq("active", true)
      .order("sort_order"),
    getProducts(),
  ]);
  if (error) return [];
  const productsById = new Map(products.map((product) => [product.id, product]));
  return ((data ?? []) as SupabaseCombination[]).flatMap((row) => {
    const plant = productsById.get(row.plant_id);
    const pot = productsById.get(row.pot_id);
    if (!plant || !pot) return [];
    const combination: PlantPotCombination = {
      id: row.id,
      plant,
      pot,
      previewImage: row.preview_image_url,
      name: row.name_en ?? undefined,
      nameAr: row.name_ar ?? undefined,
      description: row.description_en ?? undefined,
      descriptionAr: row.description_ar ?? undefined,
      totalPrice: row.total_price == null ? undefined : Number(row.total_price),
      sortOrder: row.sort_order,
    };
    return [combination];
  });
}

export async function getCatalogPlantPotCombinations(): Promise<PlantPotCombination[]> {
  if (!supabase) return [];
  const [{ data, error }, products] = await Promise.all([
    supabase
      .from("plant_pot_combinations")
      .select(
        "id,plant_id,pot_id,preview_image_url,name_en,name_ar,description_en,description_ar,total_price,sort_order",
      )
      .eq("active", true)
      .eq("show_in_catalog", true)
      .not("total_price", "is", null)
      .order("sort_order"),
    getProducts(),
  ]);
  if (error) return [];
  const productsById = new Map(products.map((product) => [product.id, product]));
  return ((data ?? []) as SupabaseCombination[]).flatMap((row) => {
    const plant = productsById.get(row.plant_id);
    const pot = productsById.get(row.pot_id);
    if (!plant || !pot || plant.stock <= 0 || pot.stock <= 0 || row.total_price == null) return [];
    return [
      {
        id: row.id,
        plant,
        pot,
        previewImage: row.preview_image_url,
        name: row.name_en ?? undefined,
        nameAr: row.name_ar ?? undefined,
        description: row.description_en ?? undefined,
        descriptionAr: row.description_ar ?? undefined,
        totalPrice: Number(row.total_price),
        sortOrder: row.sort_order,
      },
    ];
  });
}

export async function submitProjectRequest(
  request: ProjectRequestInput,
  files: File[],
): Promise<{ requestNumber: string; emailSent: boolean }> {
  if (!supabase) throw new Error("Supabase is not configured");
  const formData = new FormData();
  formData.set("request", JSON.stringify(request));
  files.forEach((file) => formData.append("images", file));
  const { data, error } = await supabase.functions.invoke("create-project-request", {
    body: formData,
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error as string);
  return data as { requestNumber: string; emailSent: boolean };
}

export async function getPortfolioProjects(): Promise<PortfolioProject[]> {
  if (!supabase) return [];
  const [projectsResult, imagesResult] = await Promise.all([
    supabase
      .from("project_portfolio")
      .select(
        "id,title_en,title_ar,description_en,description_ar,project_type,location_en,location_ar,completed_at",
      )
      .eq("active", true)
      .order("sort_order"),
    supabase.from("project_portfolio_images").select("project_id,image_url,sort_order,is_cover"),
  ]);
  if (projectsResult.error || imagesResult.error) return [];
  const images = (imagesResult.data ?? []) as SupabasePortfolioImage[];
  return ((projectsResult.data ?? []) as SupabasePortfolioProject[]).map((project) => ({
    id: project.id,
    title: project.title_en,
    titleAr: project.title_ar ?? undefined,
    description: project.description_en ?? "",
    descriptionAr: project.description_ar ?? undefined,
    projectType: project.project_type,
    location: project.location_en ?? undefined,
    locationAr: project.location_ar ?? undefined,
    completedAt: project.completed_at ?? undefined,
    images: images
      .filter((image) => image.project_id === project.id)
      .sort((a, b) => Number(b.is_cover) - Number(a.is_cover) || a.sort_order - b.sort_order)
      .map((image) => image.image_url),
  }));
}

export async function getPortfolioProject(id: string): Promise<PortfolioProject | null> {
  const projects = await getPortfolioProjects();
  return projects.find((project) => project.id === id) ?? null;
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
          combinationId: item.combinationId,
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
