export type BookmakerCategory = "global-crypto" | "eu-international";

export interface BookmakerConfig {
  id: string;
  name: string;
  category: BookmakerCategory;
  tag: string;
  badgeClass: string;
  /**
   * Clean landing URL (avoids Cloudflare deep-search WAF blocks).
   * Replace with your partner affiliate tracking URL when ready.
   */
  affiliateUrl: string;
}

export const GLOBAL_BOOKMAKERS: BookmakerConfig[] = [
  // Category 1: Global & Crypto Access
  {
    id: "stake",
    name: "Stake",
    category: "global-crypto",
    tag: "Global · Crypto / USDT",
    badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    affiliateUrl: "https://stake.com",
  },
  {
    id: "1xbet",
    name: "1xBet",
    category: "global-crypto",
    tag: "MENA / Africa / Global",
    badgeClass: "border-white/10 bg-white/[0.04] text-slate-300",
    affiliateUrl: "https://1xbet.com",
  },

  // Category 2: EU & International Licensed
  {
    id: "pinnacle",
    name: "Pinnacle",
    category: "eu-international",
    tag: "EU / Sharp Lines",
    badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    affiliateUrl: "https://www.pinnacle.com",
  },
  {
    id: "betfair-exchange",
    name: "Betfair Exchange",
    category: "eu-international",
    tag: "EU / UK Exchange",
    badgeClass: "border-white/10 bg-white/[0.04] text-slate-300",
    affiliateUrl: "https://www.betfair.com/exchange",
  },
];

export const BOOKMAKER_CATEGORIES: {
  id: BookmakerCategory;
  items: BookmakerConfig[];
}[] = [
  {
    id: "global-crypto",
    items: GLOBAL_BOOKMAKERS.filter((b) => b.category === "global-crypto"),
  },
  {
    id: "eu-international",
    items: GLOBAL_BOOKMAKERS.filter((b) => b.category === "eu-international"),
  },
];
