import { Order } from "@/domain/order/Order";
import { Money } from "@/domain/shared/Money";
import { OrderDTO } from "../dto/OrderDTO";

export const OrderMapper = {
  toDTO(order: Order): OrderDTO {
    return {
      id: order.id,
      customerName: order.customerName,
      email: order.email,
      address: order.address,
      total: order.total,
      totalFormatted: Money.of(order.total, order.currency).format(),
      currency: order.currency,
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((i) => ({
        productId: i.productId,
        name: i.name,
        size: i.size,
        color: i.color,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        unitPriceFormatted: Money.of(i.unitPrice, order.currency).format(),
      })),
    };
  },
  toDTOList(orders: Order[]): OrderDTO[] {
    return orders.map((o) => OrderMapper.toDTO(o));
  },
};
