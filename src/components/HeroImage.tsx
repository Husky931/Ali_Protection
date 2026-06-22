"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

type HeroImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes?: string;
};

/**
 * Hero screenshot that opens in a dismissible full-screen lightbox on click.
 * Close via the X button, clicking the backdrop, or the Escape key.
 */
export function HeroImage({ src, alt, width, height, sizes }: HeroImageProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // lock background scroll while open
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Enlarge image"
        title="Click to enlarge"
        style={{
          display: "block",
          width: "100%",
          alignSelf: "flex-start",
          padding: 0,
          margin: 0,
          border: "none",
          background: "none",
          cursor: "zoom-in",
          lineHeight: 0,
        }}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority
          sizes={sizes}
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </button>

      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={alt}
            onClick={() => setOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 100,
              background: "rgba(20, 6, 6, .82)",
              backdropFilter: "blur(4px)",
              display: "grid",
              placeItems: "center",
              padding: 24,
              animation: "loaderIn .18s ease-out both",
            }}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              style={{
                position: "fixed",
                top: 18,
                right: 18,
                width: 44,
                height: 44,
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,.28)",
                background: "rgba(255,255,255,.12)",
                color: "#fff",
                fontSize: 20,
                lineHeight: 1,
                display: "grid",
                placeItems: "center",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: "94vw",
                maxHeight: "92vh",
                width: "auto",
                height: "auto",
                objectFit: "contain",
                borderRadius: 8,
                boxShadow: "0 24px 80px rgba(0,0,0,.5)",
                cursor: "default",
              }}
            />
          </div>,
          document.body,
        )}
    </>
  );
}
