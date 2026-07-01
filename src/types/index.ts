// Domain types — mirror the shape returned by the Spring Boot backend.
// Keep these in sync with backend DTOs. Fields marked optional are
// additive extensions; older mock records may not populate them.

export type Difficulty = "Beginner" | "Easy" | "Moderate" | "Expert";
export type SunlightLevel = "Low" | "Medium" | "Bright Indirect" | "Full Sun";
export type WaterLevel = "Low" | "Weekly" | "Frequent";
export type Badge =
  | "new"
  | "best-seller"
  | "low-stock"
  | "sale"
  | "trending"
  | "staff-pick"
  | "limited";
export type SmartCollection =
  | "new-arrivals"
  | "best-sellers"
  | "trending"
  | "featured"
  | "sale"
  | "staff-picks"
  | "limited-edition";

export type CategoryType =
  | "plants"
  | "pots"
  | "stands"
  | "watering"
  | "soil"
  | "fertilizers"
  | "tools"
  | "pest-control"
  | "decoration"
  | "seeds"
  | "propagation"
  | "gift"
  | "kits"
  | "pet-friendly"
  | "other";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  parentId?: string;
  type?: CategoryType;
  icon?: string;
  featured?: boolean;
}

// Legacy interface for older ProductCard code paths. Kept alive.
export interface CareInstructions {
  water: string;
  sunlight: SunlightLevel;
  temperature: string;
  difficulty: Difficulty;
}

export interface ProductSpecs {
  plantHeight?: string;
  potSize?: string;
  humidity?: string;
  temperature?: string;
  growthRate?: string;
  flowering?: boolean;
}

export interface ProductFAQ {
  q: string;
  a: string;
}

export type Room =
  | "bedroom"
  | "living-room"
  | "office"
  | "bathroom"
  | "balcony"
  | "kitchen";
export type LightTag = "low-light" | "medium-light" | "bright-light" | "direct-sun";
export type WaterTag = "daily" | "weekly" | "low-water";
export type Occasion =
  | "birthday"
  | "wedding"
  | "new-home"
  | "mothers-day"
  | "valentines-day"
  | "ramadan"
  | "eid";
export type Benefit =
  | "air-purifying"
  | "pet-friendly"
  | "fast-growing"
  | "low-maintenance"
  | "flowering"
  | "fragrant";

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  categoryId: string;
  categoryName: string;
  price: number;
  oldPrice?: number;
  discountPrice?: number;
  description: string;
  image: string;
  images?: string[]; // legacy alias for gallery
  gallery?: string[];
  stock: number;
  featured: boolean;
  badges: Badge[];
  rating: number;
  reviewsCount: number;
  care: CareInstructions;

  // Extended metadata
  specs?: ProductSpecs;
  faq?: ProductFAQ[];
  deliveryInfo?: string;
  returnPolicy?: string;
  careInstructions?: string;

  // Facet tags for Browse By + filters
  rooms?: Room[];
  lightTag?: LightTag;
  waterTag?: WaterTag;
  difficultyLevel?: Difficulty;
  indoorOutdoor?: "indoor" | "outdoor" | "both";
  petSafe?: boolean;
  airPurifying?: boolean;
  benefits?: Benefit[];
  occasions?: Occasion[];
  collections?: SmartCollection[];
  colors?: string[];
}

export interface Review {
  id: string;
  productId: string;
  userId?: string;
  userName: string;
  rating: number;
  title?: string;
  body: string;
  verified?: boolean;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Address {
  id?: string;
  label?: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  governorate?: string;
  postalCode?: string;
  isDefault?: boolean;
}

export interface Customer {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
}

export interface Coupon {
  code: string;
  type: "percent" | "fixed";
  value: number;
  minSubtotal?: number;
  expiresAt?: string;
  active: boolean;
  description?: string;
}

export interface Order {
  id?: string;
  customer: Customer;
  items: CartItem[];
  notes?: string;
  paymentMethod: "cod" | "card";
  deliveryMethod?: "standard" | "express";
  couponCode?: string;
  discount?: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status?: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  createdAt?: string;
}

export interface WishlistEntry {
  productId: string;
  addedAt: string;
}
