export interface ExpectedGoals {
  home: number;
  away: number;
}

export interface PredictionSignal {
  date: string;
  matchweek_id?: string;
  league: string;
  home: string;
  away: string;
  market: string;
  selection_side: string;
  p_model: number;
  p_calibrated: number;
  price_type: "verified" | "model" | string;
  min_odds: number | null;
  market_odds: number;
  ev_percent: number;
  stake_kelly: number;
  expected_goals: ExpectedGoals;
}

export interface WeeklyPickRecord {
  date: string;
  league: string;
  home: string;
  away: string;
  market: string;
  selection_side: string;
  calibrated_prob: number | null;
  min_odds: number | null;
  market_odds: number | null;
  closing_odds: number | null;
  stake_pct: number;
  status: "WIN" | "HALF WIN" | "LOSS" | "PUSH" | "PENDING" | string;
  score: string;
  conservative_kelly_pnl_pct: number | null;
  flat_pnl_units: number | null;
}

export interface WeeklyPerformanceEntry {
  matchweek_id: string;
  window_start: string;
  window_end: string;
  window_start_utc?: string;
  window_end_utc?: string;
  label: string;
  closed_at: string | null;
  archive_status: "CLOSED_ARCHIVED" | "ACTIVE" | string;
  status: "PROFIT" | "LOSS" | "BREAKEVEN" | "PENDING" | string;
  total_picks: number;
  settled_picks: number;
  pending_picks: number;
  wins: number;
  half_wins: number;
  losses: number;
  pushes: number;
  hit_rate_percent: number;
  total_staked_pct: number;
  conservative_min_odds_roi_pct: number | null;
  kelly_bankroll_change_pct: number;
  flat_net_units: number;
  flat_roi_pct: number | null;
  closing_odds_roi_pct: number | null;
  closing_odds_sample_n?: number;
  picks?: WeeklyPickRecord[];
}

export interface TransparencyBannerData {
  valuation_basis: string;
  matchweek_window_rule: string;
  current_week: WeeklyPerformanceEntry | null;
  last_closed_week: WeeklyPerformanceEntry | null;
  closed_weeks_count: number;
}

export interface WeeklyArchiveData {
  generated_at: string;
  engine_version: string;
  matchweek_window_rule: string;
  valuation_basis: string;
  total_weeks: number;
  closed_weeks_count: number;
  active_weeks_count: number;
  transparency_banner: TransparencyBannerData;
  weeks: WeeklyPerformanceEntry[];
}

export interface MleEntry {
  mu_home: number;
  mu_away: number;
  rho: number;
  status: string;
  n: number;
}

export interface PredictionsLatestData {
  generated_at: string;
  engine_version: string;
  transparency_banner?: TransparencyBannerData;
  min_confidence_pct: number;
  dnb_min_confidence_pct?: number;
  safety_margin_pct: number;
  approved_leagues: string[];
  approved_pairs: [string, string][];
  mle_calibration: Record<string, MleEntry>;
  count: number;
  predictions: PredictionSignal[];
}

export interface SettlementStats {
  cutoff: string;
  pending_before: number;
  eligible_played: number;
  settled_now: number;
  result_not_found: number;
  ambiguous_average: number;
  pending_after: number;
  total_settled_all_time: number;
  wins: number;
  half_wins: number;
  losses: number;
  pushes?: number;
  settled_units: number;
  hit_rate_percent: number;
  verified_settled_count: number;
  verified_profit_units: number;
  verified_staked: number;
  verified_roi_percent: number | null;
  leagues: string[];
}

export interface BreakdownRecord {
  settled: number;
  wins: number;
  half_wins: number;
  losses: number;
  hit_rate_percent: number;
}

export interface PerformanceSummaryData {
  generated_at: string;
  engine_version: string;
  matchweek_window_rule?: string;
  valuation_basis?: string;
  approved_production_pairs: [string, string][];
  transparency_banner?: TransparencyBannerData;
  weekly_performance?: WeeklyPerformanceEntry[];
  settlement: SettlementStats;
  breakdown_by_league: Record<string, BreakdownRecord>;
  breakdown_by_market: Record<string, BreakdownRecord>;
}

export interface StrategyMetrics {
  total_bets: number;
  wins: number;
  pushes?: number;
  win_rate_pct: number;
  avg_pred_pct: number;
  avg_odds: number;
  flat_profit_units: number;
  flat_roi_pct: number;
  flat_max_dd_pct: number;
  kelly_profit_units: number;
  kelly_roi_pct: number;
  kelly_bankroll_end: number;
  kelly_max_dd_pct: number;
  clv_fair_pct: number | null;
  clv_raw_pct: number | null;
  clv_sample_n: number;
}

export interface BacktestBreakdownItem {
  league: string;
  market: string;
  oos_matches: number;
  brier: number;
  brier_skill_pct: number;
  logloss_skill_pct: number;
  best_market_odds: StrategyMetrics;
  pinnacle_odds: StrategyMetrics;
  profitable_market: boolean;
  profitable_pinnacle: boolean;
}

export interface BacktestVerifiedStatsData {
  generated_at: string;
  methodology: {
    model: string;
    xi_decay: number;
    xg_weight: number;
    entry_min_confidence: number;
    entry_safety_margin: number;
    entry_rule: string;
    kelly_fraction: number;
    kelly_max_stake: number;
    oos_seasons: string;
    data_leakage_protection: string;
  };
  overall_all_big5_best_market: StrategyMetrics;
  overall_all_big5_pinnacle: StrategyMetrics;
  profitable_selection_best_market: StrategyMetrics;
  profitable_selection_pinnacle: StrategyMetrics;
  approved_production_pairs: [string, string][];
  fitted_platt_params: Record<string, [number, number]>;
  breakdown: BacktestBreakdownItem[];
}

export interface TerminalBundle {
  predictions: PredictionsLatestData;
  performance: PerformanceSummaryData;
  backtest: BacktestVerifiedStatsData;
  weeklyArchive: WeeklyArchiveData;
  dataSource: "github-live" | "local-fallback";
  fetchedAt: string;
}
