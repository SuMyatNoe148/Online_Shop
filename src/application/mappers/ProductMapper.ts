import { Product } from "@/domain/product/Product";
import { Money } from "@/domain/shared/Money";
import { ProductDTO } from "../dto/ProductDTO";

/**
 * ProductMapper — translates between the domain entity and the DTO.
 * Keeps serialization concerns out of the entity.
 */
export const ProductMapper = {
  toDTO(product: Product): ProductDTO {
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      priceFormatted: Money.of(product.price, product.currency).format(),
      currency: product.currency,
      images: product.images,
      sizes: product.sizes,
      colors: product.colors,
      stock: product.stock,
      inStock: product.inStock,
      featured: product.featured,
      createdAt: product.createdAt.toISOString(),
    };
  },

  toDTOList(products: Product[]): ProductDTO[] {
    return products.map((p) => ProductMapper.toDTO(p));
  },
};
