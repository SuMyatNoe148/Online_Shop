import { OrderStatus } from "@/domain/order/Order";

export interface OrderItemDTO {
  productId: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  unitPriceFormatted: string;
}

export interface OrderDTO {
  id: string;
  customerName: string;
  email: string;
  address: string;
  items: OrderItemDTO[];
  total: number;
  totalFormatted: string;
  currency: string;
  status: OrderStatus;
  createdAt: string;
}

export interface CreateOrderItemDTO {
  productId: string;
  size: string;
  color: string;
  quantity: number;
}

export interface CreateOrderDTO {
  customerName: string;
  email: string;
  address: string;
  items: CreateOrderItemDTO[];
}
