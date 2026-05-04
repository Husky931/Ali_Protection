import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const seedReports = [
  {
    seller_name: "Shenzhen Brightway Electronics Co., Ltd.",
    seller_url: "https://brightwayelec.en.alibaba.com",
    product_name: "Wireless Bluetooth Earbuds TWS",
    product_url: "https://www.alibaba.com/product-detail/Wireless-Bluetooth-Earbuds_1600001234567.html",
    quantity: "500",
    total_price: "2750",
    currency: "USD",
    industry: "Electronics",
    details: "Ordered 500 units of Bluetooth earbuds. The samples they sent were perfect quality with good bass and clear sound. When the bulk order arrived, completely different product inside the same packaging. Cheap chipset, terrible sound quality, and the battery lasted 30 minutes instead of the advertised 6 hours. Seller stopped responding after I sent photos and videos proving the difference. Trade Assurance dispute was denied because the 'product matched the listing description' even though the internals were completely swapped out.",
  },
  {
    seller_name: "Guangzhou Meixin Textile Co., Ltd.",
    seller_url: "https://gzmeixin.en.alibaba.com",
    product_name: "100% Cotton T-Shirts Blank",
    product_url: "https://www.alibaba.com/product-detail/Cotton-T-Shirts-Wholesale_1600002345678.html",
    quantity: "2000",
    total_price: "4800",
    currency: "USD",
    industry: "Textiles",
    details: "Ordered 2000 blank t-shirts listed as 100% combed cotton, 180gsm. What arrived was thin polyester-cotton blend, maybe 120gsm at best. The fabric feels scratchy and nothing like the sample. Seller claims 'cotton percentage may vary by batch' which is absolute nonsense. Tried to open a dispute but since I accepted the shipment, my options were limited. Lost almost $5000 and cannot sell these to my customers.",
  },
  {
    seller_name: "Yiwu Starshine Import & Export Co., Ltd.",
    seller_url: "https://ywstarshine.en.alibaba.com",
    product_name: "LED Strip Lights 5050 RGB",
    product_url: "https://www.alibaba.com/product-detail/LED-Strip-Lights-RGB_1600003456789.html",
    quantity: "300",
    total_price: "1950",
    currency: "USD",
    industry: "Lighting",
    details: "Bought 300 rolls of LED strip lights. About 40% of them had dead sections or flickering LEDs right out of the box. The adhesive backing was so weak they fall off any surface within hours. When I contacted the seller with photo evidence, they offered a 5% discount on the next order instead of any refund. I didn't want to throw more money at a bad seller. Complete waste of nearly $2000.",
  },
  {
    seller_name: "Dongguan Huafeng Machinery Co., Ltd.",
    seller_url: "https://dghuafeng.en.alibaba.com",
    product_name: "CNC Laser Engraving Machine 60W",
    product_url: "https://www.alibaba.com/product-detail/CNC-Laser-Engraver-60W_1600004567890.html",
    quantity: "1",
    total_price: "3200",
    currency: "USD",
    industry: "Machinery",
    details: "Purchased a 60W CO2 laser engraver. The machine arrived with a cracked laser tube and a power supply that was clearly used and refurbished. The actual wattage measured at only 40W. Seller said the tube must have broken during shipping and wanted me to buy a replacement from them at 'discounted' price. The instruction manual was for a completely different model. After months of back and forth, they ghosted me. $3200 down the drain for a machine that barely works.",
  },
  {
    seller_name: "Fujian Mingda Sports Equipment Co., Ltd.",
    seller_url: "https://fjmingda.en.alibaba.com",
    product_name: "Yoga Mats TPE Eco-Friendly",
    product_url: "https://www.alibaba.com/product-detail/Yoga-Mat-TPE-Eco_1600005678901.html",
    quantity: "1000",
    total_price: "3500",
    currency: "USD",
    industry: "Sports & Fitness",
    details: "Ordered 1000 'eco-friendly TPE' yoga mats for my fitness brand. They arrived with an overwhelming chemical smell that gave customers headaches. The mats were clearly PVC, not TPE as advertised. Several customers complained and I had to issue refunds and pull them from my store. When I confronted the seller with lab test results proving they were PVC, they said 'TPE and PVC are same family of material.' They are not. Lost money on the product plus damaged my brand reputation.",
  },
  {
    seller_name: "Zhongshan Brilliant Lighting Co., Ltd.",
    seller_url: "https://zsbrillight.en.alibaba.com",
    product_name: "Solar Garden Lights Outdoor LED",
    product_url: "https://www.alibaba.com/product-detail/Solar-Garden-Lights-LED_1600006789012.html",
    quantity: "800",
    total_price: "2400",
    currency: "USD",
    industry: "Lighting",
    details: "800 solar garden lights ordered. The solar panels are so small and cheap they barely charge the battery. The lights stay on for maybe 1 hour after a full day of sun, not 8-10 hours as listed. The plastic housing started cracking after just two weeks outdoors. I sent detailed test results to the seller showing the actual vs advertised performance. Their response was to offer a 'better model' at twice the price. No refund offered whatsoever.",
  },
  {
    seller_name: "Ningbo Oceanstar Kitchenware Co., Ltd.",
    seller_url: "https://nboceanstar.en.alibaba.com",
    product_name: "Stainless Steel Cookware Set 10-Piece",
    product_url: "https://www.alibaba.com/product-detail/Stainless-Steel-Cookware_1600007890123.html",
    quantity: "200",
    total_price: "5600",
    currency: "USD",
    industry: "Kitchenware",
    details: "Ordered 200 sets of '18/10 stainless steel' cookware. The quality was supposed to be restaurant grade. What I received was thin, lightweight pots and pans that warp on the stove. Magnet test shows they are not even proper stainless steel. The handles get burning hot and the non-stick coating on the frying pans started peeling after first use. Seller provided fake material certificates when asked. When I pushed back with my own testing results, communication stopped entirely.",
  },
  {
    seller_name: "Shenzhen Topmax Technology Co., Ltd.",
    seller_url: "https://sztopmaxtech.en.alibaba.com",
    product_name: "Action Camera 4K Waterproof",
    product_url: "https://www.alibaba.com/product-detail/Action-Camera-4K-Waterproof_1600008901234.html",
    quantity: "300",
    total_price: "4500",
    currency: "USD",
    industry: "Electronics",
    details: "300 action cameras advertised as 4K 60fps waterproof. The reality: they record at maybe 1080p interpolated to 4K, so the footage looks terrible. The 'waterproof' casing leaked on 3 out of 5 units I tested. The battery lasts 25 minutes, not 90 as claimed. Memory card slot is faulty on many units. Seller initially offered replacements but then said I need to ship all 300 units back to China at my expense before they would inspect them. Shipping would cost more than the refund.",
  },
  {
    seller_name: "Hangzhou Greenvale Home Textile Co., Ltd.",
    seller_url: "https://hzgreenvale.en.alibaba.com",
    product_name: "Bamboo Bed Sheets Set 1800TC",
    product_url: "https://www.alibaba.com/product-detail/Bamboo-Bed-Sheets-1800TC_1600009012345.html",
    quantity: "500",
    total_price: "3750",
    currency: "USD",
    industry: "Home Textiles",
    details: "500 sets of 'bamboo viscose' bed sheets with '1800 thread count'. First off, 1800TC is physically impossible for bamboo sheets and should have been a red flag. The sheets are rough microfiber polyester, not bamboo. They pill after one wash. The sizing is wrong — queen sets are closer to full size. Color fades significantly after washing. When I raised these issues, seller said 'bamboo feel polyester is same as bamboo' and refused any compensation. Classic bait and switch.",
  },
  {
    seller_name: "Jiangsu Delong Auto Parts Co., Ltd.",
    seller_url: "https://jsdelong.en.alibaba.com",
    product_name: "Brake Pads Ceramic Front Set",
    product_url: "https://www.alibaba.com/product-detail/Brake-Pads-Ceramic_1600010123456.html",
    quantity: "400",
    total_price: "2800",
    currency: "USD",
    industry: "Auto Parts",
    details: "Purchased 400 sets of 'ceramic' brake pads. These are a safety-critical item and the seller guaranteed OEM-equivalent quality with proper certifications. The pads arrived with no brand marking, no certification paperwork, and when tested they showed about 60% of the braking performance of genuine ceramic pads. These could literally kill someone. When I demanded proper test certifications, the seller sent a certificate that was clearly photoshopped — the lab name doesn't even exist. Reported to Alibaba but the listing is still up.",
  },
  {
    seller_name: "Quanzhou Winfull Shoes Co., Ltd.",
    seller_url: "https://qzwinfull.en.alibaba.com",
    product_name: "Running Shoes Men Breathable Mesh",
    product_url: "https://www.alibaba.com/product-detail/Running-Shoes-Men-Mesh_1600011234567.html",
    quantity: "600",
    total_price: "4200",
    currency: "USD",
    industry: "Footwear",
    details: "600 pairs of running shoes. The samples looked and felt great — proper cushioning, good mesh, decent sole. The bulk order was a completely different shoe in the same box. The sole is hard plastic with a thin foam layer glued on. The mesh tears easily. Sizing is inconsistent — some size 10s are actually 9s. Several pairs arrived with visible glue stains. The seller blamed the factory and offered 10% off next order. I don't want a next order from a scammer.",
  },
  {
    seller_name: "Foshan Jiaxin Furniture Co., Ltd.",
    seller_url: "https://fsjiaxin.en.alibaba.com",
    product_name: "Office Chair Ergonomic Mesh High-Back",
    product_url: "https://www.alibaba.com/product-detail/Office-Chair-Ergonomic_1600012345678.html",
    quantity: "50",
    total_price: "3250",
    currency: "USD",
    industry: "Furniture",
    details: "50 ergonomic office chairs for our new office. The listing showed a premium chair with lumbar support, adjustable armrests, and breathable mesh. What arrived was a cheap chair with thin mesh that sags immediately, non-adjustable armrests despite being labeled adjustable, and a gas cylinder that slowly sinks throughout the day. Two chairs had broken base wheels right out of the box. The assembly instructions were just photos, no text, and missing steps. Seller wants me to pay for return shipping to China for a refund. That's $2000+ in shipping for $3250 worth of chairs.",
  },
  {
    seller_name: "Xiamen Goldtree Trading Co., Ltd.",
    seller_url: "https://xmgoldtree.en.alibaba.com",
    product_name: "Stainless Steel Water Bottles Vacuum Insulated",
    product_url: "https://www.alibaba.com/product-detail/Water-Bottle-Stainless_1600013456789.html",
    quantity: "1000",
    total_price: "3000",
    currency: "USD",
    industry: "Drinkware",
    details: "1000 vacuum insulated water bottles. The double-wall vacuum insulation doesn't work — ice melts in 2 hours instead of the claimed 24 hours. Many bottles have dents and scratches. The powder coating chips off easily. The logo printing I paid extra for is crooked on about 30% of them. When I opened a dispute, the seller uploaded fake shipping photos showing 'perfect' bottles and claimed the damage happened in transit. My customs inspection photos prove they arrived in poor condition from the factory.",
  },
  {
    seller_name: "Shenzhen Bairong Electronics Co., Ltd.",
    seller_url: "https://szbairong.en.alibaba.com",
    product_name: "USB-C Charging Cables 6ft Braided",
    product_url: "https://www.alibaba.com/product-detail/USB-C-Cable-Braided_1600014567890.html",
    quantity: "5000",
    total_price: "2500",
    currency: "USD",
    industry: "Electronics",
    details: "5000 USB-C cables advertised as supporting 100W PD fast charging. Real-world testing shows they max out at 15W. The braided nylon sheath is just cosmetic over the thinnest copper wires I've ever seen. About 10% of cables don't even establish a data connection. One cable started smoking during testing and could have caused a fire. Seller insists the cables 'support 100W' because the connector is rated for it, ignoring that the actual wire gauge can't handle that current. Dangerous product.",
  },
  {
    seller_name: "Taizhou Hengxin Plastic Co., Ltd.",
    seller_url: "https://tzhengxin.en.alibaba.com",
    product_name: "Food Storage Containers Set BPA-Free",
    product_url: "https://www.alibaba.com/product-detail/Food-Storage-Container_1600015678901.html",
    quantity: "2000",
    total_price: "3400",
    currency: "USD",
    industry: "Housewares",
    details: "2000 sets of 'BPA-free food-grade' storage containers. Had them tested at an independent lab — they contain BPA and are NOT food safe. The plastic is brittle and cracks in the microwave despite being labeled microwave safe. The lids don't seal properly so nothing stays fresh. The seller provided a food safety certificate that our lab confirmed is fraudulent. This is a health hazard. Filed a report with Alibaba over a month ago and the listing is still active. Seller has not responded to any messages since I shared the lab results.",
  },
];

async function generateUniqueSlug(base: string): Promise<string> {
  let slug = slugify(base);
  let suffix = 0;
  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const [existing] = await db
      .select({ id: schema.reports.id })
      .from(schema.reports)
      .where(eq(schema.reports.slug, candidate))
      .limit(1);
    if (!existing) return candidate;
    suffix++;
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  console.log("Seeding 15 reports...");

  for (const report of seedReports) {
    const slug = await generateUniqueSlug(
      `${report.seller_name}-${report.product_name}`
    );

    await db.insert(schema.reports).values({
      ...report,
      platform: "alibaba",
      status: "approved",
      slug,
    });

    console.log(`  + ${report.seller_name} — ${report.product_name}`);
  }

  console.log("Done! 15 reports seeded as approved.");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
