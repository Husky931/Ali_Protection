"use client";

import type { ChangeEvent, FormEvent } from "react";
import { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

const initialState = {
  platform: "alibaba",
  seller_name: "",
  seller_url: "",
  product_name: "",
  product_url: "",
  quantity: "",
  total_price: "",
  currency: "",
  industry: "",
  details: "",
};

const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

export function ReportForm() {
  const [form, setForm] = useState(initialState);
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const captchaRef = useRef<ReCAPTCHA>(null);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const captchaToken = captchaRef.current?.getValue();
    if (!captchaToken) {
      setStatus("error");
      setMessage("Please complete the captcha.");
      return;
    }

    const response = await fetch("/api/reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...form,
        quantity: Number(form.quantity),
        total_price: Number(form.total_price),
        captchaToken,
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      setStatus("error");
      setMessage(payload?.error || "Could not submit report.");
      captchaRef.current?.reset();
      return;
    }

    setStatus("success");
    setMessage(
      "Thank you for sharing your story! Your report will be reviewed and published soon."
    );
    setForm(initialState);
    captchaRef.current?.reset();
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
      <div className="flex flex-wrap gap-4">
        <label className="flex w-full flex-col gap-2 text-sm sm:w-[48%]">
          <span className="font-medium text-ink">Platform</span>
          <input
            className="rounded-lg border border-border bg-white px-4 py-3 text-base text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            name="platform"
            value={form.platform}
            onChange={handleChange}
            placeholder="alibaba"
            required
          />
        </label>
        <label className="flex w-full flex-col gap-2 text-sm sm:w-[48%]">
          <span className="font-medium text-ink">Industry</span>
          <input
            className="rounded-lg border border-border bg-white px-4 py-3 text-base text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            name="industry"
            value={form.industry}
            onChange={handleChange}
            placeholder="Electronics, Textiles, etc."
            required
          />
        </label>
        <label className="flex w-full flex-col gap-2 text-sm sm:w-[48%]">
          <span className="font-medium text-ink">Seller (Company) Name</span>
          <input
            className="rounded-lg border border-border bg-white px-4 py-3 text-base text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            name="seller_name"
            value={form.seller_name}
            onChange={handleChange}
            placeholder="Company name"
            required
          />
        </label>
        <label className="flex w-full flex-col gap-2 text-sm sm:w-[48%]">
          <span className="font-medium text-ink">Seller (Company) URL</span>
          <input
            className="rounded-lg border border-border bg-white px-4 py-3 text-base text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            name="seller_url"
            value={form.seller_url}
            onChange={handleChange}
            placeholder="https://..."
            required
          />
        </label>
        <label className="flex w-full flex-col gap-2 text-sm sm:w-[48%]">
          <span className="font-medium text-ink">Product Name</span>
          <input
            className="rounded-lg border border-border bg-white px-4 py-3 text-base text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            name="product_name"
            value={form.product_name}
            onChange={handleChange}
            placeholder="Item name"
            required
          />
        </label>
        <label className="flex w-full flex-col gap-2 text-sm sm:w-[48%]">
          <span className="font-medium text-ink">Product URL</span>
          <input
            className="rounded-lg border border-border bg-white px-4 py-3 text-base text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            name="product_url"
            value={form.product_url}
            onChange={handleChange}
            placeholder="https://..."
            required
          />
        </label>
        <label className="flex w-full flex-col gap-2 text-sm sm:w-[48%]">
          <span className="font-medium text-ink">Quantity</span>
          <input
            className="rounded-lg border border-border bg-white px-4 py-3 text-base text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            name="quantity"
            value={form.quantity}
            onChange={handleChange}
            type="number"
            min="0"
            step="1"
            required
          />
        </label>
        <label className="flex w-full flex-col gap-2 text-sm sm:w-[48%]">
          <span className="font-medium text-ink">Total Price</span>
          <input
            className="rounded-lg border border-border bg-white px-4 py-3 text-base text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            name="total_price"
            value={form.total_price}
            onChange={handleChange}
            type="number"
            min="0"
            step="0.01"
            required
          />
        </label>
        <label className="flex w-full flex-col gap-2 text-sm sm:w-[48%]">
          <span className="font-medium text-ink">Currency</span>
          <input
            className="rounded-lg border border-border bg-white px-4 py-3 text-base text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
            name="currency"
            value={form.currency}
            onChange={handleChange}
            placeholder="USD, EUR, etc."
            required
          />
        </label>
      </div>
      <label className="flex flex-col gap-2 text-sm">
        <span className="font-medium text-ink">Your Story</span>
        <span className="text-xs text-muted">
          Describe what happened with your order. Include details about the
          product, seller communication, and any issues you encountered.
        </span>
        <textarea
          className="min-h-[140px] rounded-lg border border-border bg-white px-4 py-3 text-base text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
          name="details"
          value={form.details}
          onChange={handleChange}
          placeholder="Tell us what happened with your order..."
          required
        />
      </label>

      {siteKey && <ReCAPTCHA ref={captchaRef} sitekey={siteKey} />}

      <button
        className="w-full cursor-pointer rounded-lg bg-ink px-6 py-4 text-base font-semibold text-white transition hover:bg-black hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
        type="submit"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Submitting Your Story..." : "Share Your Story"}
      </button>
      {message ? (
        <div
          className={`rounded-lg p-4 text-sm ${
            status === "error"
              ? "bg-red-50 text-danger"
              : "bg-green-50 text-success"
          }`}
        >
          {message}
        </div>
      ) : null}
    </form>
  );
}
