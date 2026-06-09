import { getServices } from "@/infrastructure/container";
import { CreateOrderDTO } from "@/application/dto/OrderDTO";
import { OrderStatus } from "@/domain/order/Order";

export const OrderController = {
  async index() {
    const { orderService } = getServices();
    return orderService.list();
  },

  async show(id: string) {
    const { orderService } = getServices();
    return orderService.getById(id);
  },

  async create(body: CreateOrderDTO) {
    if (!body?.customerName?.trim()) throw new Error("Name is required.");
    if (!body?.email?.includes("@")) throw new Error("Valid email required.");
    if (!body?.address?.trim()) throw new Error("Address is required.");
    if (!body?.items?.length) throw new Error("Cart is empty.");
    const { orderService } = getServices();
    return orderService.place(body);
  },

  async updateStatus(id: string, status: string) {
    if (!(status in OrderStatus)) throw new Error("Invalid status.");
    const { orderService } = getServices();
    return orderService.setStatus(id, status as OrderStatus);
  },
};
