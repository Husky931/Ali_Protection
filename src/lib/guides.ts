// Pillar / guide content. Each guide is a server-rendered, indexable article that targets
// Tier-3 informational queries (see seo-strategy.md) and internally links to /reports.
// Adding a guide = append an entry here; routing, metadata, JSON-LD, and the sitemap pick it up.

export type GuideSection = { heading: string; body: string[] };

export type Guide = {
  slug: string;
  title: string; // <h1> + metadata title
  description: string; // meta description (~155 chars)
  eyebrow: string; // small label above the title
  keywords: string[];
  published: string; // ISO date
  updated: string; // ISO date
  intro: string[];
  sections: GuideSection[];
};

export const guides: Guide[] = [
  {
    slug: "is-alibaba-safe",
    title: "Is Alibaba Safe? An Honest Guide for First-Time Buyers",
    description:
      "Is Alibaba safe and legit? A plain look at how Alibaba protects buyers, where the protection falls short, and how to source from Alibaba without getting scammed.",
    eyebrow: "Buyer guide",
    keywords: ["is alibaba safe", "is alibaba legit", "alibaba reviews", "alibaba safe to buy"],
    published: "2026-06-09",
    updated: "2026-06-09",
    intro: [
      "Alibaba is a real, established marketplace — the question isn't whether Alibaba itself is a scam, it's whether the individual seller you're about to wire money to is. Millions of legitimate orders ship every year. So do a steady stream of fraudulent ones.",
      "This guide is written for first-time importers and small businesses: what Alibaba actually does to protect you, where that protection quietly stops, and the habits that keep your money safe.",
    ],
    sections: [
      {
        heading: "The short answer",
        body: [
          "Alibaba the platform is legitimate. The risk lives at the seller level. A safe order comes down to vetting the supplier, using payment methods that can be reversed, and never letting a seller pull you off-platform before you've paid.",
          "If you only remember one thing: a low price from a brand-new, unverified seller who wants a bank wire is the exact profile of most reported scams.",
        ],
      },
      {
        heading: "How Alibaba protects buyers — and where it stops",
        body: [
          "Trade Assurance is Alibaba's order-protection program. When you pay through it, your money is meant to be held against the agreed quantity, quality, and shipping date — and refunded if the supplier doesn't deliver. It genuinely helps when you use it correctly and keep everything on-platform.",
          "The gaps: protection only applies to payments made through Alibaba's official channel for the agreed terms. The moment you pay by bank wire to a personal account, agree to terms over WhatsApp, or accept an order amount that doesn't match the real goods, you've stepped outside the umbrella. Disputes also lean on your documentation — vague agreements are hard to win.",
          "'Verified Supplier' and 'Gold Supplier' badges mean a third party checked some business details or the seller paid for membership. They raise the floor; they are not a guarantee of honesty.",
        ],
      },
      {
        heading: "The most common ways buyers get burned",
        body: [
          "The seller goes silent after payment. Money sent, tracking never materializes, messages stop. This is the single most reported pattern.",
          "Bait-and-switch on quality: photos and samples look great, the bulk shipment is junk or a different product entirely.",
          "Off-platform payment: the seller offers a 'discount' for paying by bank transfer, Western Union, or crypto — anything that strips away Trade Assurance and can't be reversed.",
          "Short-shipping: you pay for 1,000 units and 200 arrive, with the order documented for the lower amount so a dispute is unwinnable.",
        ],
      },
      {
        heading: "Green flags vs. red flags",
        body: [
          "Greener: years of operating history, consistent reviews and transaction records, a real company address, willingness to do a (paid) sample order, and clear English-or-not communication that answers your actual questions.",
          "Redder: a brand-new store, prices far below everyone else, pressure to decide today, requests to move to a personal bank account or messaging app before payment, and reluctance to put quantity/quality/dates in writing.",
        ],
      },
      {
        heading: "How to pay — and how not to",
        body: [
          "Pay through Alibaba's Trade Assurance order with the full, correct order details. Keep the negotiation, specs, and agreement inside the platform's messaging so there's a record.",
          "Avoid bank wires to personal accounts, Western Union, MoneyGram, gift cards, and crypto. These are favored precisely because they're irreversible — once it's gone, it's gone.",
          "For a first order with a new supplier, a small sample or trial order before a big commitment is cheap insurance.",
        ],
      },
      {
        heading: "If it goes wrong",
        body: [
          "Open a dispute through Alibaba promptly and attach everything: the order, the chat, photos, and tracking. Deadlines matter — don't wait.",
          "If you paid off-platform, your options shrink dramatically, but report it anyway: to your bank (for a possible chargeback if you used a card), and publicly so the next buyer can search the seller's name first.",
        ],
      },
      {
        heading: "Bottom line",
        body: [
          "Alibaba is safe enough to use well — the variable is the seller. Vet hard, keep everything on-platform, pay reversibly, and search a seller's name before you commit.",
        ],
      },
    ],
  },
  {
    slug: "how-to-avoid-alibaba-scams",
    title: "How to Avoid Alibaba Scams: Red Flags Before You Pay",
    description:
      "A practical checklist to avoid Alibaba scams — the red flags in seller profiles, messages, and payment requests that signal fraud before you wire any money.",
    eyebrow: "Buyer guide",
    keywords: ["how to avoid alibaba scams", "alibaba scam protection", "alibaba red flags"],
    published: "2026-06-09",
    updated: "2026-06-09",
    intro: [
      "Most Alibaba scams are avoidable, and they tend to announce themselves. The fraud isn't usually clever — it's a familiar set of moves designed to get you to pay irreversibly to a seller you haven't vetted. Learn the moves and you'll dodge the large majority of them.",
      "Use this as a pre-payment checklist. If two or more of these red flags show up, slow down.",
    ],
    sections: [
      {
        heading: "Red flags in the seller's profile",
        body: [
          "Brand-new store with little or no transaction history. Everyone starts somewhere, but a new seller asking for a large order on irreversible payment is the classic risk profile.",
          "Prices dramatically below every other supplier for the same item. If it's too good to be true, it's bait.",
          "Mismatched or vague company details — no verifiable address, a company name that doesn't match the bank account they later give you.",
        ],
      },
      {
        heading: "Red flags in the conversation",
        body: [
          "Pressure and urgency: 'price only valid today,' 'last slot in the production run.' Manufactured urgency exists to stop you from checking.",
          "Pushing you off-platform: 'message me on WhatsApp,' 'email me directly.' Once you're off Alibaba, there's no record and no protection.",
          "Evasiveness on specifics: they won't put quantity, quality spec, and ship date in writing, or they dodge direct questions with copy-paste replies.",
        ],
      },
      {
        heading: "Red flags in the payment request",
        body: [
          "Asking to pay outside Trade Assurance — bank wire to a personal account, Western Union, MoneyGram, gift cards, or crypto. This is the biggest single tell. These methods can't be reversed, which is the whole point for a scammer.",
          "A bank account in a different name or country than the company you've been talking to.",
          "An order amount documented lower than what you're actually paying — this sets up an unwinnable dispute if they short-ship.",
        ],
      },
      {
        heading: "How to vet a supplier in 10 minutes",
        body: [
          "Search the seller's name plus 'scam' or 'review' — including here on AlibabaScammer.com. Other buyers' experiences are the cheapest due diligence there is.",
          "Check operating history, transaction volume, and whether reviews read like real orders.",
          "Ask a specific technical question only a real maker of the product could answer well. Vague answers are a signal.",
          "Request a paid sample before a bulk order with a new supplier.",
        ],
      },
      {
        heading: "Pay so you can get your money back",
        body: [
          "Use Alibaba Trade Assurance with the correct, full order details, and keep the agreement on-platform. That's what makes a refund possible.",
          "Never let a 'discount for bank transfer' talk you out of reversible payment. The discount is the cost of giving up all your protection.",
        ],
      },
      {
        heading: "If you've already paid and it's going wrong",
        body: [
          "Open an Alibaba dispute immediately with full documentation — don't wait past the deadline.",
          "If you paid by card, ask your bank about a chargeback. If you wired funds, contact your bank anyway, and report the seller publicly so you spare the next buyer.",
        ],
      },
    ],
  },
];

export function getGuide(slug: string): Guide | null {
  return guides.find((g) => g.slug === slug) ?? null;
}
