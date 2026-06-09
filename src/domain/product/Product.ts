import { Category } from "../shared/Category";

export interface ProductProps {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: Category;
  price: number; // minor units (cents)
  currency: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  featured: boolean;
  createdAt: Date;
}

/**
 * Product — domain entity (aggregate root).
 * Holds invariants/business rules for a sellable product.
 */
export class Product {
  constructor(private props: ProductProps) {}

  get id() {
    return this.props.id;
  }
  get slug() {
    return this.props.slug;
  }
  get name() {
    return this.props.name;
  }
  get description() {
    return this.props.description;
  }
  get category() {
    return this.props.category;
  }
  get price() {
    return this.props.price;
  }
  get currency() {
    return this.props.currency;
  }
  get images() {
    return this.props.images;
  }
  get sizes() {
    return this.props.sizes;
  }
  get colors() {
    return this.props.colors;
  }
  get stock() {
    return this.props.stock;
  }
  get featured() {
    return this.props.featured;
  }
  get createdAt() {
    return this.props.createdAt;
  }

  get inStock(): boolean {
    return this.props.stock > 0;
  }

  /** Business rule: can only fulfil a quantity that is in stock. */
  canFulfil(quantity: number): boolean {
    return quantity > 0 && quantity <= this.props.stock;
  }

  decreaseStock(quantity: number): void {
    if (!this.canFulfil(quantity)) {
      throw new Error(`Insufficient stock for product ${this.props.slug}.`);
    }
    this.props.stock -= quantity;
  }

  toJSON(): ProductProps {
    return { ...this.props };
  }
}
