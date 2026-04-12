"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";

export function HeroImage({
  className,
  width,
  height,
  fill,
}: {
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
}) {
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="cursor-zoom-in">
        <Image
          src="/hero-alibaba.png"
          alt="Alibaba seller with high rating but negative buyer reviews"
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          className={className}
          priority
        />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-2xl text-white backdrop-blur transition hover:bg-white/40"
          >
            &times;
          </button>
          <Image
            src="/hero-alibaba.png"
            alt="Alibaba seller with high rating but negative buyer reviews"
            width={1612}
            height={1464}
            className="max-h-[90vh] w-auto rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
