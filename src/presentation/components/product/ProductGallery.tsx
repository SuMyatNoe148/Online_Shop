"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const main = images[active] ?? images[0];

  return (
    <div>
      <div
        style={{
          position: "relative",
          aspectRatio: "3 / 4",
          borderRadius: "var(--ab-radius)",
          overflow: "hidden",
          background: "var(--ab-surface-2)",
        }}
      >
        <Image
          src={main}
          alt={alt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{ objectFit: "cover" }}
        />
      </div>
      {images.length > 1 && (
        <div className="d-flex gap-2 mt-3">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                position: "relative",
                width: 76,
                height: 96,
                borderRadius: 10,
                overflow: "hidden",
                border:
                  i === active
                    ? "2px solid var(--ab-gold)"
                    : "1px solid var(--ab-line)",
                background: "var(--ab-surface-2)",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <Image
                src={img}
                alt={`${alt} ${i + 1}`}
                fill
                sizes="80px"
                style={{ objectFit: "cover" }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
