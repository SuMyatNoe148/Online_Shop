import { Product } from "@/domain/product/Product";
import {
  ProductRepository,
  ProductQuery,
} from "@/domain/product/ProductRepository";
import {
  CreateProductDTO,
  ProductDTO,
  UpdateProductDTO,
} from "../dto/ProductDTO";
import { ProductMapper } from "../mappers/ProductMapper";
import { slugify } from "@/lib/slugify";
import { createId } from "@/lib/id";

/**
 * ProductService — application service (use cases).
 * Orchestrates the domain + repository. Returns DTOs to the outside world.
 */
export class ProductService {
  constructor(private readonly repo: ProductRepository) {}

  async list(query?: ProductQuery): Promise<ProductDTO[]> {
    const products = await this.repo.findAll(query);
    return ProductMapper.toDTOList(products);
  }

  async getBySlug(slug: string): Promise<ProductDTO | null> {
    const product = await this.repo.findBySlug(slug);
    return product ? ProductMapper.toDTO(product) : null;
  }

  async getById(id: string): Promise<ProductDTO | null> {
    const product = await this.repo.findById(id);
    return product ? ProductMapper.toDTO(product) : null;
  }

  async create(dto: CreateProductDTO): Promise<ProductDTO> {
    const product = new Product({
      id: createId(),
      slug: slugify(dto.name),
      name: dto.name,
      description: dto.description,
      category: dto.category,
      price: Math.round(dto.price * 100),
      currency: dto.currency ?? "USD",
      images: dto.images,
      sizes: dto.sizes,
      colors: dto.colors,
      stock: dto.stock,
      featured: dto.featured ?? false,
      createdAt: new Date(),
    });
    const saved = await this.repo.create(product);
    return ProductMapper.toDTO(saved);
  }

  async update(id: string, dto: UpdateProductDTO): Promise<ProductDTO> {
    const existing = await this.repo.findById(id);
    if (!existing) throw new Error("Product not found.");

    const current = existing.toJSON();
    const updated = new Product({
      ...current,
      name: dto.name ?? current.name,
      slug: dto.name ? slugify(dto.name) : current.slug,
      description: dto.description ?? current.description,
      category: dto.category ?? current.category,
      price: dto.price !== undefined ? Math.round(dto.price * 100) : current.price,
      currency: dto.currency ?? current.currency,
      images: dto.images ?? current.images,
      sizes: dto.sizes ?? current.sizes,
      colors: dto.colors ?? current.colors,
      stock: dto.stock ?? current.stock,
      featured: dto.featured ?? current.featured,
    });

    const saved = await this.repo.update(id, updated);
    return ProductMapper.toDTO(saved);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
