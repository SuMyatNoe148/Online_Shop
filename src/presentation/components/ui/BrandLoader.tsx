"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const LETTERS = ["A", "B", "Y", "S", "S"];

/**
 * BrandLoader — full-screen intro shown on first load.
 * The "loading logo" is the brand name ABYSS, revealed letter-by-letter
 * with a progress bar, then fades away.
 */
export default function BrandLoader() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Show once per browser session.
    if (typeof window !== "undefined") {
      if (sessionStorage.getItem("abyss-intro")) {
        setDone(true);
        return;
      }
      sessionStorage.setItem("abyss-intro", "1");
    }
    const t = setTimeout(() => setDone(true), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            background:
              "radial-gradient(120% 120% at 50% 0%, #16161a 0%, #0a0a0b 60%)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                display: "flex",
                gap: "0.12em",
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "clamp(2.6rem, 12vw, 6rem)",
                letterSpacing: "0.18em",
                color: "var(--ab-paper)",
                paddingLeft: "0.18em",
              }}
            >
              {LETTERS.map((l, i) => (
                <motion.span
                  key={i}
                  initial={{ y: "120%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{
                    delay: 0.12 * i,
                    duration: 0.6,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  style={{ display: "inline-block" }}
                >
                  {l}
                </motion.span>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              style={{
                marginTop: "1.4rem",
                fontSize: "0.72rem",
                letterSpacing: "0.45em",
                textTransform: "uppercase",
                color: "var(--ab-gold)",
                paddingLeft: "0.45em",
              }}
            >
              Depth in Detail
            </motion.div>

            <div
              style={{
                marginTop: "2.2rem",
                width: "min(220px, 60vw)",
                height: 2,
                background: "rgba(255,255,255,0.12)",
                borderRadius: 99,
                overflow: "hidden",
                marginInline: "auto",
              }}
            >
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.0, ease: "easeInOut" }}
                style={{
                  height: "100%",
                  background:
                    "linear-gradient(90deg, var(--ab-gold-soft), var(--ab-gold))",
                }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
