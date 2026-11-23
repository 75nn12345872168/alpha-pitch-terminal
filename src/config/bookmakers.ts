export interface BookmakerConfig {
  id: string;
  name: string;
  tag: string;
  badgeClass: string;
  /**
   * Ready-to-edit affiliate or direct sportsbook URL.
   * Replace with your partner tracking link when activating affiliate campaigns.
   */
  affiliateUrl: string;
}

export const GLOBAL_BOOKMAKERS: BookmakerConfig[] = [
  {
    id: "pinnacle",
    name: "Pinnacle",
    tag: "Sharp · Lowest Vig",
    badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    affiliateUrl: "https://www.pinnacle.com/en/soccer/matchups/",
  },
  {
    id: "betfair-exchange",
    name: "Betfair Exchange",
    tag: "P2P Exchange",
    badgeClass: "border-white/10 bg-white/[0.04] text-slate-300",
    affiliateUrl: "https://www.betfair.com/exchange/plus/football",
  },
  {
    id: "bet365",
    name: "Bet365",
    tag: "Deep Asian & DNB",
    badgeClass: "border-white/10 bg-white/[0.04] text-slate-300",
    affiliateUrl: "https://www.bet365.com/#/AS/B1/",
  },
  {
    id: "stake",
    name: "Stake",
    tag: "Global · Crypto",
    badgeClass: "border-white/10 bg-white/[0.04] text-slate-300",
    affiliateUrl: "https://stake.com/sports/soccer",
  },
];
