import { Order, OrderStatus } from "./Order";

export interface OrderRepository {
  findAll(): Promise<Order[]>;
  findById(id: string): Promise<Order | null>;
  create(order: Order): Promise<Order>;
  updateStatus(id: string, status: OrderStatus): Promise<Order>;
}
