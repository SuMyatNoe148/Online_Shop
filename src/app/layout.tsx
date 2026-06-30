import type { Metadata } from "next";
import "./globals.scss";
import ConditionalNavbar from "@/presentation/components/ui/ConditionalNavbar";
import ConditionalCartDrawer from "@/presentation/components/ui/ConditionalCartDrawer";
import Footer from "@/presentation/components/ui/Footer";
import BrandLoader from "@/presentation/components/ui/BrandLoader";
import ToasterProvider from "@/presentation/components/ui/ToasterProvider";
import ErrorBoundary from "@/presentation/components/ui/ErrorBoundary";
import SkipToContent from "@/presentation/components/ui/SkipToContent";

export const metadata: Metadata = {
  title: {
    default: "ABYSS — Premium Shirts, Hoodies & Tops",
    template: "%s · ABYSS",
  },
  description:
    "ABYSS is a premium clothing brand crafting considered shirts, hoodies and tops. Depth in detail.",
  keywords: ["ABYSS", "clothing", "shirts", "hoodies", "tops", "streetwear"],
  openGraph: {
    title: "ABYSS — Depth in Detail",
    description: "Premium shirts, hoodies and tops.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Syne:wght@600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <SkipToContent />
        <BrandLoader />
        <ConditionalNavbar />
        <main id="main-content">
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
        <Footer />
        <ConditionalCartDrawer />
        <ToasterProvider />
      </body>
    </html>
  );
}
