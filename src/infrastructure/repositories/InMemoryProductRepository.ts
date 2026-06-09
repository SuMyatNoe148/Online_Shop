import { Product } from "@/domain/product/Product";
import {
  ProductQuery,
  ProductRepository,
} from "@/domain/product/ProductRepository";
import { SAMPLE_PRODUCTS } from "../data/sampleData";

/**
 * InMemoryProductRepository — adapter used when DATA_SOURCE="memory".
 * Lets the whole app run with zero database setup.
 * A module-level store keeps data alive across requests during dev.
 */
const store: Map<string, Product> = new Map(
  SAMPLE_PRODUCTS.map((p) => [p.id, new Product({ ...p })]),
);

export class InMemoryProductRepository implements ProductRepository {
  async findAll(query?: ProductQuery): Promise<Product[]> {
    let items = Array.from(store.values());

    if (query?.category) {
      items = items.filter((p) => p.category === query.category);
    }
    if (query?.featured !== undefined) {
      items = items.filter((p) => p.featured === query.featured);
    }
    if (query?.search) {
      const q = query.search.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }
    return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return (
      Array.from(store.values()).find((p) => p.slug === slug) ?? null
    );
  }

  async findById(id: string): Promise<Product | null> {
    return store.get(id) ?? null;
  }

  async create(product: Product): Promise<Product> {
    store.set(product.id, product);
    return product;
  }

  async update(id: string, product: Product): Promise<Product> {
    store.set(id, product);
    return product;
  }

  async delete(id: string): Promise<void> {
    store.delete(id);
  }
}
