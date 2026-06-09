import { Product } from "@/domain/product/Product";
import {
  ProductQuery,
  ProductRepository,
} from "@/domain/product/ProductRepository";
import { Category } from "@/domain/shared/Category";
import { prisma } from "../db/prisma";

type Row = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  images: unknown;
  sizes: unknown;
  colors: unknown;
  stock: number;
  featured: boolean;
  createdAt: Date;
};

function toEntity(row: Row): Product {
  return new Product({
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    category: row.category as Category,
    price: row.price,
    currency: row.currency,
    images: (row.images as string[]) ?? [],
    sizes: (row.sizes as string[]) ?? [],
    colors: (row.colors as string[]) ?? [],
    stock: row.stock,
    featured: row.featured,
    createdAt: row.createdAt,
  });
}

export class PrismaProductRepository implements ProductRepository {
  async findAll(query?: ProductQuery): Promise<Product[]> {
    const rows = await prisma.product.findMany({
      where: {
        category: query?.category as any,
        featured: query?.featured,
        ...(query?.search
          ? {
              OR: [
                { name: { contains: query.search } },
                { description: { contains: query.search } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((r: unknown) => toEntity(r as Row));
  }

  async findBySlug(slug: string): Promise<Product | null> {
    const row = await prisma.product.findUnique({ where: { slug } });
    return row ? toEntity(row as unknown as Row) : null;
  }

  async findById(id: string): Promise<Product | null> {
    const row = await prisma.product.findUnique({ where: { id } });
    return row ? toEntity(row as unknown as Row) : null;
  }

  async create(product: Product): Promise<Product> {
    const p = product.toJSON();
    const row = await prisma.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        category: p.category as any,
        price: p.price,
        currency: p.currency,
        images: p.images,
        sizes: p.sizes,
        colors: p.colors,
        stock: p.stock,
        featured: p.featured,
      },
    });
    return toEntity(row as unknown as Row);
  }

  async update(id: string, product: Product): Promise<Product> {
    const p = product.toJSON();
    const row = await prisma.product.update({
      where: { id },
      data: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        category: p.category as any,
        price: p.price,
        currency: p.currency,
        images: p.images,
        sizes: p.sizes,
        colors: p.colors,
        stock: p.stock,
        featured: p.featured,
      },
    });
    return toEntity(row as unknown as Row);
  }

  async delete(id: string): Promise<void> {
    await prisma.product.delete({ where: { id } });
  }
}
