import { getServices } from "@/infrastructure/container";
import { isCategory } from "@/domain/shared/Category";
import { CreateProductDTO, UpdateProductDTO } from "@/application/dto/ProductDTO";

/**
 * ProductController — the "C" in MVC.
 * Validates input, delegates to the application service, returns plain results.
 * API route handlers (and server components) call into these methods.
 */
export const ProductController = {
  async index(params: {
    category?: string | null;
    featured?: string | null;
    search?: string | null;
  }) {
    const { productService } = getServices();
    return productService.list({
      category:
        params.category && isCategory(params.category)
          ? params.category
          : undefined,
      featured:
        params.featured == null ? undefined : params.featured === "true",
      search: params.search || undefined,
    });
  },

  async show(slug: string) {
    const { productService } = getServices();
    return productService.getBySlug(slug);
  },

  async create(body: CreateProductDTO) {
    this.assertValid(body);
    const { productService } = getServices();
    return productService.create(body);
  },

  async update(id: string, body: UpdateProductDTO) {
    const { productService } = getServices();
    return productService.update(id, body);
  },

  async destroy(id: string) {
    const { productService } = getServices();
    await productService.remove(id);
    return { success: true };
  },

  assertValid(body: CreateProductDTO) {
    if (!body?.name?.trim()) throw new Error("Name is required.");
    if (!isCategory(body.category)) throw new Error("Invalid category.");
    if (typeof body.price !== "number" || body.price < 0)
      throw new Error("Price must be a positive number.");
  },
};
