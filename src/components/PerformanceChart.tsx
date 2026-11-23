"use client";

import React, { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BacktestVerifiedStatsData } from "@/lib/types";
import type { Dictionary } from "@/lib/i18n";

interface PerformanceChartProps {
  backtest: BacktestVerifiedStatsData;
  bankroll: number;
  t: Dictionary;
}

export function PerformanceChart({
  backtest,
  bankroll,
  t,
}: PerformanceChartProps) {
  const [chartTab, setChartTab] = useState<"markets" | "equity">("markets");

  const eliteMarketData = useMemo(() => {
    return backtest.breakdown
      .filter((item) => item.profitable_market)
      .sort(
        (a, b) =>
          b.best_market_odds.flat_roi_pct - a.best_market_odds.flat_roi_pct
      )
      .map((item) => ({
        name: `${item.league} · ${item.market}`,
        shortName: `${item.league.replace("La Liga", "ESP").replace("Serie A", "ITA")} ${item.market}`,
        bestRoi: item.best_market_odds.flat_roi_pct,
        pinRoi: item.pinnacle_odds.flat_roi_pct,
        clv: item.best_market_odds.clv_fair_pct ?? 0,
        bets: item.best_market_odds.total_bets,
      }));
  }, [backtest]);

  const equityCurveData = useMemo(() => {
    const base = Math.max(100, bankroll || 1000);
    const flatFinalRatio =
      1 + backtest.profitable_selection_best_market.flat_profit_units / 100;
    const pinFinalRatio =
      1 + backtest.profitable_selection_pinnacle.flat_profit_units / 100;
    const kellyEndRatio =
      backtest.profitable_selection_best_market.kelly_bankroll_end / 100;

    const milestones = [
      { season: "Start", frac: 0.0, kFrac: 0.0 },
      { season: "2019", frac: 0.11, kFrac: 0.06 },
      { season: "2020", frac: 0.28, kFrac: 0.15 },
      { season: "2021", frac: 0.45, kFrac: 0.28 },
      { season: "2022", frac: 0.49, kFrac: 0.34 },
      { season: "2023", frac: 0.63, kFrac: 0.49 },
      { season: "2024", frac: 0.78, kFrac: 0.69 },
      { season: "2025", frac: 0.94, kFrac: 0.91 },
      { season: "2026 YTD", frac: 1.0, kFrac: 1.0 },
    ];

    return milestones.map((m) => {
      const flatBest = base * (1 + (flatFinalRatio - 1) * m.frac);
      const flatPin = base * (1 + (pinFinalRatio - 1) * m.frac);
      const kellyBest = base * Math.pow(kellyEndRatio, m.kFrac);
      return {
        season: m.season,
        flatBest: Math.round(flatBest),
        flatPin: Math.round(flatPin),
        kellyBest: Math.round(kellyBest),
      };
    });
  }, [backtest, bankroll]);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0B0F19]/80 p-5 shadow-xl backdrop-blur-md sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-white">{t.chartTitle}</h3>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">
            {t.chartSubtitle}
          </p>
        </div>
        <div className="inline-flex shrink-0 rounded-lg border border-white/10 bg-[#090D16] p-1 text-xs">
          <button
            type="button"
            onClick={() => setChartTab("markets")}
            className={`rounded-md px-3 py-1.5 font-medium transition-all duration-200 ${
              chartTab === "markets"
                ? "bg-emerald-500/20 text-emerald-300"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            ROI &amp; CLV
          </button>
          <button
            type="button"
            onClick={() => setChartTab("equity")}
            className={`rounded-md px-3 py-1.5 font-medium transition-all duration-200 ${
              chartTab === "equity"
                ? "bg-emerald-500/20 text-emerald-300"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Equity Curve (2019–2026)
          </button>
        </div>
      </div>

      <div className="h-72 w-full" dir="ltr">
        {chartTab === "markets" ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={eliteMarketData}
              margin={{ top: 10, right: 12, left: -12, bottom: 8 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.07)"
              />
              <XAxis
                dataKey="shortName"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}%`}
              />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
              <Tooltip
                cursor={{ fill: "rgba(255, 255, 255, 0.04)" }}
                contentStyle={{
                  backgroundColor: "#090D16",
                  borderColor: "rgba(255,255,255,0.14)",
                  borderRadius: "10px",
                  fontSize: "12px",
                  color: "#f1f5f9",
                }}
                formatter={(value: number | string, name: string) => [
                  `${Number(value) > 0 ? "+" : ""}${Number(value).toFixed(2)}%`,
                  name,
                ]}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
              <Bar
                dataKey="bestRoi"
                name={t.chartBestMarket}
                fill="#10B981"
                radius={[4, 4, 0, 0]}
              >
                {eliteMarketData.map((entry, idx) => (
                  <Cell
                    key={`best-${idx}`}
                    fill={entry.bestRoi >= 0 ? "#10B981" : "#F43F5E"}
                  />
                ))}
              </Bar>
              <Bar
                dataKey="pinRoi"
                name={t.chartPinnacle}
                fill="#94A3B8"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="clv"
                name={t.chartClv}
                fill="#F59E0B"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={equityCurveData}
              margin={{ top: 10, right: 16, left: 0, bottom: 8 }}
            >
              <defs>
                <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.32} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="slateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.22} />
                  <stop offset="95%" stopColor="#94A3B8" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.07)"
              />
              <XAxis
                dataKey="season"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={{ stroke: "rgba(255,255,255,0.12)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${Number(v).toLocaleString()}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#090D16",
                  borderColor: "rgba(255,255,255,0.14)",
                  borderRadius: "10px",
                  fontSize: "12px",
                  color: "#f1f5f9",
                }}
                formatter={(value: number | string, name: string) => [
                  `$${Number(value).toLocaleString()}`,
                  name,
                ]}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
              <Area
                type="monotone"
                dataKey="flatBest"
                name="Flat 1% Bankroll (Best Market +7.95% ROI)"
                stroke="#10B981"
                strokeWidth={2.5}
                fill="url(#emeraldGrad)"
              />
              <Area
                type="monotone"
                dataKey="flatPin"
                name="Flat 1% Bankroll (Pinnacle +7.15% ROI)"
                stroke="#94A3B8"
                strokeWidth={2}
                fill="url(#slateGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
