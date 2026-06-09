import { Order, OrderStatus } from "@/domain/order/Order";
import { OrderRepository } from "@/domain/order/OrderRepository";
import { prisma } from "../db/prisma";

function toEntity(row: any): Order {
  return new Order({
    id: row.id,
    customerName: row.customerName,
    email: row.email,
    address: row.address,
    total: row.total,
    currency: row.currency,
    status: row.status as OrderStatus,
    createdAt: row.createdAt,
    items: (row.items ?? []).map((i: any) => ({
      productId: i.productId,
      name: i.name,
      size: i.size,
      color: i.color,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
    })),
  });
}

export class PrismaOrderRepository implements OrderRepository {
  async findAll(): Promise<Order[]> {
    const rows = await prisma.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toEntity);
  }

  async findById(id: string): Promise<Order | null> {
    const row = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    return row ? toEntity(row) : null;
  }

  async create(order: Order): Promise<Order> {
    const o = order.toJSON();
    const row = await prisma.order.create({
      data: {
        customerName: o.customerName,
        email: o.email,
        address: o.address,
        total: o.total,
        currency: o.currency,
        status: o.status as any,
        items: {
          create: o.items.map((i) => ({
            productId: i.productId,
            name: i.name,
            size: i.size,
            color: i.color,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
        },
      },
      include: { items: true },
    });
    return toEntity(row);
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const row = await prisma.order.update({
      where: { id },
      data: { status: status as any },
      include: { items: true },
    });
    return toEntity(row);
  }
}
