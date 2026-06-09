import { ProductService } from "@/application/services/ProductService";
import { ModelService } from "@/application/services/ModelService";
import { OrderService } from "@/application/services/OrderService";

import { ProductRepository } from "@/domain/product/ProductRepository";
import { ModelRepository } from "@/domain/model/ModelRepository";
import { OrderRepository } from "@/domain/order/OrderRepository";

import { InMemoryProductRepository } from "./repositories/InMemoryProductRepository";
import { InMemoryModelRepository } from "./repositories/InMemoryModelRepository";
import { InMemoryOrderRepository } from "./repositories/InMemoryOrderRepository";

/**
 * Composition root (Dependency Injection container).
 * Picks the data adapter from DATA_SOURCE. Prisma is lazy-required so the app
 * runs with zero database setup when DATA_SOURCE="memory" (the default).
 *
 * PHP analogy: this is your service container / bindings file.
 */
interface Services {
  productService: ProductService;
  modelService: ModelService;
  orderService: OrderService;
}

let cached: Services | null = null;

function buildRepositories(): {
  product: ProductRepository;
  model: ModelRepository;
  order: OrderRepository;
} {
  const usePrisma = process.env.DATA_SOURCE === "prisma";

  if (usePrisma) {
    // Lazy require so @prisma/client is only loaded when actually used.
    const {
      PrismaProductRepository,
    } = require("./repositories/PrismaProductRepository");
    const {
      PrismaModelRepository,
    } = require("./repositories/PrismaModelRepository");
    const {
      PrismaOrderRepository,
    } = require("./repositories/PrismaOrderRepository");

    return {
      product: new PrismaProductRepository(),
      model: new PrismaModelRepository(),
      order: new PrismaOrderRepository(),
    };
  }

  return {
    product: new InMemoryProductRepository(),
    model: new InMemoryModelRepository(),
    order: new InMemoryOrderRepository(),
  };
}

export function getServices(): Services {
  if (cached) return cached;

  const repos = buildRepositories();
  cached = {
    productService: new ProductService(repos.product),
    modelService: new ModelService(repos.model),
    orderService: new OrderService(repos.order, repos.product),
  };
  return cached;
}
