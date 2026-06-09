import { Category } from "@/domain/shared/Category";

/**
 * ProductDTO — Data Transfer Object.
 * Plain serializable shape sent across the boundary (API -> UI).
 * No domain logic, no Date objects (ISO strings), safe for JSON.
 */
export interface ProductDTO {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: Category;
  price: number; // minor units (cents)
  priceFormatted: string;
  currency: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  inStock: boolean;
  featured: boolean;
  createdAt: string;
}

export interface CreateProductDTO {
  name: string;
  description: string;
  category: Category;
  price: number; // major units from the form (e.g. 49.99)
  currency?: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  featured?: boolean;
}

export type UpdateProductDTO = Partial<CreateProductDTO>;
