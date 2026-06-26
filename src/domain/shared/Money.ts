/**
 * Money — value object. Stores amount in MINOR units (cents) to avoid
 * floating point errors, mirroring how you'd handle currency in PHP with integers.
 */
export class Money {
  private constructor(
    public readonly amount: number, // minor units (cents)
    public readonly currency: string,
  ) {}

  static of(amount: number, currency = "MMK"): Money {
    if (!Number.isInteger(amount) || amount < 0) {
      throw new Error("Money.amount must be a non-negative integer (cents).");
    }
    return new Money(amount, currency);
  }

  static fromMajor(value: number, currency = "MMK"): Money {
    return Money.of(Math.round(value * 100), currency);
  }

  get major(): number {
    return this.amount / 100;
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  multiply(qty: number): Money {
    return new Money(this.amount * qty, this.currency);
  }

  format(locale = "en-US"): string {
    if (this.currency === "MMK") {
      return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(this.major)} MMK`;
    }
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: this.currency,
    }).format(this.major);
  }

  private assertSameCurrency(other: Money): void {
    if (other.currency !== this.currency) {
      throw new Error("Cannot operate on different currencies.");
    }
  }
}
