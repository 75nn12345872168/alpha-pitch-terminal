"use client";

import React, { useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Database,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import type {
  BacktestVerifiedStatsData,
  PerformanceSummaryData,
} from "@/lib/types";
import type { Dictionary } from "@/lib/i18n";
import { PerformanceChart } from "./PerformanceChart";

interface AuditSectionProps {
  backtest: BacktestVerifiedStatsData;
  performance: PerformanceSummaryData;
  bankroll: number;
  t: Dictionary;
}

export function AuditSection({
  backtest,
  performance,
  bankroll,
  t,
}: AuditSectionProps) {
  const [showAllPairs, setShowAllPairs] = useState(false);

  const tableRows = useMemo(() => {
    const base = showAllPairs
      ? backtest.breakdown
      : backtest.breakdown.filter((r) => r.profitable_market);
    return [...base].sort((a, b) => {
      if (a.profitable_market !== b.profitable_market) {
        return a.profitable_market ? -1 : 1;
      }
      return b.best_market_odds.flat_roi_pct - a.best_market_odds.flat_roi_pct;
    });
  }, [backtest.breakdown, showAllPairs]);

  const st = performance.settlement;

  return (
    <section id="audit" className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <ShieldCheck className="h-4 w-4" />
            <span>VERIFIED QUANTITATIVE AUDIT · 2019–2026</span>
          </div>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">
            {t.auditTitle}
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-slate-400">
            {t.auditSubtitle}
          </p>
        </div>
      </div>

      {/* Live Beta Scientific Transparency Banner */}
      <div className="rounded-2xl border border-cyan-500/30 bg-cyan-950/20 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <Activity className="mt-0.5 h-5 w-5 shrink-0 text-cyan-400" />
          <div>
            <h3 className="text-sm font-semibold text-cyan-200">
              {t.betaBannerTitle}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">
              {t.betaBannerBody}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Recharts Visual */}
      <PerformanceChart backtest={backtest} bankroll={bankroll} t={t} />

      {/* Backtest Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-[#111827]/90 shadow-xl">
        <div className="flex flex-col gap-3 border-b border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-semibold text-white">
              Out-of-Sample Historical Closing Odds Matrix (14,845 Matches)
            </span>
          </div>
          <div className="inline-flex rounded-lg border border-slate-700/70 bg-[#090D16] p-1 text-xs">
            <button
              type="button"
              onClick={() => setShowAllPairs(false)}
              className={`rounded-md px-3 py-1.5 font-medium transition ${
                !showAllPairs
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t.tableToggleApproved}
            </button>
            <button
              type="button"
              onClick={() => setShowAllPairs(true)}
              className={`rounded-md px-3 py-1.5 font-medium transition ${
                showAllPairs
                  ? "bg-slate-700/70 text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {t.tableToggleAll}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-[#090D16]/70 text-slate-400">
                <th className="px-4 py-3 text-start font-medium">{t.colLeague}</th>
                <th className="px-3 py-3 text-start font-medium">{t.colMarket}</th>
                <th className="px-3 py-3 text-end font-medium">{t.colBets}</th>
                <th className="px-3 py-3 text-end font-medium">{t.colWinRate}</th>
                <th className="px-3 py-3 text-end font-medium">{t.colAvgOdds}</th>
                <th className="px-3 py-3 text-end font-medium">{t.colBestRoi}</th>
                <th className="px-3 py-3 text-end font-medium">{t.colPinRoi}</th>
                <th className="px-3 py-3 text-end font-medium">{t.colMaxDd}</th>
                <th className="px-3 py-3 text-end font-medium">{t.colClv}</th>
                <th className="px-3 py-3 text-end font-medium">{t.colBrier}</th>
                <th className="px-4 py-3 text-center font-medium">{t.colStatus}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 font-mono tabular-nums">
              {tableRows.map((row) => {
                const bm = row.best_market_odds;
                const pm = row.pinnacle_odds;
                return (
                  <tr
                    key={`${row.league}-${row.market}`}
                    className={`transition hover:bg-slate-800/40 ${
                      row.profitable_market ? "bg-emerald-950/10" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-sans font-medium text-slate-100">
                      {row.league}
                    </td>
                    <td className="px-3 py-3 font-sans text-slate-300">
                      {row.market}
                    </td>
                    <td className="px-3 py-3 text-end text-slate-300">
                      {bm.total_bets}
                    </td>
                    <td className="px-3 py-3 text-end text-slate-200">
                      {bm.total_bets > 0 ? `${bm.win_rate_pct.toFixed(1)}%` : "—"}
                    </td>
                    <td className="px-3 py-3 text-end text-slate-300">
                      {bm.total_bets > 0 ? bm.avg_odds.toFixed(2) : "—"}
                    </td>
                    <td
                      className={`px-3 py-3 text-end font-semibold ${
                        bm.flat_roi_pct > 0
                          ? "text-emerald-400"
                          : bm.flat_roi_pct < 0
                          ? "text-rose-400"
                          : "text-slate-400"
                      }`}
                    >
                      {bm.total_bets > 0
                        ? `${bm.flat_roi_pct > 0 ? "+" : ""}${bm.flat_roi_pct.toFixed(2)}%`
                        : "—"}
                    </td>
                    <td
                      className={`px-3 py-3 text-end ${
                        pm.flat_roi_pct > 0
                          ? "text-cyan-300"
                          : pm.flat_roi_pct < 0
                          ? "text-rose-400/80"
                          : "text-slate-400"
                      }`}
                    >
                      {pm.total_bets > 0
                        ? `${pm.flat_roi_pct > 0 ? "+" : ""}${pm.flat_roi_pct.toFixed(2)}%`
                        : "—"}
                    </td>
                    <td className="px-3 py-3 text-end text-slate-300">
                      {bm.total_bets > 0 ? `${bm.flat_max_dd_pct.toFixed(2)}%` : "—"}
                    </td>
                    <td
                      className={`px-3 py-3 text-end font-medium ${
                        (bm.clv_fair_pct ?? 0) > 0
                          ? "text-violet-300"
                          : "text-slate-400"
                      }`}
                    >
                      {bm.clv_fair_pct !== null
                        ? `${bm.clv_fair_pct > 0 ? "+" : ""}${bm.clv_fair_pct.toFixed(2)}%`
                        : "—"}
                    </td>
                    <td className="px-3 py-3 text-end text-emerald-300/80">
                      {row.brier_skill_pct > 0 ? "+" : ""}
                      {row.brier_skill_pct.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-center font-sans">
                      {row.profitable_market ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" />
                          {t.statusApproved}
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full border border-slate-700 bg-slate-800/70 px-2.5 py-0.5 text-[10px] font-medium text-slate-400">
                          {t.statusFiltered}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Live 2026/27 Season Settlement Ledger & Methodology */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Live Settlement Card */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#111827]/90 p-5 shadow-xl">
          <h3 className="text-base font-semibold text-white">
            {t.liveRecordTitle}
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">{t.liveRecordSubtitle}</p>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-[#090D16] p-3">
              <div className="text-[11px] text-slate-400">{t.settledPicks}</div>
              <div className="mt-1 font-mono text-xl font-bold text-white tabular-nums">
                {st.total_settled_all_time}
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#090D16] p-3">
              <div className="text-[11px] text-slate-400">{t.winsLabel}</div>
              <div className="mt-1 font-mono text-xl font-bold text-emerald-400 tabular-nums">
                {st.wins}
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#090D16] p-3">
              <div className="text-[11px] text-slate-400">{t.halfWinsLabel}</div>
              <div className="mt-1 font-mono text-xl font-bold text-cyan-400 tabular-nums">
                {st.half_wins}
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#090D16] p-3">
              <div className="text-[11px] text-slate-400">{t.lossesLabel}</div>
              <div className="mt-1 font-mono text-xl font-bold text-rose-400 tabular-nums">
                {st.losses}
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {t.byLeagueTitle}
              </h4>
              <div className="space-y-2.5">
                {Object.entries(performance.breakdown_by_league).map(
                  ([lg, rec]) => (
                    <div key={lg} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-200">{lg}</span>
                        <span className="font-mono text-emerald-400 tabular-nums">
                          {rec.hit_rate_percent.toFixed(1)}% ({rec.settled})
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                          style={{
                            width: `${Math.min(100, Math.max(4, rec.hit_rate_percent))}%`,
                          }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {t.byMarketTitle}
              </h4>
              <div className="space-y-2.5">
                {Object.entries(performance.breakdown_by_market).map(
                  ([mk, rec]) => (
                    <div key={mk} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-200">{mk}</span>
                        <span className="font-mono text-cyan-300 tabular-nums">
                          {rec.hit_rate_percent.toFixed(1)}% ({rec.settled})
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400"
                          style={{
                            width: `${Math.min(100, Math.max(4, rec.hit_rate_percent))}%`,
                          }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Methodology Specs */}
        <div className="rounded-2xl border border-slate-800/80 bg-[#111827]/90 p-5 shadow-xl">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-cyan-400" />
            <h3 className="text-base font-semibold text-white">
              {t.methodologyTitle}
            </h3>
          </div>
          <dl className="mt-4 space-y-3 text-xs">
            <div className="rounded-xl border border-slate-800/90 bg-[#090D16] p-3">
              <dt className="text-slate-400">Core Quantitative Model</dt>
              <dd className="mt-1 font-mono text-slate-200">
                {backtest.methodology.model}
              </dd>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-800/90 bg-[#090D16] p-3">
                <dt className="text-slate-400">Time Decay (ξ) / xG Weight</dt>
                <dd className="mt-1 font-mono text-emerald-300">
                  ξ = {backtest.methodology.xi_decay} ·{" "}
                  {(backtest.methodology.xg_weight * 100).toFixed(0)}% xG +{" "}
                  {((1 - backtest.methodology.xg_weight) * 100).toFixed(0)}% Goals
                </dd>
              </div>
              <div className="rounded-xl border border-slate-800/90 bg-[#090D16] p-3">
                <dt className="text-slate-400">Kelly Fraction / Cap</dt>
                <dd className="mt-1 font-mono text-cyan-300">
                  {backtest.methodology.kelly_fraction}x Kelly · Max{" "}
                  {(backtest.methodology.kelly_max_stake * 100).toFixed(0)}%
                </dd>
              </div>
            </div>
            <div className="rounded-xl border border-slate-800/90 bg-[#090D16] p-3">
              <dt className="text-slate-400">Entry Gate Rule</dt>
              <dd className="mt-1 font-mono text-emerald-300">
                {backtest.methodology.entry_rule} (DNB Home ≥ 0.70)
              </dd>
            </div>
            <div className="rounded-xl border border-slate-800/90 bg-[#090D16] p-3">
              <dt className="text-slate-400">Zero Data Leakage Protocol</dt>
              <dd className="mt-1 text-slate-300">
                {backtest.methodology.data_leakage_protection} ·{" "}
                {backtest.methodology.oos_seasons}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
