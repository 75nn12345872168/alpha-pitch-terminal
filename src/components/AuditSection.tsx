"use client";

import React, { useMemo, useState } from "react";
import {
  Activity,
  Archive,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Database,
  Lock,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";
import type {
  BacktestVerifiedStatsData,
  PerformanceSummaryData,
  WeeklyArchiveData,
} from "@/lib/types";
import type { Dictionary } from "@/lib/i18n";
import { PerformanceChart } from "./PerformanceChart";

interface AuditSectionProps {
  backtest: BacktestVerifiedStatsData;
  performance: PerformanceSummaryData;
  weeklyArchive: WeeklyArchiveData;
  bankroll: number;
  riskMultiplier: number;
  t: Dictionary;
}

export function AuditSection({
  backtest,
  performance,
  weeklyArchive,
  bankroll,
  riskMultiplier,
  t,
}: AuditSectionProps) {
  const [showAllPairs, setShowAllPairs] = useState(false);
  const [expandedWeekId, setExpandedWeekId] = useState<string | null>(
    weeklyArchive?.weeks?.[0]?.matchweek_id ?? null
  );

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
    <section id="audit" className="space-y-7">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span>VERIFIED QUANTITATIVE AUDIT · 2019–2026</span>
          </div>
          <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-white">
            {t.auditTitle}
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-slate-400">
            {t.auditSubtitle}
          </p>
        </div>
      </div>

      {/* Live Beta Scientific Transparency Banner */}
      <div className="rounded-2xl border border-white/10 bg-[#0B0F19]/80 p-4 backdrop-blur-md sm:p-5">
        <div className="flex items-start gap-3">
          <Activity className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-white">
              {t.betaBannerTitle}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-slate-300/90">
              {t.betaBannerBody}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Recharts Visual */}
      <PerformanceChart backtest={backtest} bankroll={bankroll} t={t} />

      {/* Backtest Matrix Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F19]/80 shadow-xl backdrop-blur-md">
        <div className="flex flex-col gap-3 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 shrink-0 text-emerald-400" />
            <span className="text-sm font-semibold text-white">
              Out-of-Sample Historical Closing Odds Matrix (14,845 Matches)
            </span>
          </div>
          <div className="inline-flex shrink-0 rounded-lg border border-white/10 bg-[#090D16] p-1 text-xs">
            <button
              type="button"
              onClick={() => setShowAllPairs(false)}
              className={`rounded-md px-3 py-1.5 font-medium transition-all duration-200 ${
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
              className={`rounded-md px-3 py-1.5 font-medium transition-all duration-200 ${
                showAllPairs
                  ? "bg-white/10 text-white"
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
              <tr className="border-b border-white/10 bg-[#090D16]/75 text-slate-400">
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
            <tbody className="divide-y divide-white/[0.06] font-mono tabular-nums">
              {tableRows.map((row) => {
                const bm = row.best_market_odds;
                const pm = row.pinnacle_odds;
                return (
                  <tr
                    key={`${row.league}-${row.market}`}
                    className={`transition-colors duration-150 hover:bg-white/[0.03] ${
                      row.profitable_market ? "bg-emerald-500/[0.03]" : ""
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
                          ? "text-emerald-300/90"
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
                          ? "text-emerald-300"
                          : (bm.clv_fair_pct ?? 0) < 0
                          ? "text-rose-400/80"
                          : "text-slate-400"
                      }`}
                    >
                      {bm.clv_fair_pct !== null
                        ? `${bm.clv_fair_pct > 0 ? "+" : ""}${bm.clv_fair_pct.toFixed(2)}%`
                        : "—"}
                    </td>
                    <td
                      className={`px-3 py-3 text-end ${
                        row.brier_skill_pct >= 0
                          ? "text-emerald-300/85"
                          : "text-rose-400/80"
                      }`}
                    >
                      {row.brier_skill_pct > 0 ? "+" : ""}
                      {row.brier_skill_pct.toFixed(2)}%
                    </td>
                    <td className="px-4 py-3 text-center font-sans">
                      {row.profitable_market ? (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/35 bg-emerald-500/12 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                          <CheckCircle2 className="h-3 w-3" />
                          {t.statusApproved}
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[10px] font-medium text-slate-400">
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
        <div className="rounded-2xl border border-white/10 bg-[#0B0F19]/80 p-5 shadow-xl backdrop-blur-md sm:p-6">
          <h3 className="text-base font-semibold text-white">
            {t.liveRecordTitle}
          </h3>
          <p className="mt-1 text-xs text-slate-400">{t.liveRecordSubtitle}</p>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-[#090D16]/90 p-3">
              <div className="text-[11px] text-slate-400">{t.settledPicks}</div>
              <div className="mt-1 font-mono text-xl font-bold text-white tabular-nums">
                {st.total_settled_all_time}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#090D16]/90 p-3">
              <div className="text-[11px] text-slate-400">{t.winsLabel}</div>
              <div className="mt-1 font-mono text-xl font-bold text-emerald-400 tabular-nums">
                {st.wins}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#090D16]/90 p-3">
              <div className="text-[11px] text-slate-400">{t.halfWinsLabel}</div>
              <div className="mt-1 font-mono text-xl font-bold text-emerald-300 tabular-nums">
                {st.half_wins}
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#090D16]/90 p-3">
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
                {Object.entries(performance.breakdown_by_league).length === 0 ? (
                  <p className="font-mono text-[11px] text-slate-500">—</p>
                ) : (
                  Object.entries(performance.breakdown_by_league).map(
                    ([lg, rec]) => (
                      <div key={lg} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-200">{lg}</span>
                          <span className="font-mono text-emerald-400 tabular-nums">
                            {rec.hit_rate_percent.toFixed(1)}% ({rec.settled})
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-400"
                            style={{
                              width: `${Math.min(100, Math.max(4, rec.hit_rate_percent))}%`,
                            }}
                          />
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </div>

            <div>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {t.byMarketTitle}
              </h4>
              <div className="space-y-2.5">
                {Object.entries(performance.breakdown_by_market).length === 0 ? (
                  <p className="font-mono text-[11px] text-slate-500">—</p>
                ) : (
                  Object.entries(performance.breakdown_by_market).map(
                    ([mk, rec]) => (
                      <div key={mk} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-200">{mk}</span>
                          <span className="font-mono text-emerald-300 tabular-nums">
                            {rec.hit_rate_percent.toFixed(1)}% ({rec.settled})
                          </span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-300"
                            style={{
                              width: `${Math.min(100, Math.max(4, rec.hit_rate_percent))}%`,
                            }}
                          />
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Methodology Specs */}
        <div className="rounded-2xl border border-white/10 bg-[#0B0F19]/80 p-5 shadow-xl backdrop-blur-md sm:p-6">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-emerald-400" />
            <h3 className="text-base font-semibold text-white">
              {t.methodologyTitle}
            </h3>
          </div>
          <dl className="mt-4 space-y-3 text-xs">
            <div className="rounded-xl border border-white/10 bg-[#090D16]/90 p-3">
              <dt className="text-slate-400">Core Quantitative Model</dt>
              <dd className="mt-1 font-mono text-slate-100">
                {backtest.methodology.model}
              </dd>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-[#090D16]/90 p-3">
                <dt className="text-slate-400">Time Decay (ξ) / xG Weight</dt>
                <dd className="mt-1 font-mono text-emerald-300 tabular-nums">
                  ξ = {backtest.methodology.xi_decay} ·{" "}
                  {(backtest.methodology.xg_weight * 100).toFixed(0)}% xG +{" "}
                  {((1 - backtest.methodology.xg_weight) * 100).toFixed(0)}% Goals
                </dd>
              </div>
              <div className="rounded-xl border border-white/10 bg-[#090D16]/90 p-3">
                <dt className="text-slate-400">Kelly Fraction / Cap</dt>
                <dd className="mt-1 font-mono text-slate-100 tabular-nums">
                  {backtest.methodology.kelly_fraction}x Kelly · Max{" "}
                  {(backtest.methodology.kelly_max_stake * 100).toFixed(0)}%
                </dd>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#090D16]/90 p-3">
              <dt className="text-slate-400">Entry Gate Rule</dt>
              <dd className="mt-1 font-mono text-emerald-300 tabular-nums">
                {backtest.methodology.entry_rule} (DNB Home ≥ 0.70)
              </dd>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#090D16]/90 p-3">
              <dt className="text-slate-400">Zero Data Leakage Protocol</dt>
              <dd className="mt-1 leading-relaxed text-slate-300">
                {backtest.methodology.data_leakage_protection} ·{" "}
                {backtest.methodology.oos_seasons}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Weekly Transparency Archive Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0F19]/80 shadow-xl backdrop-blur-md">
        <div className="flex flex-col gap-2.5 border-b border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Archive className="h-4 w-4 shrink-0 text-emerald-400" />
              <h3 className="text-base font-semibold text-white">
                {t.weeklyArchiveTitle}
              </h3>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              {t.weeklyArchiveSubtitle}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 font-mono text-[11px] text-slate-400 tabular-nums">
            <span className="rounded-md border border-white/10 bg-[#090D16] px-2.5 py-1">
              {t.badgeClosedArchived}:{" "}
              <strong className="text-emerald-300">
                {weeklyArchive?.closed_weeks_count ?? 0}
              </strong>
            </span>
          </div>
        </div>

        {!weeklyArchive?.weeks || weeklyArchive.weeks.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            {t.weeklyArchiveEmpty}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 bg-[#090D16]/75 text-slate-400">
                  <th className="px-4 py-3 text-start font-medium">
                    {t.colMatchweek}
                  </th>
                  <th className="px-3 py-3 text-center font-medium">
                    {t.colWindowStatus}
                  </th>
                  <th className="px-3 py-3 text-end font-medium">
                    {t.colRecord}
                  </th>
                  <th className="px-3 py-3 text-end font-medium">
                    {t.colKellyChange}
                  </th>
                  <th className="px-3 py-3 text-end font-medium">
                    {t.colMinOddsRoi}
                  </th>
                  <th className="px-3 py-3 text-end font-medium">
                    {t.colFlatUnits}
                  </th>
                  <th className="px-3 py-3 text-end font-medium">
                    {t.colClosingRoi}
                  </th>
                  <th className="px-4 py-3 text-center font-medium">
                    {t.colDetails}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] font-mono tabular-nums">
                {weeklyArchive.weeks.map((wk) => {
                  const isClosed = wk.archive_status === "CLOSED_ARCHIVED";
                  const isExpanded = expandedWeekId === wk.matchweek_id;
                  const scaledPct = wk.kelly_bankroll_change_pct * riskMultiplier;
                  const scaledUsd = bankroll * (scaledPct / 100);
                  const sign = scaledPct > 0 ? "+" : scaledPct < 0 ? "-" : "";
                  const pnlColor =
                    wk.settled_picks === 0
                      ? "text-amber-300"
                      : scaledPct > 0
                      ? "text-emerald-400"
                      : scaledPct < 0
                      ? "text-rose-400"
                      : "text-slate-300";

                  return (
                    <React.Fragment key={wk.matchweek_id}>
                      <tr className="transition-colors duration-150 hover:bg-white/[0.03]">
                        <td className="px-4 py-3 text-slate-100">
                          <div className="font-semibold">{wk.label}</div>
                          <div className="text-[10px] text-slate-500">
                            {wk.matchweek_id}
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center font-sans">
                          {isClosed ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/35 bg-emerald-500/12 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-300">
                              <Lock className="h-3 w-3" />
                              {t.badgeClosedArchived}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/35 bg-amber-500/12 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-amber-300">
                              <Clock className="h-3 w-3" />
                              {t.badgeActiveWeek}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-end text-slate-200">
                          {wk.wins}W · {wk.half_wins}HW · {wk.losses}L
                          {wk.pushes > 0 ? ` · ${wk.pushes}P` : ""}
                          {wk.pending_picks > 0 ? (
                            <span className="text-amber-300">
                              {" "}
                              ({wk.pending_picks}Pnd)
                            </span>
                          ) : null}
                        </td>
                        <td className={`px-3 py-3 text-end font-semibold ${pnlColor}`}>
                          {wk.settled_picks > 0 ? (
                            <>
                              {sign}${Math.abs(scaledUsd).toFixed(2)}{" "}
                              <span className="text-[10px] opacity-85">
                                ({sign}
                                {Math.abs(scaledPct).toFixed(2)}%)
                              </span>
                            </>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-3 py-3 text-end text-slate-200">
                          {wk.conservative_min_odds_roi_pct !== null
                            ? `${wk.conservative_min_odds_roi_pct > 0 ? "+" : ""}${wk.conservative_min_odds_roi_pct.toFixed(2)}%`
                            : "—"}
                        </td>
                        <td className="px-3 py-3 text-end text-slate-200">
                          {wk.settled_picks > 0
                            ? `${wk.flat_net_units > 0 ? "+" : ""}${wk.flat_net_units.toFixed(2)}u`
                            : "—"}
                        </td>
                        <td className="px-3 py-3 text-end text-emerald-300">
                          {wk.closing_odds_roi_pct !== null
                            ? `${wk.closing_odds_roi_pct > 0 ? "+" : ""}${wk.closing_odds_roi_pct.toFixed(2)}%`
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-center font-sans">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedWeekId(
                                isExpanded ? null : wk.matchweek_id
                              )
                            }
                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-[#090D16] px-2.5 py-1 text-[11px] font-medium text-slate-300 transition-all duration-200 hover:border-emerald-500/40 hover:text-emerald-300"
                          >
                            <span>
                              {isExpanded ? t.hidePicksBtn : t.viewPicksBtn} (
                              {wk.total_picks})
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </td>
                      </tr>

                      {isExpanded && wk.picks && wk.picks.length > 0 && (
                        <tr className="bg-[#090D16]/90">
                          <td colSpan={8} className="px-4 py-3">
                            <div className="overflow-x-auto rounded-xl border border-white/10">
                              <table className="w-full min-w-[700px] border-collapse text-[11px]">
                                <thead>
                                  <tr className="border-b border-white/10 bg-white/[0.03] text-slate-400">
                                    <th className="px-3 py-2 text-start font-medium">
                                      {t.pickColMatch}
                                    </th>
                                    <th className="px-2.5 py-2 text-center font-medium">
                                      {t.pickColScore}
                                    </th>
                                    <th className="px-2.5 py-2 text-end font-medium">
                                      {t.pickColOdds}
                                    </th>
                                    <th className="px-2.5 py-2 text-end font-medium">
                                      {t.pickColClosing}
                                    </th>
                                    <th className="px-2.5 py-2 text-end font-medium">
                                      {t.pickColStake}
                                    </th>
                                    <th className="px-2.5 py-2 text-center font-medium">
                                      {t.colStatus}
                                    </th>
                                    <th className="px-3 py-2 text-end font-medium">
                                      {t.pickColPnl}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.05] font-mono tabular-nums">
                                  {wk.picks.map((pk, idx) => {
                                    const stColor =
                                      pk.status === "WIN" || pk.status === "HALF WIN"
                                        ? "border-emerald-500/35 bg-emerald-500/12 text-emerald-300"
                                        : pk.status === "LOSS"
                                        ? "border-rose-500/35 bg-rose-500/12 text-rose-300"
                                        : pk.status === "PUSH"
                                        ? "border-white/15 bg-white/[0.05] text-slate-300"
                                        : "border-amber-500/35 bg-amber-500/12 text-amber-300";
                                    return (
                                      <tr
                                        key={`${pk.date}-${pk.home}-${pk.away}-${idx}`}
                                        className="transition-colors duration-150 hover:bg-white/[0.02]"
                                      >
                                        <td className="px-3 py-2.5 font-sans text-slate-200">
                                          <div className="font-medium text-white">
                                            {pk.home}{" "}
                                            <span className="text-slate-500">
                                              vs
                                            </span>{" "}
                                            {pk.away}
                                          </div>
                                          <div className="mt-0.5 font-mono text-[10px] text-slate-400 tabular-nums">
                                            {pk.date.slice(0, 10)} · {pk.league}{" "}
                                            ·{" "}
                                            <span className="text-slate-200">
                                              {pk.market}
                                              {pk.selection_side
                                                ? ` [${pk.selection_side}]`
                                                : ""}
                                            </span>
                                          </div>
                                        </td>
                                        <td className="px-2.5 py-2.5 text-center text-slate-300">
                                          {pk.score || "—"}
                                        </td>
                                        <td className="px-2.5 py-2.5 text-end text-emerald-300">
                                          {pk.min_odds !== null
                                            ? `≥ ${pk.min_odds.toFixed(2)}`
                                            : "—"}
                                        </td>
                                        <td className="px-2.5 py-2.5 text-end text-slate-200">
                                          {pk.closing_odds !== null
                                            ? pk.closing_odds.toFixed(2)
                                            : "—"}
                                        </td>
                                        <td className="px-2.5 py-2.5 text-end text-slate-300">
                                          {(pk.stake_pct * 100).toFixed(2)}%
                                        </td>
                                        <td className="px-2.5 py-2.5 text-center">
                                          <span
                                            className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${stColor}`}
                                          >
                                            {pk.status}
                                          </span>
                                        </td>
                                        <td
                                          className={`px-3 py-2.5 text-end font-semibold ${
                                            pk.conservative_kelly_pnl_pct ===
                                            null
                                              ? "text-slate-500"
                                              : pk.conservative_kelly_pnl_pct > 0
                                              ? "text-emerald-400"
                                              : pk.conservative_kelly_pnl_pct < 0
                                              ? "text-rose-400"
                                              : "text-slate-300"
                                          }`}
                                        >
                                          {pk.conservative_kelly_pnl_pct !== null
                                            ? `${pk.conservative_kelly_pnl_pct > 0 ? "+" : ""}${(
                                                pk.conservative_kelly_pnl_pct *
                                                riskMultiplier
                                              ).toFixed(2)}%`
                                            : "—"}
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
