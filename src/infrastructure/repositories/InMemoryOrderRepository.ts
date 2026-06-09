import { Order, OrderStatus } from "@/domain/order/Order";
import { OrderRepository } from "@/domain/order/OrderRepository";

const store: Map<string, Order> = new Map();

export class InMemoryOrderRepository implements OrderRepository {
  async findAll(): Promise<Order[]> {
    return Array.from(store.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async findById(id: string): Promise<Order | null> {
    return store.get(id) ?? null;
  }

  async create(order: Order): Promise<Order> {
    store.set(order.id, order);
    return order;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const order = store.get(id);
    if (!order) throw new Error("Order not found.");
    order.updateStatus(status);
    store.set(id, order);
    return order;
  }
}
