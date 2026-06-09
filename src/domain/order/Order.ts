export const OrderStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export interface OrderItemProps {
  productId: string;
  name: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number; // minor units
}

export interface OrderProps {
  id: string;
  customerName: string;
  email: string;
  address: string;
  items: OrderItemProps[];
  total: number; // minor units
  currency: string;
  status: OrderStatus;
  createdAt: Date;
}

/**
 * Order — aggregate root. Total is derived from items to keep it consistent.
 */
export class Order {
  constructor(private props: OrderProps) {}

  get id() {
    return this.props.id;
  }
  get customerName() {
    return this.props.customerName;
  }
  get email() {
    return this.props.email;
  }
  get address() {
    return this.props.address;
  }
  get items() {
    return this.props.items;
  }
  get total() {
    return this.props.total;
  }
  get currency() {
    return this.props.currency;
  }
  get status() {
    return this.props.status;
  }
  get createdAt() {
    return this.props.createdAt;
  }

  static computeTotal(items: OrderItemProps[]): number {
    return items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  }

  updateStatus(status: OrderStatus): void {
    this.props.status = status;
  }

  toJSON(): OrderProps {
    return { ...this.props };
  }
}
