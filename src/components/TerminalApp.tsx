"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Archive,
  ArrowUpRight,
  Calculator,
  Check,
  ChevronDown,
  Clock,
  Copy,
  ExternalLink,
  Filter,
  Globe,
  Info,
  Send,
  Share2,
  Shield,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";
import type {
  PredictionSignal,
  TerminalBundle,
  WeeklyPerformanceEntry,
} from "@/lib/types";
import { DICTIONARIES, type Locale } from "@/lib/i18n";
import { GLOBAL_BOOKMAKERS } from "@/config/bookmakers";
import { AuditSection } from "./AuditSection";

const TELEGRAM_BOT_URL = "https://t.me/mom123_daily_bot";
const BACKEND_REPO_URL =
  "https://github.com/75nn12345872168/football-betting-autoloop";

interface TerminalAppProps {
  bundle: TerminalBundle;
}

function formatUtcStamp(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return `${d.toISOString().slice(0, 16).replace("T", " ")} UTC`;
  } catch {
    return iso;
  }
}

function leagueBadgeColor(league: string): string {
  switch (league) {
    case "La Liga":
      return "border-amber-500/40 bg-amber-500/10 text-amber-300";
    case "Serie A":
      return "border-cyan-500/40 bg-cyan-500/10 text-cyan-300";
    case "EPL":
      return "border-violet-500/40 bg-violet-500/10 text-violet-300";
    case "Bundesliga":
      return "border-rose-500/40 bg-rose-500/10 text-rose-300";
    default:
      return "border-emerald-500/40 bg-emerald-500/10 text-emerald-300";
  }
}

