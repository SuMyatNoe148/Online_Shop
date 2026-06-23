import { Product } from "./Product";
import { Category } from "../shared/Category";

export type ProductSort = "created_at_desc" | "price_asc" | "price_desc" | "name_asc";

export interface ProductQuery {
  category?: Category;
  featured?: boolean;
  search?: string;
  sort?: ProductSort;
}

/**
 * ProductRepository — domain "port" (interface).
 * Infrastructure provides adapters (in-memory, Prisma/MySQL).
 * Think of this like a PHP repository interface that a concrete class implements.
 */
export interface ProductRepository {
  findAll(query?: ProductQuery): Promise<Product[]>;
  findBySlug(slug: string): Promise<Product | null>;
  findById(id: string): Promise<Product | null>;
  create(product: Product): Promise<Product>;
  update(id: string, product: Product): Promise<Product>;
  delete(id: string): Promise<void>;
}
