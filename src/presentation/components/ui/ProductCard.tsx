import Link from "next/link";
import Image from "next/image";
import { ProductDTO } from "@/application/dto/ProductDTO";
import { CATEGORY_LABELS } from "@/domain/shared/Category";

export default function ProductCard({ product }: { product: ProductDTO }) {
  return (
    <Link href={`/product/${product.slug}`} className="ab-card">
      <div className="ab-card__media">
        {product.featured && <span className="ab-tag ab-tag--gold">Featured</span>}
        {!product.inStock && <span className="ab-tag">Sold Out</span>}
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="ab-card__body">
        <span className="ab-card__cat">
          {CATEGORY_LABELS[product.category]}
        </span>
        <span className="ab-card__name">{product.name}</span>
        <span className="ab-card__price">{product.priceFormatted}</span>
      </div>
    </Link>
  );
}