export function TerminalApp({ bundle }: TerminalAppProps) {
  const [locale, setLocale] = useState<Locale>("en");
  const [bankroll, setBankroll] = useState<number>(1000);
  const [riskMultiplier, setRiskMultiplier] = useState<number>(1.0);
  const [selectedLeague, setSelectedLeague] = useState<string>("ALL");
  const [selectedMarket, setSelectedMarket] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"confidence" | "kickoff" | "odds">(
    "confidence"
  );
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [openBookmakerId, setOpenBookmakerId] = useState<string | null>(null);
  const signalsGridRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        signalsGridRef.current &&
        !signalsGridRef.current.contains(e.target as Node)
      ) {
        setOpenBookmakerId(null);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenBookmakerId(null);
    };
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  const t = DICTIONARIES[locale];
  const { predictions, performance, backtest, weeklyArchive, dataSource } = bundle;
  const transparencyBanner =
    predictions.transparency_banner ??
    weeklyArchive?.transparency_banner ??
    performance.transparency_banner;

  const leaguesInSlate = useMemo(() => {
    return Array.from(
      new Set(predictions.predictions.map((p) => p.league))
    ).sort();
  }, [predictions.predictions]);

  const marketsInSlate = useMemo(() => {
    return Array.from(
      new Set(predictions.predictions.map((p) => p.market))
    ).sort();
  }, [predictions.predictions]);

  const filteredSignals = useMemo(() => {
    const list = predictions.predictions.filter((s) => {
      if (selectedLeague !== "ALL" && s.league !== selectedLeague) return false;
      if (selectedMarket !== "ALL" && s.market !== selectedMarket) return false;
      return true;
    });
    return [...list].sort((a, b) => {
      if (sortBy === "kickoff") return a.date.localeCompare(b.date);
      if (sortBy === "odds") {
        const oa = a.min_odds ?? a.market_odds;
        const ob = b.min_odds ?? b.market_odds;
        return ob - oa;
      }
      return b.p_calibrated - a.p_calibrated;
    });
  }, [predictions.predictions, selectedLeague, selectedMarket, sortBy]);

  const safeBankroll = Number.isFinite(bankroll) && bankroll > 0 ? bankroll : 0;

  const totalStakePct = useMemo(() => {
    return filteredSignals.reduce(
      (acc, s) => acc + s.stake_kelly * riskMultiplier,
      0
    );
  }, [filteredSignals, riskMultiplier]);

  const totalStakeUsd = safeBankroll * totalStakePct;
  const targetEdgeUsd = useMemo(() => {
    return filteredSignals.reduce((acc, s) => {
      const stakeUsd = safeBankroll * s.stake_kelly * riskMultiplier;
      const evFrac = Math.max(0, s.ev_percent / 100);
      return acc + stakeUsd * evFrac;
    }, 0);
  }, [filteredSignals, safeBankroll, riskMultiplier]);

  const handleSharePage = async () => {
    const shareUrl =
      typeof window !== "undefined"
        ? window.location.href
        : "https://alpha-pitch-terminal.vercel.app";
    const shareText = `AlphaPitch Terminal — Verified +${backtest.profitable_selection_best_market.flat_roi_pct.toFixed(
      2
    )}% OOS Football Alpha & +EV Signals (${predictions.count} live picks)`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "AlphaPitch Quantitative Terminal",
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // fall through to clipboard
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(`${shareText} — ${shareUrl}`);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2200);
    }
  };

  const handleCopySignal = async (s: PredictionSignal, idx: number) => {
    const stakeUsd = safeBankroll * s.stake_kelly * riskMultiplier;
    const minOdd = (s.min_odds ?? s.market_odds).toFixed(2);
    const text = `[AlphaPitch +EV] ${s.league} | ${s.home} vs ${s.away} (${s.date.slice(
      0,
      10
    )}) | ${s.market}${s.selection_side ? ` [${s.selection_side}]` : ""} | Prob ${(
      s.p_calibrated * 100
    ).toFixed(1)}% | Min Odds >= ${minOdd} (+6% EV) | Stake: $${stakeUsd.toFixed(
      2
    )}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setCopiedId(`${s.home}-${s.away}-${idx}`);
      setTimeout(() => setCopiedId(null), 1800);
    }
  };

  const profBest = backtest.profitable_selection_best_market;
  const profPin = backtest.profitable_selection_pinnacle;

  const renderWeekStatusBadge = (status: string) => {
    const up = status.toUpperCase();
    if (up === "PROFIT") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-300">
          <TrendingUp className="h-3 w-3" />
          {t.weekStatusProfit}
        </span>
      );
    }
    if (up === "LOSS") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/15 px-2.5 py-0.5 font-mono text-[10px] font-bold text-rose-300">
          <TrendingDown className="h-3 w-3" />
          {t.weekStatusLoss}
        </span>
      );
    }
    if (up === "BREAKEVEN") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-600 bg-slate-800 px-2.5 py-0.5 font-mono text-[10px] font-bold text-slate-300">
          {t.weekStatusBreakeven}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 font-mono text-[10px] font-bold text-amber-300">
        <Clock className="h-3 w-3" />
        {t.weekStatusPending}
      </span>
    );
  };

  const renderWeekPnlValues = (wk: WeeklyPerformanceEntry) => {
    const scaledPct = wk.kelly_bankroll_change_pct * riskMultiplier;
    const scaledUsd = safeBankroll * (scaledPct / 100);
    const sign = scaledPct > 0 ? "+" : scaledPct < 0 ? "-" : "";
    const absUsd = Math.abs(scaledUsd);
    const absPct = Math.abs(scaledPct);
    const color =
      wk.settled_picks === 0
        ? "text-amber-300"
        : scaledPct > 0
        ? "text-emerald-400"
        : scaledPct < 0
        ? "text-rose-400"
        : "text-slate-200";
    return {
      usdLabel: `${sign}$${absUsd.toFixed(2)}`,
      pctLabel: `${sign}${absPct.toFixed(2)}%`,
      color,
    };
  };

  return (
    <div
      dir={t.dir}
      className={`min-h-screen ${
        locale === "ar" ? "[font-family:var(--font-cairo),sans-serif]" : ""
      }`}
    >
      {/* Top Institutional Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#090D16]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-500/15 shadow-lg shadow-emerald-500/10">
              <Zap className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white">
                  {t.brandName}
                </span>
                <span className="hidden rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-300 sm:inline-block">
                  v4
                </span>
              </div>
              <p className="font-mono text-[10px] tracking-widest text-slate-400">
                {t.brandSub}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Live Sync Indicator */}
            <div
              className={`hidden items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-medium md:inline-flex ${
                dataSource === "github-live"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-amber-500/30 bg-amber-500/10 text-amber-300"
              }`}
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              {dataSource === "github-live" ? t.liveSyncBadge : t.fallbackBadge}
            </div>

            {/* Language Switcher */}
            <div className="inline-flex items-center rounded-lg border border-slate-700/80 bg-[#111827] p-0.5 text-xs">
              <Globe className="mx-1.5 h-3.5 w-3.5 text-slate-400" />
              {(["en", "ar", "fr"] as Locale[]).map((lng) => (
                <button
                  key={lng}
                  type="button"
                  onClick={() => setLocale(lng)}
                  className={`rounded-md px-2 py-1 font-mono text-[11px] font-semibold uppercase transition ${
                    locale === lng
                      ? "bg-emerald-500 text-slate-950"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {lng}
                </button>
              ))}
            </div>

            {/* Share Button */}
            <button
              type="button"
              onClick={handleSharePage}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-[#111827] px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-500 hover:text-white"
            >
              {shareCopied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Share2 className="h-3.5 w-3.5 text-cyan-400" />
              )}
              <span>{shareCopied ? t.copied : t.shareBtn}</span>
            </button>

            {/* Telegram CTA */}
            <a
              href={TELEGRAM_BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 px-3.5 py-1.5 text-xs font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:brightness-110"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{t.telegramCta}</span>
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6">
        {/* Hero Header */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-800/90 bg-gradient-to-br from-[#111827] via-[#0d1424] to-[#090D16] p-6 shadow-2xl sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-[11px] font-medium text-emerald-300">
                <Shield className="h-3.5 w-3.5" />
                <span>{t.heroTag}</span>
              </div>
              <h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-4xl">
                {t.heroTitle}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
                {t.heroSubtitle}
              </p>
            </div>
            <div className="flex flex-col items-start gap-2 lg:items-end">
              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-700/80 bg-[#090D16]/90 px-3.5 py-2 font-mono text-xs text-slate-300">
                <Clock className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-slate-400">{t.lastUpdated}:</span>
                <span className="text-white">
                  {formatUtcStamp(predictions.generated_at)}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {predictions.approved_leagues.map((lg) => (
                  <span
                    key={lg}
                    className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${leagueBadgeColor(
                      lg
                    )}`}
                  >
                    {lg}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* (A) Live KPI Ribbon */}
        <section aria-label="Live Quantitative KPIs">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-2xl border border-slate-800/80 bg-[#111827]/90 p-4 shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{t.kpiSignals}</span>
                <Zap className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="mt-2 font-mono text-3xl font-bold text-white tabular-nums">
                {predictions.count}
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                {t.kpiSignalsSub}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-[#111827]/90 p-4 shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{t.kpiLiveHit}</span>
                <ArrowUpRight className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="mt-2 font-mono text-3xl font-bold text-cyan-300 tabular-nums">
                {performance.settlement.hit_rate_percent.toFixed(1)}%
              </div>
              <div className="mt-1 font-mono text-[11px] text-slate-400 tabular-nums">
                {performance.settlement.wins}W ·{" "}
                {performance.settlement.half_wins}HW ·{" "}
                {performance.settlement.losses}L ({t.kpiLiveHitSub})
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 shadow-lg">
              <div className="flex items-center justify-between text-xs text-emerald-200/80">
                <span>{t.kpiOosRoi}</span>
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="mt-2 font-mono text-3xl font-bold text-emerald-400 tabular-nums">
                +{profBest.flat_roi_pct.toFixed(2)}%
              </div>
              <div className="mt-1 font-mono text-[11px] text-emerald-200/70 tabular-nums">
                Pinnacle: +{profPin.flat_roi_pct.toFixed(2)}% · +
                {profBest.flat_profit_units.toFixed(1)}u
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-[#111827]/90 p-4 shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{t.kpiMaxDd}</span>
                <TrendingDown className="h-4 w-4 text-cyan-400" />
              </div>
              <div className="mt-2 font-mono text-3xl font-bold text-white tabular-nums">
                {profBest.flat_max_dd_pct.toFixed(2)}%
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                {t.kpiMaxDdSub}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-[#111827]/90 p-4 shadow-lg">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{t.kpiClv}</span>
                <Shield className="h-4 w-4 text-violet-400" />
              </div>
              <div className="mt-2 font-mono text-3xl font-bold text-violet-300 tabular-nums">
                {profBest.clv_fair_pct !== null
                  ? `${profBest.clv_fair_pct > 0 ? "+" : ""}${profBest.clv_fair_pct.toFixed(2)}%`
                  : "—"}
              </div>
              <div className="mt-1 font-mono text-[11px] text-slate-400 tabular-nums">
                Raw CLV: +{profBest.clv_raw_pct?.toFixed(2) ?? "0.00"}%
              </div>
            </div>
          </div>
        </section>

        {/* (C) Interactive Kelly Bankroll Calculator */}
        <section
          aria-label="Kelly Bankroll Calculator"
          className="rounded-2xl border border-slate-800/90 bg-[#111827]/95 p-5 shadow-xl"
        >
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-md">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                <Calculator className="h-4 w-4" />
                <span>KELLY POSITION SIZING</span>
              </div>
              <h2 className="mt-1 text-lg font-bold text-white">
                {t.calcTitle}
              </h2>
              <p className="mt-1 text-xs text-slate-400">{t.calcSubtitle}</p>
            </div>

            <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Bankroll Input */}
              <div className="rounded-xl border border-slate-700/80 bg-[#090D16] p-3">
                <label
                  htmlFor="bankroll-input"
                  className="block text-[11px] font-medium text-slate-400"
                >
                  {t.calcBankrollLabel}
                </label>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="font-mono text-sm font-bold text-emerald-400">
                    $
                  </span>
                  <input
                    id="bankroll-input"
                    type="number"
                    min={10}
                    step={50}
                    value={bankroll}
                    onChange={(e) => setBankroll(Number(e.target.value))}
                    className="w-full bg-transparent font-mono text-lg font-bold text-white outline-none tabular-nums"
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {[500, 1000, 5000, 10000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setBankroll(preset)}
                      className={`rounded px-1.5 py-0.5 font-mono text-[10px] transition ${
                        bankroll === preset
                          ? "bg-emerald-500/25 text-emerald-300"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      ${preset.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Risk Profile Toggle */}
              <div className="rounded-xl border border-slate-700/80 bg-[#090D16] p-3">
                <span className="block text-[11px] font-medium text-slate-400">
                  {t.calcModeLabel}
                </span>
                <div className="mt-2 flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRiskMultiplier(1.0)}
                    className={`rounded-lg border px-2.5 py-1.5 text-start text-[11px] font-medium transition ${
                      riskMultiplier === 1.0
                        ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                        : "border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {t.calcModeFull}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRiskMultiplier(0.5)}
                    className={`rounded-lg border px-2.5 py-1.5 text-start text-[11px] font-medium transition ${
                      riskMultiplier === 0.5
                        ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-300"
                        : "border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {t.calcModeHalf}
                  </button>
                </div>
              </div>

              {/* Total Slate Exposure */}
              <div className="rounded-xl border border-slate-700/80 bg-[#090D16] p-3">
                <span className="block text-[11px] font-medium text-slate-400">
                  {t.calcTotalExposure}
                </span>
                <div className="mt-2 font-mono text-2xl font-bold text-white tabular-nums">
                  ${totalStakeUsd.toFixed(2)}
                </div>
                <div className="mt-1 font-mono text-xs text-cyan-300 tabular-nums">
                  {(totalStakePct * 100).toFixed(2)}% of bankroll
                </div>
              </div>

              {/* Target Expected Edge */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3">
                <span className="block text-[11px] font-medium text-emerald-200/80">
                  {t.calcExpectedEdge}
                </span>
                <div className="mt-2 font-mono text-2xl font-bold text-emerald-400 tabular-nums">
                  +${targetEdgeUsd.toFixed(2)}
                </div>
                <div className="mt-1 font-mono text-xs text-emerald-300/80 tabular-nums">
                  +{predictions.safety_margin_pct.toFixed(0)}% EV Floor
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* (B) +EV Live Signals Board */}
        <section id="signals" className="space-y-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                <Zap className="h-4 w-4" />
                <span>LIVE GAMEWEEK SIGNALS</span>
              </div>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">
                {t.signalsTitle}
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-slate-400">
                {t.signalsSubtitle}
              </p>
            </div>

            {/* Interactive Filters & Sort */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-[#111827] px-2.5 py-1.5 text-xs text-slate-300">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <select
                  aria-label="Filter by league"
                  value={selectedLeague}
                  onChange={(e) => setSelectedLeague(e.target.value)}
                  className="bg-transparent text-xs font-medium text-white outline-none"
                >
                  <option value="ALL" className="bg-[#111827]">
                    {t.filterAllLeagues}
                  </option>
                  {leaguesInSlate.map((lg) => (
                    <option key={lg} value={lg} className="bg-[#111827]">
                      {lg}
                    </option>
                  ))}
                </select>
              </div>

              <div className="inline-flex items-center rounded-lg border border-slate-700/80 bg-[#111827] px-2.5 py-1.5 text-xs text-slate-300">
                <select
                  aria-label="Filter by market"
                  value={selectedMarket}
                  onChange={(e) => setSelectedMarket(e.target.value)}
                  className="bg-transparent text-xs font-medium text-white outline-none"
                >
                  <option value="ALL" className="bg-[#111827]">
                    {t.filterAllMarkets}
                  </option>
                  {marketsInSlate.map((mk) => (
                    <option key={mk} value={mk} className="bg-[#111827]">
                      {mk}
                    </option>
                  ))}
                </select>
              </div>

              <div className="inline-flex items-center rounded-lg border border-slate-700/80 bg-[#111827] px-2.5 py-1.5 text-xs text-slate-300">
                <select
                  aria-label="Sort signals"
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as "confidence" | "kickoff" | "odds"
                    )
                  }
                  className="bg-transparent text-xs font-medium text-white outline-none"
                >
                  <option value="confidence" className="bg-[#111827]">
                    {t.sortConfidence}
                  </option>
                  <option value="kickoff" className="bg-[#111827]">
                    {t.sortKickoff}
                  </option>
                  <option value="odds" className="bg-[#111827]">
                    {t.sortMinOdds}
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Live Weekly P&L Transparency Banner */}
          {transparencyBanner && (
            <div className="rounded-2xl border border-slate-800/90 bg-gradient-to-br from-[#111827] via-[#0e1526] to-[#090D16] p-4 shadow-xl sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  <span>{t.weeklyBannerTitle}</span>
                </div>
                <span className="rounded-md border border-slate-700/80 bg-[#090D16] px-2.5 py-1 font-mono text-[10px] text-slate-400">
                  {t.weeklyWindowRule}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Current Matchweek Card */}
                {transparencyBanner.current_week && (() => {
                  const cur = transparencyBanner.current_week;
                  const pnl = renderWeekPnlValues(cur);
                  return (
                    <div className="rounded-xl border border-slate-800 bg-[#090D16]/90 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            {t.currentWeekLabel}
                          </div>
                          <div className="mt-0.5 font-mono text-xs text-slate-300 tabular-nums">
                            {cur.label}
                          </div>
                        </div>
                        {renderWeekStatusBadge(cur.status)}
                      </div>

                      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
                        <div className="flex items-baseline gap-2.5 font-mono tabular-nums">
                          <span className={`text-2xl font-bold ${pnl.color}`}>
                            {cur.settled_picks > 0 ? pnl.usdLabel : "$0.00"}
                          </span>
                          <span className={`text-sm font-semibold ${pnl.color}`}>
                            ({cur.settled_picks > 0 ? pnl.pctLabel : "0.00%"})
                          </span>
                        </div>
                        <div className="font-mono text-xs text-slate-400 tabular-nums">
                          {cur.wins}W · {cur.half_wins}HW · {cur.losses}L
                          {cur.pushes > 0 ? ` · ${cur.pushes}P` : ""} ·{" "}
                          <span className="text-amber-300">
                            {cur.pending_picks} {t.weekStatusPending}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-800/80 pt-2.5 font-mono text-[11px] text-slate-400 tabular-nums">
                        <span className="rounded bg-slate-900 px-2 py-0.5">
                          {t.minOddsRoiLabel}:{" "}
                          <strong className="text-slate-200">
                            {cur.conservative_min_odds_roi_pct !== null
                              ? `${cur.conservative_min_odds_roi_pct > 0 ? "+" : ""}${cur.conservative_min_odds_roi_pct.toFixed(2)}%`
                              : "—"}
                          </strong>
                        </span>
                        <span className="rounded bg-slate-900 px-2 py-0.5">
                          {t.flatUnitsLabel}:{" "}
                          <strong className="text-slate-200">
                            {cur.settled_picks > 0
                              ? `${cur.flat_net_units > 0 ? "+" : ""}${cur.flat_net_units.toFixed(2)}u`
                              : "0.00u"}
                          </strong>
                        </span>
                        {cur.closing_odds_roi_pct !== null && (
                          <span className="rounded bg-slate-900 px-2 py-0.5">
                            {t.closingRoiLabel}:{" "}
                            <strong className="text-cyan-300">
                              {cur.closing_odds_roi_pct > 0 ? "+" : ""}
                              {cur.closing_odds_roi_pct.toFixed(2)}%
                            </strong>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Last Closed & Archived Matchweek Card */}
                <div className="rounded-xl border border-slate-800 bg-[#090D16]/90 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        <Archive className="h-3.5 w-3.5 text-cyan-400" />
                        <span>{t.lastArchivedWeekLabel}</span>
                      </div>
                      <div className="mt-0.5 font-mono text-xs text-slate-300 tabular-nums">
                        {transparencyBanner.last_closed_week
                          ? transparencyBanner.last_closed_week.label
                          : "—"}
                      </div>
                    </div>
                    {transparencyBanner.last_closed_week ? (
                      renderWeekStatusBadge(
                        transparencyBanner.last_closed_week.status
                      )
                    ) : (
                      <span className="rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-slate-400">
                        {t.badgeClosedArchived}: 0
                      </span>
                    )}
                  </div>

                  {transparencyBanner.last_closed_week ? (() => {
                    const last = transparencyBanner.last_closed_week;
                    const pnl = renderWeekPnlValues(last);
                    return (
                      <>
                        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
                          <div className="flex items-baseline gap-2.5 font-mono tabular-nums">
                            <span className={`text-2xl font-bold ${pnl.color}`}>
                              {pnl.usdLabel}
                            </span>
                            <span
                              className={`text-sm font-semibold ${pnl.color}`}
                            >
                              ({pnl.pctLabel})
                            </span>
                          </div>
                          <div className="font-mono text-xs text-slate-400 tabular-nums">
                            {last.wins}W · {last.half_wins}HW · {last.losses}L
                            {last.pushes > 0 ? ` · ${last.pushes}P` : ""}
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-800/80 pt-2.5 font-mono text-[11px] text-slate-400 tabular-nums">
                          <span className="rounded bg-slate-900 px-2 py-0.5">
                            {t.minOddsRoiLabel}:{" "}
                            <strong className="text-slate-200">
                              {last.conservative_min_odds_roi_pct !== null
                                ? `${last.conservative_min_odds_roi_pct > 0 ? "+" : ""}${last.conservative_min_odds_roi_pct.toFixed(2)}%`
                                : "—"}
                            </strong>
                          </span>
                          <span className="rounded bg-slate-900 px-2 py-0.5">
                            {t.flatUnitsLabel}:{" "}
                            <strong className="text-slate-200">
                              {last.flat_net_units > 0 ? "+" : ""}
                              {last.flat_net_units.toFixed(2)}u
                            </strong>
                          </span>
                          <span className="rounded bg-slate-900 px-2 py-0.5">
                            {t.closingRoiLabel}:{" "}
                            <strong className="text-cyan-300">
                              {last.closing_odds_roi_pct !== null
                                ? `${last.closing_odds_roi_pct > 0 ? "+" : ""}${last.closing_odds_roi_pct.toFixed(2)}%`
                                : "—"}
                            </strong>
                          </span>
                        </div>
                      </>
                    );
                  })() : (
                    <div className="mt-4 rounded-lg border border-dashed border-slate-800 bg-slate-900/40 px-3 py-3 text-xs text-slate-400">
                      {t.noArchivedWeekYet}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 flex items-start gap-2 text-[11px] text-slate-400">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-400" />
                <span>{t.minOddsBasisNote}</span>
              </div>
            </div>
          )}

          {filteredSignals.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-[#111827]/80 p-10 text-center text-sm text-slate-400">
              {t.noSignals}
            </div>
          ) : (
            <div
              ref={signalsGridRef}
              className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
            >
              {filteredSignals.map((sig, idx) => {
                const probPct = sig.p_calibrated * 100;
                const minOdds = sig.min_odds ?? sig.market_odds;
                const stakePct = sig.stake_kelly * riskMultiplier;
                const stakeUsd = safeBankroll * stakePct;
                const cardId = `${sig.home}-${sig.away}-${idx}`;
                const xgTotal =
                  sig.expected_goals.home + sig.expected_goals.away || 1;
                const homeXgShare = (sig.expected_goals.home / xgTotal) * 100;

                return (
                  <article
                    key={cardId}
                    className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-[#111827]/95 p-5 shadow-lg transition hover:border-emerald-500/40 hover:shadow-emerald-500/5"
                  >
                    <div>
                      {/* Card Top Row */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`rounded-md border px-2 py-0.5 text-[11px] font-semibold ${leagueBadgeColor(
                            sig.league
                          )}`}
                        >
                          {sig.league}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                          {sig.date.slice(0, 16)} UTC
                        </span>
                      </div>

                      {/* Matchup */}
                      <div className="mt-4">
                        <h3 className="text-lg font-bold tracking-tight text-white">
                          {sig.home}{" "}
                          <span className="font-normal text-slate-500">vs</span>{" "}
                          {sig.away}
                        </h3>
                        {/* Market & Selection Pill */}
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/35 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-200">
                            {sig.market}
                            {sig.selection_side ? ` · ${sig.selection_side}` : ""}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-lg border px-2 py-1 font-mono text-[10px] font-semibold ${
                              sig.price_type === "verified"
                                ? "border-cyan-400/40 bg-cyan-500/15 text-cyan-300"
                                : "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                            }`}
                          >
                            {sig.price_type === "verified"
                              ? t.verifiedOddsBadge
                              : t.evSafetyBadge}
                          </span>
                        </div>
                      </div>

                      {/* Expected Goals Split */}
                      <div className="mt-4 rounded-xl border border-slate-800 bg-[#090D16] p-3">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">
                            {t.expectedGoalsLabel}
                          </span>
                          <span className="font-mono font-semibold text-slate-200 tabular-nums">
                            {sig.expected_goals.home.toFixed(2)} —{" "}
                            {sig.expected_goals.away.toFixed(2)}
                          </span>
                        </div>
                        <div className="mt-1.5 flex h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                          <div
                            className="bg-emerald-400"
                            style={{ width: `${homeXgShare}%` }}
                          />
                          <div
                            className="bg-cyan-500"
                            style={{ width: `${100 - homeXgShare}%` }}
                          />
                        </div>
                      </div>

                      {/* Probability & Min Odds Grid */}
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-slate-800 bg-[#090D16] p-3">
                          <div className="text-[11px] text-slate-400">
                            {t.calibratedProb}
                          </div>
                          <div className="mt-1 font-mono text-2xl font-bold text-white tabular-nums">
                            {probPct.toFixed(1)}%
                          </div>
                          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                              style={{ width: `${Math.min(100, probPct)}%` }}
                            />
                          </div>
                        </div>

                        <div className="rounded-xl border border-emerald-500/35 bg-emerald-950/25 p-3">
                          <div className="text-[11px] text-emerald-200/80">
                            {t.minOddsLabel}
                          </div>
                          <div className="mt-1 font-mono text-2xl font-bold text-emerald-400 tabular-nums">
                            ≥ {minOdds.toFixed(2)}
                          </div>
                          <div className="mt-1 font-mono text-[10px] text-emerald-300/80 tabular-nums">
                            EV +{sig.ev_percent.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer: Dynamic Kelly Stake + Copy + Execute Pick Dropdown */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-3.5">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-400">
                          {t.suggestedStake}
                        </div>
                        <div className="flex items-baseline gap-2 font-mono tabular-nums">
                          <span className="text-base font-bold text-cyan-300">
                            ${stakeUsd.toFixed(2)}
                          </span>
                          <span className="text-xs text-slate-400">
                            ({(stakePct * 100).toFixed(2)}%)
                          </span>
                        </div>
                      </div>

                      <div className="relative flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopySignal(sig, idx)}
                          title={t.copySignal}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-[#090D16] px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-slate-500 hover:text-white"
                        >
                          {copiedId === cardId ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                          <span className="hidden sm:inline">
                            {copiedId === cardId ? t.copiedSignal : t.copySignal}
                          </span>
                        </button>

                        <button
                          type="button"
                          aria-expanded={openBookmakerId === cardId}
                          onClick={() =>
                            setOpenBookmakerId((prev) =>
                              prev === cardId ? null : cardId
                            )
                          }
                          className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/50 bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/25 hover:text-emerald-200"
                        >
                          <span>{t.executePickBtn}</span>
                          <ChevronDown
                            className={`h-3.5 w-3.5 transition-transform ${
                              openBookmakerId === cardId ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {openBookmakerId === cardId && (
                          <div
                            className={`absolute bottom-full z-30 mb-2 w-64 rounded-xl border border-slate-700/90 bg-[#0B1120] p-2 shadow-2xl shadow-black/70 ${
                              t.dir === "rtl" ? "left-0" : "right-0"
                            }`}
                          >
                            <div className="rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-1.5 text-[11px] font-medium text-emerald-300">
                              {t.executeMinOddsReminder}{" "}
                              <span className="font-mono font-bold tabular-nums">
                                {minOdds.toFixed(2)}
                              </span>
                            </div>
                            <div className="mt-2 px-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                              {t.executeDropdownHeader}
                            </div>
                            <div className="mt-1 space-y-1">
                              {GLOBAL_BOOKMAKERS.map((bm) => (
                                <a
                                  key={bm.id}
                                  href={bm.affiliateUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => setOpenBookmakerId(null)}
                                  className="flex items-center justify-between rounded-lg px-2.5 py-2 text-xs transition hover:bg-slate-800/80"
                                >
                                  <div>
                                    <div className="font-semibold text-white">
                                      {bm.name}
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                      {bm.tag}
                                    </div>
                                  </div>
                                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Execution Rule Notice */}
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/25 bg-amber-950/15 px-4 py-3 text-xs text-amber-200/90">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <p>{t.brokerWarning}</p>
          </div>
        </section>

        {/* (D) Verified Audit & Track Record */}
        <AuditSection
          backtest={backtest}
          performance={performance}
          weeklyArchive={weeklyArchive}
          bankroll={safeBankroll}
          riskMultiplier={riskMultiplier}
          t={t}
        />
      </main>

      {/* Institutional Footer */}
      <footer className="mt-14 border-t border-slate-800/80 bg-[#070a12]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Zap className="h-4 w-4 text-emerald-400" />
              <span>AlphaPitch Quantitative Terminal</span>
            </div>
            <p className="mt-1.5 text-xs text-slate-400">{t.footerDisclaimer}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <a
              href={BACKEND_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#111827] px-3 py-2 font-medium text-slate-300 transition hover:border-slate-600 hover:text-white"
            >
              <ExternalLink className="h-3.5 w-3.5 text-cyan-400" />
              <span>{t.footerRepoLink}</span>
            </a>
            <a
              href={TELEGRAM_BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 font-semibold text-emerald-300 transition hover:bg-emerald-500/20"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{t.footerTelegramLink}</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
