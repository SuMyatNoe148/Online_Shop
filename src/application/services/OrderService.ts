import { Order, OrderItemProps, OrderStatus } from "@/domain/order/Order";
import { OrderRepository } from "@/domain/order/OrderRepository";
import { ProductRepository } from "@/domain/product/ProductRepository";
import { CreateOrderDTO, OrderDTO } from "../dto/OrderDTO";
import { OrderMapper } from "../mappers/OrderMapper";
import { createId } from "@/lib/id";

/**
 * OrderService — checkout use case.
 * Validates products + stock, computes the total from authoritative prices
 * (never trusts the client price), then persists the order.
 */
export class OrderService {
  constructor(
    private readonly orders: OrderRepository,
    private readonly products: ProductRepository,
  ) {}

  async list(): Promise<OrderDTO[]> {
    return OrderMapper.toDTOList(await this.orders.findAll());
  }

  async getById(id: string): Promise<OrderDTO | null> {
    const order = await this.orders.findById(id);
    return order ? OrderMapper.toDTO(order) : null;
  }

  async place(dto: CreateOrderDTO): Promise<OrderDTO> {
    if (!dto.items?.length) {
      throw new Error("Cannot place an empty order.");
    }

    const items: OrderItemProps[] = [];
    let currency = "USD";

    for (const line of dto.items) {
      const product = await this.products.findById(line.productId);
      if (!product) throw new Error(`Product ${line.productId} not found.`);
      if (!product.canFulfil(line.quantity)) {
        throw new Error(`Not enough stock for "${product.name}".`);
      }
      currency = product.currency;
      items.push({
        productId: product.id,
        name: product.name,
        size: line.size,
        color: line.color,
        quantity: line.quantity,
        unitPrice: product.price,
      });
    }

    const order = new Order({
      id: createId(),
      customerName: dto.customerName,
      email: dto.email,
      address: dto.address,
      items,
      total: Order.computeTotal(items),
      currency,
      status: OrderStatus.PENDING,
      createdAt: new Date(),
    });

    const saved = await this.orders.create(order);
    return OrderMapper.toDTO(saved);
  }

  async setStatus(id: string, status: OrderStatus): Promise<OrderDTO> {
    const saved = await this.orders.updateStatus(id, status);
    return OrderMapper.toDTO(saved);
  }
}
