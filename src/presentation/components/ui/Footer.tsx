import Link from "next/link";
import { Instagram, Twitter, Youtube, Phone, MapPin, Mail } from "lucide-react";
import NewsletterForm from "./NewsletterForm";

export default function Footer() {
  return (
    <footer className="ab-footer">
      <div className="ab-container">
        <div className="row g-4">
          <div className="col-lg-4 col-md-6">
            <div className="ab-brand" style={{ paddingLeft: 0 }}>
              ABYSS
            </div>
            <p className="ab-muted mt-3" style={{ maxWidth: 320 }}>
              Considered essentials in shirts, hoodies and tops. Designed for
              depth, built to last.
            </p>
            <div className="d-flex gap-3 mt-3">
              <Link href="#" aria-label="Instagram">
                <Instagram size={20} />
              </Link>
              <Link href="#" aria-label="Twitter">
                <Twitter size={20} />
              </Link>
              <Link href="#" aria-label="YouTube">
                <Youtube size={20} />
              </Link>
            </div>
          </div>

          <div className="col-lg-2 col-6">
            <h5>Contact</h5>
            <div className="d-flex flex-column gap-2" style={{ fontSize: "0.85rem" }}>
              <span className="d-flex align-items-center gap-2">
                <Phone size={15} className="text-gold" />
                +95 9 123 456 789
              </span>
              <span className="d-flex align-items-center gap-2">
                <Mail size={15} className="text-gold" />
                support@abyss.com
              </span>
              <span className="d-flex align-items-start gap-2">
                <MapPin size={15} className="text-gold mt-1" />
                No. 123, Pyay Road,<br />San Chaung Township,<br />Yangon, Myanmar
              </span>
            </div>
          </div>

          <div className="col-lg-2 col-6">
            <h5>Shop</h5>
            <Link href="/shop?category=SHIRT">Shirts</Link>
            <Link href="/shop?category=HOODIE">Hoodies</Link>
            <Link href="/shop?category=TOP">Tops</Link>
            <Link href="/shop">All Products</Link>
          </div>

          <div className="col-lg-3 col-md-12">
            <h5>Newsletter</h5>
            <p className="ab-muted">Be first to access new drops.</p>
            <NewsletterForm />
          </div>
        </div>

        <div
          className="d-flex flex-wrap justify-content-between align-items-center mt-5 pt-4 ab-muted"
          style={{ borderTop: "1px solid var(--ab-line)", fontSize: "0.8rem" }}
        >
          <span>© {new Date().getFullYear()} ABYSS. All rights reserved.</span>
          <div className="d-flex gap-4">
            <Link href="#">Privacy</Link>
            <Link href="#">Terms</Link>
            <Link href="/admin">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
