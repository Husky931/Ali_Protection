// Sample report data — generic seller names; not real Alibaba sellers.
const REPORTS = [
  {
    id: 'r-001',
    slug: 'shenzhen-glowtech-electronics-scam',
    sellerName: 'Shenzhen GlowTech Electronics Co., Ltd.',
    sellerUrl: 'https://example-marketplace.com/sellers/glowtech-3920',
    productName: 'A19 Smart LED Bulbs (1000-pack)',
    productUrl: 'https://example-marketplace.com/p/a19-smart-bulbs-1k',
    quantity: 1000,
    totalPaid: 4280,
    currency: 'USD',
    industry: 'Electronics',
    platform: 'Alibaba.com',
    createdAt: '2026-04-29',
    snippet: 'Wired the 30% deposit, got tracking that never updated. After two weeks they stopped replying. Trade Assurance closed the case because I "missed the response window".',
    story: `I run a small online store and was placing my first big overseas order — a thousand A19 smart bulbs to fulfill a Kickstarter. The seller had a Gold rating and a three-year history, so I felt safe.\n\nThe agreed terms were 30% deposit, 70% on shipment. I wired $1,284 from my business account on March 12. They sent a contract, an invoice with a chop, and a screenshot of a "factory production schedule". Everything looked legitimate.\n\nA week later, I got a tracking number from a shipping company I'd never heard of. The number worked for one day, showed "received at warehouse", and then went dead. My messages on the platform stopped getting read receipts.\n\nI opened a Trade Assurance dispute. The seller had 7 days to respond. They responded with a single message asking for "more time due to Chinese New Year" — even though Chinese New Year had ended six weeks earlier. The dispute auto-closed in their favor because, according to the platform, I "did not respond to the seller's last message in 72 hours". I had responded. Twice.\n\nI'm out $1,284 and a launch window. Posting this so the next person Googling this seller's name sees it before they wire.`
  },
  {
    id: 'r-002',
    slug: 'guangzhou-northstar-textiles-scam',
    sellerName: 'Guangzhou Northstar Textiles',
    sellerUrl: 'https://example-marketplace.com/sellers/northstar-textiles',
    productName: 'Custom-printed cotton tote bags',
    productUrl: 'https://example-marketplace.com/p/custom-totes',
    quantity: 500,
    totalPaid: 1820,
    currency: 'USD',
    industry: 'Textiles',
    platform: 'Alibaba.com',
    createdAt: '2026-04-22',
    snippet: 'Samples were beautiful. Bulk shipment was a different fabric, misprinted, and 60 bags short. Seller blamed "the factory" and offered a 5% refund.',
    story: `Ordered 500 custom-printed tote bags for an event. Paid in full upfront because the seller offered a 12% discount for it. Samples were perfect — stitching was clean, the print was exactly the Pantone we asked for.\n\nThe bulk shipment that arrived eight weeks later was a different story. The fabric weight was visibly thinner. The print was off-register on roughly a third of them. And the count was 440, not 500.\n\nSeller's first reply blamed the factory. Their second offered a 5% refund "as a goodwill gesture". I asked for a partial refund matching the missing units alone — they ghosted me. The platform's mediation team said the goods "had been delivered" and closed the case.`
  },
  {
    id: 'r-003',
    slug: 'foshan-prime-machinery-scam',
    sellerName: 'Foshan Prime Industrial Machinery',
    sellerUrl: 'https://example-marketplace.com/sellers/foshan-prime',
    productName: 'Semi-automatic packaging line',
    productUrl: 'https://example-marketplace.com/p/packaging-line-2t',
    quantity: 1,
    totalPaid: 18600,
    currency: 'USD',
    industry: 'Machinery',
    platform: 'Alibaba.com',
    createdAt: '2026-04-18',
    snippet: 'Paid $18,600 for a packaging line. Received a crate of unrelated parts that did not match the spec sheet. Seller insists it was "the right model".',
    story: `Sourcing a small packaging line for a beverage co-pack we're building. Spent three weeks comparing quotes; Foshan Prime was the most responsive and offered video calls with their "engineer".\n\nFull payment of $18,600 wired on Feb 4. Crate arrived April 1. What was inside was not the machine in the spec sheet. Wrong frame, wrong PLC, no conveyor at all. The serial plate had been ground off.\n\nThey insist it's "the right model, just a refresh". My freight forwarder, who handles dozens of these a year, took one look and said it was scrap from a different machine entirely. Dispute open. Not optimistic.`
  },
  {
    id: 'r-004',
    slug: 'ningbo-coastal-housewares-scam',
    sellerName: 'Ningbo Coastal Housewares',
    sellerUrl: 'https://example-marketplace.com/sellers/ningbo-coastal',
    productName: 'Stainless steel travel mugs (custom logo)',
    productUrl: 'https://example-marketplace.com/p/travel-mugs-customlogo',
    quantity: 250,
    totalPaid: 1140,
    currency: 'USD',
    industry: 'Home & Kitchen',
    platform: 'Alibaba.com',
    createdAt: '2026-04-11',
    snippet: 'Order never shipped. Tracking was a fake number from a forwarder that doesn\'t exist. Profile went private the day after the dispute opened.',
    story: `Placed a small order for branded travel mugs as employee gifts. Wired $1,140 in full because the seller asked nicely and the amount was small.\n\nWhat I learned: small orders get scammed too. Tracking number turned out to be from a shell forwarder — the website was three pages deep with broken links. Seller's profile went private the day after I opened the dispute.\n\nDispute outcome: "Seller could not be reached. Case closed without resolution." That's a direct quote.`
  },
  {
    id: 'r-005',
    slug: 'qingdao-blueline-auto-parts-scam',
    sellerName: 'Qingdao Blueline Auto Parts',
    sellerUrl: 'https://example-marketplace.com/sellers/qingdao-blueline',
    productName: 'OEM brake pad sets',
    productUrl: 'https://example-marketplace.com/p/brake-pads-oem',
    quantity: 200,
    totalPaid: 3450,
    currency: 'USD',
    industry: 'Automotive',
    platform: 'Alibaba.com',
    createdAt: '2026-04-03',
    snippet: 'Counterfeit OEM packaging, wrong friction material. A mechanic flagged them as unsafe. Seller refused to refund.',
    story: `Bought 200 sets of brake pads marked as OEM-grade. The boxes had the right logos. The pads inside did not have the right material — a mechanic friend pulled one apart and said the friction compound was a generic asbestos-free filler that wouldn't hold up to spec.\n\nI refuse to sell these. Seller refuses to refund. Posting this is the only thing I can do.`
  },
  {
    id: 'r-006',
    slug: 'hangzhou-bright-textiles-scam',
    sellerName: 'Hangzhou Bright Textiles',
    sellerUrl: 'https://example-marketplace.com/sellers/hangzhou-bright',
    productName: 'Polyester fabric rolls',
    productUrl: 'https://example-marketplace.com/p/polyester-rolls',
    quantity: 80,
    totalPaid: 5200,
    currency: 'EUR',
    industry: 'Textiles',
    platform: 'Alibaba.com',
    createdAt: '2026-03-28',
    snippet: 'Rolls arrived stained, mildewed, and 20% short on length. Photos were shrugged off as "lighting".',
    story: `Eighty rolls of polyester were supposed to arrive within 6 weeks. They arrived after 11. The pallets were soaked through. About a third of the material was unusable due to mildew. The roll lengths were also short — measured them ourselves, average was 80% of the spec.\n\nWhen I sent photos, the response was: "lighting in your warehouse is not good". I'm not making this up.`
  },
  {
    id: 'r-007',
    slug: 'shenzhen-vortex-mobile-scam',
    sellerName: 'Shenzhen Vortex Mobile',
    sellerUrl: 'https://example-marketplace.com/sellers/vortex-mobile',
    productName: 'Refurbished smartphones, mid-tier',
    productUrl: 'https://example-marketplace.com/p/refurb-phones-midtier',
    quantity: 50,
    totalPaid: 6750,
    currency: 'USD',
    industry: 'Electronics',
    platform: 'Alibaba.com',
    createdAt: '2026-03-19',
    snippet: 'Half the units arrived locked to a foreign carrier, six were dead on arrival. Refurbishment grade was not what was advertised.',
    story: `We resell refurbished phones. Ordered 50 units listed as Grade A, unlocked, with 90%+ battery health.\n\nReality: 24 were carrier-locked to a network we don't operate in, 6 were dead on arrival, and battery health across the rest averaged 78%. Total usable inventory: 14 units out of 50.\n\nDispute is open. Documentation is airtight on our end. We'll see.`
  }
];

const INDUSTRIES = [
  'Electronics', 'Textiles', 'Machinery', 'Home & Kitchen',
  'Automotive', 'Beauty & Personal Care', 'Industrial Supplies',
  'Apparel', 'Sporting Goods', 'Toys', 'Other'
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'CNY', 'INR', 'JPY', 'Other'];

function formatMoney(amount, currency) {
  const symbol = { USD: '$', EUR: '€', GBP: '£', CAD: 'CA$', AUD: 'A$', CNY: '¥', INR: '₹', JPY: '¥' }[currency] || '';
  return symbol + amount.toLocaleString('en-US');
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function relativeDate(iso) {
  const d = new Date(iso);
  const now = new Date('2026-05-04');
  const days = Math.floor((now - d) / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return days + ' days ago';
  if (days < 30) return Math.floor(days / 7) + 'w ago';
  return Math.floor(days / 30) + 'mo ago';
}

window.REPORTS = REPORTS;
window.INDUSTRIES = INDUSTRIES;
window.CURRENCIES = CURRENCIES;
window.formatMoney = formatMoney;
window.formatDate = formatDate;
window.relativeDate = relativeDate;
