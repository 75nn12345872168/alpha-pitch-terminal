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
    badgeClass: "border-amber-500/40 bg-amber-500/10 text-amber-300",
    affiliateUrl: "https://www.pinnacle.com/en/soccer/matchups/",
  },
  {
    id: "betfair-exchange",
    name: "Betfair Exchange",
    tag: "P2P Exchange",
    badgeClass: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
    affiliateUrl: "https://www.betfair.com/exchange/plus/football",
  },
  {
    id: "bet365",
    name: "Bet365",
    tag: "Deep Asian & DNB",
    badgeClass: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    affiliateUrl: "https://www.bet365.com/#/AS/B1/",
  },
  {
    id: "stake",
    name: "Stake",
    tag: "Global · Crypto",
    badgeClass: "border-violet-500/40 bg-violet-500/10 text-violet-300",
    affiliateUrl: "https://stake.com/sports/soccer",
  },
];
