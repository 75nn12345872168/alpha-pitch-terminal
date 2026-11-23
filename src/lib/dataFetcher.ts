import fallbackPredictions from "@/data/fallback/predictions_latest.json";
import fallbackPerformance from "@/data/fallback/performance_summary.json";
import fallbackBacktest from "@/data/fallback/backtest_verified_stats.json";
import type {
  BacktestVerifiedStatsData,
  PerformanceSummaryData,
  PredictionsLatestData,
  TerminalBundle,
} from "./types";

const RAW_BASE =
  "https://raw.githubusercontent.com/75nn12345872168/football-betting-autoloop/main/data/public";

export const DATA_ENDPOINTS = {
  predictions: `${RAW_BASE}/predictions_latest.json`,
  performance: `${RAW_BASE}/performance_summary.json`,
  backtest: `${RAW_BASE}/backtest_verified_stats.json`,
} as const;

const REVALIDATE_SECONDS = 900; // 15-minute ISR auto-refresh

async function fetchJsonWithFallback<T>(
  url: string,
  fallback: T
): Promise<{ data: T; live: boolean }> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      next: { revalidate: REVALIDATE_SECONDS },
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) {
      return { data: fallback, live: false };
    }
    const parsed = (await res.json()) as T;
    if (!parsed || typeof parsed !== "object") {
      return { data: fallback, live: false };
    }
    return { data: parsed, live: true };
  } catch {
    return { data: fallback, live: false };
  }
}

export async function fetchTerminalBundle(): Promise<TerminalBundle> {
  const [predRes, perfRes, btRes] = await Promise.all([
    fetchJsonWithFallback<PredictionsLatestData>(
      DATA_ENDPOINTS.predictions,
      fallbackPredictions as unknown as PredictionsLatestData
    ),
    fetchJsonWithFallback<PerformanceSummaryData>(
      DATA_ENDPOINTS.performance,
      fallbackPerformance as unknown as PerformanceSummaryData
    ),
    fetchJsonWithFallback<BacktestVerifiedStatsData>(
      DATA_ENDPOINTS.backtest,
      fallbackBacktest as unknown as BacktestVerifiedStatsData
    ),
  ]);

  const allLive = predRes.live && perfRes.live && btRes.live;
  return {
    predictions: predRes.data,
    performance: perfRes.data,
    backtest: btRes.data,
    dataSource: allLive ? "github-live" : "local-fallback",
    fetchedAt: new Date().toISOString(),
  };
}
