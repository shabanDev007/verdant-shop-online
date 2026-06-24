// Domain types — mirror the shape returned by the Spring Boot backend.
// Keep these in sync with backend DTOs.

export type Difficulty = "Easy" | "Moderate" | "Expert";
export type Sunlight = "Low" | "Medium" | "Bright Indirect" | "Full Sun";
export type Badge = "new" | "best-seller" | "low-stock";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

export interface CareInstructions {
  water: string;
  sunlight: Sunlight;
  temperature: string;
  difficulty: Difficulty;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  price: number;
  oldPrice?: number;
  description: string;
  image: string;
  images?: string[];
  stock: number;
  featured: boolean;
  badges: Badge[];
  rating: number;
  reviewsCount: number;
  care: CareInstructions;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Customer {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
}

export interface Order {
  id?: string;
  customer: Customer;
  items: CartItem[];
  notes?: string;
  paymentMethod: "cod";
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt?: string;
}
