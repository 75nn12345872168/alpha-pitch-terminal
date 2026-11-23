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
import {
  BOOKMAKER_CATEGORIES,
  type BookmakerConfig,
} from "@/config/bookmakers";
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

export function TerminalApp({ bundle }: TerminalAppProps) {
  const [locale, setLocale] = useState<Locale>("en");
  const [bankroll, setBankroll] = useState<number>(1000);
  const [riskMultiplier, setRiskMultiplier] = useState<number>(1.0);
  const [selectedLeague, setSelectedLeague] = useState<string>("ALL");
  const [selectedMarket, setSelectedMarket] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<
    "confidence" | "kickoff" | "odds" | "live_ev"
  >("confidence");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [openBookmakerId, setOpenBookmakerId] = useState<string | null>(null);
  const [executeToast, setExecuteToast] = useState<{
    match: string;
    bookmaker: string;
  } | null>(null);
  const signalsGridRef = useRef<HTMLDivElement | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      if (sortBy === "live_ev") {
        const hasA = a.live_ev_pct !== null && a.live_ev_pct !== undefined;
        const hasB = b.live_ev_pct !== null && b.live_ev_pct !== undefined;
        if (hasA !== hasB) return hasA ? -1 : 1;
        const eva = hasA ? Number(a.live_ev_pct) : a.ev_percent;
        const evb = hasB ? Number(b.live_ev_pct) : b.ev_percent;
        return evb - eva;
      }
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

  const handleExecuteBookmaker = (
    s: PredictionSignal,
    bm: BookmakerConfig
  ) => {
    const matchSummary = `${s.home} vs ${s.away} | ${s.market}${
      s.selection_side ? ` [${s.selection_side}]` : ""
    }`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(matchSummary).catch(() => {
        // clipboard permission optional
      });
    }
    setOpenBookmakerId(null);
    setExecuteToast({ match: matchSummary, bookmaker: bm.name });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setExecuteToast(null), 3200);

    if (typeof window !== "undefined") {
      window.open(bm.affiliateUrl, "_blank", "noopener,noreferrer");
    }
  };

  const profBest = backtest.profitable_selection_best_market;
  const profPin = backtest.profitable_selection_pinnacle;

  const renderWeekStatusBadge = (status: string) => {
    const up = status.toUpperCase();
    if (up === "PROFIT") {
      return (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/35 bg-emerald-500/12 px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-emerald-300">
          <TrendingUp className="h-3 w-3" />
          {t.weekStatusProfit}
        </span>
      );
    }
    if (up === "LOSS") {
      return (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-rose-500/35 bg-rose-500/12 px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-rose-300">
          <TrendingDown className="h-3 w-3" />
          {t.weekStatusLoss}
        </span>
      );
    }
    if (up === "BREAKEVEN") {
      return (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-slate-300">
          {t.weekStatusBreakeven}
        </span>
      );
    }
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-500/35 bg-amber-500/12 px-2.5 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-amber-300">
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
      className={`min-h-screen w-full overflow-x-clip bg-[#090D16] text-slate-100 ${
        locale === "ar" ? "[font-family:var(--font-cairo),sans-serif]" : ""
      }`}
    >
      {/* Top Institutional Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#090D16]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-500/35 bg-emerald-500/12 shadow-lg shadow-emerald-500/10">
              <Zap className="h-4.5 w-4.5 text-emerald-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-base font-bold tracking-tight text-white">
                  {t.brandName}
                </span>
                <span className="rounded border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-300">
                  v4
                </span>
              </div>
              <p className="truncate font-mono text-[10px] tracking-[0.16em] text-slate-400">
                {t.brandSub}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Live Sync Indicator with Calm Emerald Heartbeat */}
            <div
              className={`hidden items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] font-medium tracking-wide md:inline-flex ${
                dataSource === "github-live"
                  ? "border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-300"
                  : "border-amber-500/30 bg-amber-500/[0.08] text-amber-300"
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${
                    dataSource === "github-live"
                      ? "bg-emerald-400"
                      : "bg-amber-400"
                  }`}
                />
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${
                    dataSource === "github-live"
                      ? "bg-emerald-400"
                      : "bg-amber-400"
                  }`}
                />
              </span>
              <span>
                {dataSource === "github-live" ? t.liveSyncBadge : t.fallbackBadge}
              </span>
            </div>

            {/* Language Switcher */}
            <div className="inline-flex items-center rounded-lg border border-white/10 bg-[#0B0F19]/90 p-0.5 text-xs">
              <Globe className="mx-1.5 h-3.5 w-3.5 text-slate-400" />
              {(["en", "ar", "fr"] as Locale[]).map((lng) => (
                <button
                  key={lng}
                  type="button"
                  onClick={() => setLocale(lng)}
                  className={`rounded-md px-2 py-1 font-mono text-[11px] font-semibold uppercase transition-all duration-200 ${
                    locale === lng
                      ? "bg-emerald-500 text-slate-950 shadow-sm"
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
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0B0F19]/90 px-3 py-1.5 text-xs font-medium text-slate-200 transition-all duration-200 hover:border-emerald-500/40 hover:text-white"
            >
              {shareCopied ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Share2 className="h-3.5 w-3.5 text-slate-400" />
              )}
              <span className="hidden sm:inline">
                {shareCopied ? t.copied : t.shareBtn}
              </span>
            </button>

            {/* Telegram CTA */}
            <a
              href={TELEGRAM_BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-1.5 text-xs font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:bg-emerald-400"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{t.telegramCta}</span>
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-12 px-4 py-8 sm:space-y-14 sm:px-6 sm:py-12 lg:px-8">
        {/* Hero Header */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0B0F19]/80 p-6 shadow-2xl backdrop-blur-md sm:p-9">
          <div className="pointer-events-none absolute -top-24 end-0 h-56 w-56 rounded-full bg-emerald-500/[0.07] blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 max-w-3xl">
              <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/[0.08] px-3 py-1 font-mono text-[10px] font-medium tracking-wider text-emerald-300 sm:text-[11px]">
                <Shield className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{t.heroTag}</span>
              </div>
              <h1 className="mt-4 text-2xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                {t.heroTitle}
              </h1>
              <p className="mt-3.5 text-sm leading-relaxed text-slate-300/90 sm:text-base">
                {t.heroSubtitle}
              </p>
            </div>
            <div className="flex flex-col items-start gap-2.5 lg:items-end">
              <div className="inline-flex max-w-full items-center gap-2 rounded-xl border border-white/10 bg-[#090D16]/90 px-3.5 py-2 font-mono text-xs text-slate-300 tabular-nums">
                <Clock className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <span className="text-slate-400">{t.lastUpdated}:</span>
                <span className="truncate text-white">
                  {formatUtcStamp(predictions.generated_at)}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {predictions.approved_leagues.map((lg) => (
                  <span
                    key={lg}
                    className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-0.5 font-mono text-[11px] font-medium text-slate-300"
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
            <div className="rounded-2xl border border-white/10 bg-[#0B0F19]/80 p-5 shadow-lg backdrop-blur-md transition-all duration-200 hover:border-emerald-500/40">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{t.kpiSignals}</span>
                <Zap className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="mt-3 font-mono text-3xl font-bold text-white tabular-nums">
                {predictions.count}
              </div>
              <div className="mt-1.5 text-[11px] text-slate-400">
                {t.kpiSignalsSub}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0B0F19]/80 p-5 shadow-lg backdrop-blur-md transition-all duration-200 hover:border-emerald-500/40">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{t.kpiLiveHit}</span>
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </div>
              <div className="mt-3 font-mono text-3xl font-bold text-white tabular-nums">
                {performance.settlement.hit_rate_percent.toFixed(1)}%
              </div>
              <div className="mt-1.5 font-mono text-[11px] text-slate-400 tabular-nums">
                {performance.settlement.wins}W ·{" "}
                {performance.settlement.half_wins}HW ·{" "}
                {performance.settlement.losses}L
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5 shadow-lg backdrop-blur-md transition-all duration-200 hover:border-emerald-400/50">
              <div className="flex items-center justify-between text-xs text-emerald-200/80">
                <span>{t.kpiOosRoi}</span>
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="mt-3 font-mono text-3xl font-bold text-emerald-400 tabular-nums">
                +{profBest.flat_roi_pct.toFixed(2)}%
              </div>
              <div className="mt-1.5 font-mono text-[11px] text-emerald-200/75 tabular-nums">
                Pinnacle +{profPin.flat_roi_pct.toFixed(2)}% · +
                {profBest.flat_profit_units.toFixed(1)}u
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0B0F19]/80 p-5 shadow-lg backdrop-blur-md transition-all duration-200 hover:border-emerald-500/40">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{t.kpiMaxDd}</span>
                <TrendingDown className="h-4 w-4 text-slate-400" />
              </div>
              <div className="mt-3 font-mono text-3xl font-bold text-white tabular-nums">
                {profBest.flat_max_dd_pct.toFixed(2)}%
              </div>
              <div className="mt-1.5 text-[11px] text-slate-400">
                {t.kpiMaxDdSub}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0B0F19]/80 p-5 shadow-lg backdrop-blur-md transition-all duration-200 hover:border-emerald-500/40 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{t.kpiClv}</span>
                <Shield className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="mt-3 font-mono text-3xl font-bold text-emerald-400 tabular-nums">
                {profBest.clv_fair_pct !== null
                  ? `${profBest.clv_fair_pct > 0 ? "+" : ""}${profBest.clv_fair_pct.toFixed(2)}%`
                  : "—"}
              </div>
              <div className="mt-1.5 font-mono text-[11px] text-slate-400 tabular-nums">
                Raw CLV +{profBest.clv_raw_pct?.toFixed(2) ?? "0.00"}%
              </div>
            </div>
          </div>
        </section>

        {/* (B) Interactive Kelly Bankroll Calculator */}
        <section
          aria-label="Kelly Bankroll Calculator"
          className="rounded-2xl border border-white/10 bg-[#0B0F19]/80 p-5 shadow-xl backdrop-blur-md sm:p-6"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-md">
              <div className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-emerald-400">
                <Calculator className="h-4 w-4" />
                <span>KELLY POSITION SIZING</span>
              </div>
              <h2 className="mt-1.5 text-lg font-bold text-white">
                {t.calcTitle}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">
                {t.calcSubtitle}
              </p>
            </div>

            <div className="grid flex-1 grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              {/* Bankroll Input */}
              <div className="rounded-xl border border-white/10 bg-[#090D16]/90 p-3.5 transition-all duration-200 focus-within:border-emerald-500/50">
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
                    className="w-full min-w-0 bg-transparent font-mono text-lg font-bold text-white outline-none tabular-nums"
                  />
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {[500, 1000, 5000, 10000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setBankroll(preset)}
                      className={`rounded px-1.5 py-0.5 font-mono text-[10px] tabular-nums transition-all duration-200 ${
                        bankroll === preset
                          ? "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40"
                          : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-white"
                      }`}
                    >
                      ${preset.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Risk Profile Toggle */}
              <div className="rounded-xl border border-white/10 bg-[#090D16]/90 p-3.5">
                <span className="block text-[11px] font-medium text-slate-400">
                  {t.calcModeLabel}
                </span>
                <div className="mt-2 flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRiskMultiplier(1.0)}
                    className={`rounded-lg border px-2.5 py-1.5 text-start text-[11px] font-medium transition-all duration-200 ${
                      riskMultiplier === 1.0
                        ? "border-emerald-500/45 bg-emerald-500/15 text-emerald-300"
                        : "border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"
                    }`}
                  >
                    {t.calcModeFull}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRiskMultiplier(0.5)}
                    className={`rounded-lg border px-2.5 py-1.5 text-start text-[11px] font-medium transition-all duration-200 ${
                      riskMultiplier === 0.5
                        ? "border-amber-500/45 bg-amber-500/15 text-amber-300"
                        : "border-white/10 text-slate-400 hover:border-white/20 hover:text-slate-200"
                    }`}
                  >
                    {t.calcModeHalf}
                  </button>
                </div>
              </div>

              {/* Total Slate Exposure */}
              <div className="rounded-xl border border-white/10 bg-[#090D16]/90 p-3.5">
                <span className="block text-[11px] font-medium text-slate-400">
                  {t.calcTotalExposure}
                </span>
                <div className="mt-2 font-mono text-2xl font-bold text-white tabular-nums">
                  ${totalStakeUsd.toFixed(2)}
                </div>
                <div className="mt-1 font-mono text-xs text-slate-400 tabular-nums">
                  {(totalStakePct * 100).toFixed(2)}% of bankroll
                </div>
              </div>

              {/* Target Expected Edge */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5">
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

        {/* (C) +EV Live Signals Board */}
        <section id="signals" className="space-y-6">
          {/* Section Header + Sleek Integrated Filter/Sort Pill Bar */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-widest text-emerald-400">
                <Zap className="h-4 w-4" />
                <span>LIVE GAMEWEEK SIGNALS</span>
              </div>
              <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-white">
                {t.signalsTitle}
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-400">
                {t.signalsSubtitle}
              </p>
            </div>

            {/* Unified Compact Filter & Sort Toolbar */}
            <div className="flex w-full flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-[#0B0F19]/80 p-1.5 backdrop-blur-md lg:w-auto">
              <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg bg-[#090D16]/80 px-2.5 py-1.5 text-xs text-slate-300 sm:flex-initial">
                <Filter className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                <select
                  aria-label="Filter by league"
                  value={selectedLeague}
                  onChange={(e) => setSelectedLeague(e.target.value)}
                  className="w-full min-w-0 bg-transparent text-xs font-medium text-white outline-none"
                >
                  <option value="ALL" className="bg-[#0B0F19]">
                    {t.filterAllLeagues}
                  </option>
                  {leaguesInSlate.map((lg) => (
                    <option key={lg} value={lg} className="bg-[#0B0F19]">
                      {lg}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex min-w-0 flex-1 items-center rounded-lg bg-[#090D16]/80 px-2.5 py-1.5 text-xs text-slate-300 sm:flex-initial">
                <select
                  aria-label="Filter by market"
                  value={selectedMarket}
                  onChange={(e) => setSelectedMarket(e.target.value)}
                  className="w-full min-w-0 bg-transparent text-xs font-medium text-white outline-none"
                >
                  <option value="ALL" className="bg-[#0B0F19]">
                    {t.filterAllMarkets}
                  </option>
                  {marketsInSlate.map((mk) => (
                    <option key={mk} value={mk} className="bg-[#0B0F19]">
                      {mk}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex min-w-0 flex-1 items-center rounded-lg bg-[#090D16]/80 px-2.5 py-1.5 text-xs text-slate-300 sm:flex-initial">
                <select
                  aria-label="Sort signals"
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value as
                        | "confidence"
                        | "kickoff"
                        | "odds"
                        | "live_ev"
                    )
                  }
                  className="w-full min-w-0 bg-transparent text-xs font-medium text-white outline-none"
                >
                  <option value="confidence" className="bg-[#0B0F19]">
                    {t.sortConfidence}
                  </option>
                  <option value="live_ev" className="bg-[#0B0F19]">
                    {t.sortLiveEv}
                  </option>
                  <option value="kickoff" className="bg-[#0B0F19]">
                    {t.sortKickoff}
                  </option>
                  <option value="odds" className="bg-[#0B0F19]">
                    {t.sortMinOdds}
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Live Weekly P&L Transparency Banner */}
          {transparencyBanner && (
            <div className="rounded-2xl border border-white/10 bg-[#0B0F19]/80 p-4 shadow-xl backdrop-blur-md sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Shield className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>{t.weeklyBannerTitle}</span>
                </div>
                <span className="rounded-md border border-white/10 bg-[#090D16]/90 px-2.5 py-1 font-mono text-[10px] text-slate-400 tabular-nums">
                  {t.weeklyWindowRule}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Current Matchweek Card */}
                {transparencyBanner.current_week &&
                  (() => {
                    const cur = transparencyBanner.current_week;
                    const pnl = renderWeekPnlValues(cur);
                    return (
                      <div className="rounded-xl border border-white/10 bg-[#090D16]/90 p-4 transition-all duration-200 hover:border-white/20">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                              {t.currentWeekLabel}
                            </div>
                            <div className="mt-0.5 font-mono text-xs text-slate-300 tabular-nums">
                              {cur.label}
                            </div>
                          </div>
                          {renderWeekStatusBadge(cur.status)}
                        </div>

                        <div className="mt-3.5 flex flex-wrap items-baseline justify-between gap-3">
                          <div className="flex items-baseline gap-2 font-mono tabular-nums">
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

                        <div className="mt-3 flex flex-wrap gap-2 border-t border-white/10 pt-3 font-mono text-[11px] text-slate-400 tabular-nums">
                          <span className="rounded-md border border-white/5 bg-white/[0.03] px-2 py-0.5">
                            {t.minOddsRoiLabel}:{" "}
                            <strong className="text-slate-100">
                              {cur.conservative_min_odds_roi_pct !== null
                                ? `${cur.conservative_min_odds_roi_pct > 0 ? "+" : ""}${cur.conservative_min_odds_roi_pct.toFixed(2)}%`
                                : "—"}
                            </strong>
                          </span>
                          <span className="rounded-md border border-white/5 bg-white/[0.03] px-2 py-0.5">
                            {t.flatUnitsLabel}:{" "}
                            <strong className="text-slate-100">
                              {cur.settled_picks > 0
                                ? `${cur.flat_net_units > 0 ? "+" : ""}${cur.flat_net_units.toFixed(2)}u`
                                : "0.00u"}
                            </strong>
                          </span>
                          {cur.closing_odds_roi_pct !== null && (
                            <span className="rounded-md border border-emerald-500/20 bg-emerald-500/[0.07] px-2 py-0.5">
                              {t.closingRoiLabel}:{" "}
                              <strong className="text-emerald-300">
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
                <div className="rounded-xl border border-white/10 bg-[#090D16]/90 p-4 transition-all duration-200 hover:border-white/20">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        <Archive className="h-3.5 w-3.5 shrink-0 text-slate-400" />
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
                      <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 font-mono text-[10px] font-semibold text-slate-400 tabular-nums">
                        {t.badgeClosedArchived}: 0
                      </span>
                    )}
                  </div>

                  {transparencyBanner.last_closed_week ? (
                    (() => {
                      const last = transparencyBanner.last_closed_week;
                      const pnl = renderWeekPnlValues(last);
                      return (
                        <>
                          <div className="mt-3.5 flex flex-wrap items-baseline justify-between gap-3">
                            <div className="flex items-baseline gap-2 font-mono tabular-nums">
                              <span
                                className={`text-2xl font-bold ${pnl.color}`}
                              >
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
                          <div className="mt-3 flex flex-wrap gap-2 border-t border-white/10 pt-3 font-mono text-[11px] text-slate-400 tabular-nums">
                            <span className="rounded-md border border-white/5 bg-white/[0.03] px-2 py-0.5">
                              {t.minOddsRoiLabel}:{" "}
                              <strong className="text-slate-100">
                                {last.conservative_min_odds_roi_pct !== null
                                  ? `${last.conservative_min_odds_roi_pct > 0 ? "+" : ""}${last.conservative_min_odds_roi_pct.toFixed(2)}%`
                                  : "—"}
                              </strong>
                            </span>
                            <span className="rounded-md border border-white/5 bg-white/[0.03] px-2 py-0.5">
                              {t.flatUnitsLabel}:{" "}
                              <strong className="text-slate-100">
                                {last.flat_net_units > 0 ? "+" : ""}
                                {last.flat_net_units.toFixed(2)}u
                              </strong>
                            </span>
                            <span className="rounded-md border border-white/5 bg-white/[0.03] px-2 py-0.5">
                              {t.closingRoiLabel}:{" "}
                              <strong className="text-emerald-300">
                                {last.closing_odds_roi_pct !== null
                                  ? `${last.closing_odds_roi_pct > 0 ? "+" : ""}${last.closing_odds_roi_pct.toFixed(2)}%`
                                  : "—"}
                              </strong>
                            </span>
                          </div>
                        </>
                      );
                    })()
                  ) : (
                    <div className="mt-4 rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-3.5 py-3 text-xs leading-relaxed text-slate-400">
                      {t.noArchivedWeekYet}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3.5 flex items-start gap-2 text-[11px] leading-relaxed text-slate-400">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400/80" />
                <span>{t.minOddsBasisNote}</span>
              </div>
            </div>
          )}

          {/* Clean Institutional Signal Cards Grid */}
          {filteredSignals.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-[#0B0F19]/80 p-12 text-center text-sm text-slate-400 backdrop-blur-md">
              {t.noSignals}
            </div>
          ) : (
            <div
              ref={signalsGridRef}
              className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
            >
              {filteredSignals.map((sig, idx) => {
                const probPct = sig.p_calibrated * 100;
                const minOdds = sig.min_odds ?? sig.market_odds;
                const stakePct = sig.stake_kelly * riskMultiplier;
                const stakeUsd = safeBankroll * stakePct;
                const cardId = `${sig.home}-${sig.away}-${idx}`;
                const isCopied = copiedId === cardId;
                const isMenuOpen = openBookmakerId === cardId;
                const hasLiveOdds =
                  sig.live_best_odds !== null &&
                  sig.live_best_odds !== undefined &&
                  sig.live_best_odds > 1.0;
                const liveBestOdds = hasLiveOdds
                  ? Number(sig.live_best_odds)
                  : null;
                const liveEvPct =
                  hasLiveOdds &&
                  sig.live_ev_pct !== null &&
                  sig.live_ev_pct !== undefined
                    ? Number(sig.live_ev_pct)
                    : liveBestOdds !== null
                    ? Number(((sig.p_calibrated * liveBestOdds - 1) * 100).toFixed(2))
                    : null;
                const isLiveActionable =
                  hasLiveOdds &&
                  (sig.is_live_actionable !== undefined
                    ? Boolean(sig.is_live_actionable)
                    : liveBestOdds !== null && liveBestOdds >= minOdds);

                return (
                  <article
                    key={cardId}
                    className={`group relative flex flex-col justify-between rounded-2xl border bg-[#0B0F19]/85 p-5 shadow-xl backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 ${
                      isLiveActionable
                        ? "border-emerald-500/40 shadow-emerald-500/10 hover:border-emerald-400/70"
                        : "border-white/10 hover:border-emerald-500/40 hover:shadow-emerald-500/10"
                    }`}
                  >
                    <div>
                      {/* Top Meta Row: League + Kickoff */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-0.5 font-mono text-[11px] font-semibold text-slate-200">
                          {sig.league}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                          {sig.date.slice(0, 16)} UTC
                        </span>
                      </div>

                      {/* Hero Matchup + Model xG Scoreline Up Front */}
                      <div className="mt-4 flex items-start justify-between gap-3">
                        <h3 className="min-w-0 text-lg font-bold leading-snug tracking-tight text-white">
                          {sig.home}{" "}
                          <span className="font-normal text-slate-500">vs</span>{" "}
                          {sig.away}
                        </h3>
                        <div className="shrink-0 rounded-lg border border-white/10 bg-[#090D16] px-2.5 py-1 text-end">
                          <div className="text-[9px] font-medium uppercase tracking-wider text-slate-400">
                            {t.expectedGoalsLabel}
                          </div>
                          <div className="font-mono text-xs font-bold text-slate-100 tabular-nums">
                            {sig.expected_goals.home.toFixed(2)} –{" "}
                            {sig.expected_goals.away.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      {/* Market Selection & Live Actionability Badge */}
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-lg border border-white/15 bg-white/[0.05] px-2.5 py-1 text-xs font-semibold text-white">
                          {sig.market}
                          {sig.selection_side ? ` · ${sig.selection_side}` : ""}
                        </span>

                        {hasLiveOdds ? (
                          isLiveActionable ? (
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/55 bg-emerald-500/20 px-2.5 py-1 font-mono text-[10px] font-bold tracking-wide text-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.28)]">
                              <span className="relative flex h-1.5 w-1.5">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                              </span>
                              {t.badgeLiveEvReady}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-lg border border-amber-500/45 bg-amber-500/15 px-2.5 py-1 font-mono text-[10px] font-semibold tracking-wide text-amber-300">
                              <Clock className="h-3 w-3" />
                              {t.badgeBelowMinWait}
                            </span>
                          )
                        ) : (
                          <span className="inline-flex items-center rounded-lg border border-emerald-500/35 bg-emerald-500/12 px-2 py-1 font-mono text-[10px] font-semibold text-emerald-300">
                            {sig.price_type === "verified"
                              ? t.verifiedOddsBadge
                              : t.evSafetyBadge}
                          </span>
                        )}
                      </div>

                      {/* Visual Calibrated Probability Progress Bar */}
                      <div className="mt-4 rounded-xl border border-white/[0.08] bg-[#090D16]/90 px-3.5 py-3">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-[11px] font-medium text-slate-400">
                            {t.calibratedProb}
                          </span>
                          <span className="font-mono text-lg font-bold text-white tabular-nums">
                            {probPct.toFixed(1)}%
                          </span>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/[0.07]">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-300 transition-all duration-300"
                            style={{ width: `${Math.min(100, probPct)}%` }}
                          />
                        </div>
                      </div>

                      {/* Live Best Odds Comparison Strip (when The Odds API live price exists) */}
                      {hasLiveOdds && liveBestOdds !== null && (
                        <div
                          className={`mt-3 flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 ${
                            isLiveActionable
                              ? "border-emerald-500/35 bg-emerald-500/[0.08]"
                              : "border-amber-500/30 bg-amber-500/[0.06]"
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-[10px] font-medium text-slate-400">
                              {t.liveBestOddsLabel}
                            </div>
                            <div className="mt-0.5 flex flex-wrap items-baseline gap-1.5">
                              <span
                                className={`font-mono text-lg font-bold tabular-nums ${
                                  isLiveActionable
                                    ? "text-emerald-400"
                                    : "text-amber-300"
                                }`}
                              >
                                {liveBestOdds.toFixed(2)}
                              </span>
                              {sig.live_best_bookmaker && (
                                <span className="truncate font-mono text-[11px] font-medium text-slate-200">
                                  @ {sig.live_best_bookmaker}
                                </span>
                              )}
                            </div>
                          </div>
                          {sig.live_pinnacle_odds !== null &&
                            sig.live_pinnacle_odds !== undefined && (
                              <div className="shrink-0 text-end">
                                <div className="text-[9px] uppercase tracking-wider text-slate-400">
                                  Pinnacle
                                </div>
                                <div className="font-mono text-xs font-semibold text-slate-200 tabular-nums">
                                  {Number(sig.live_pinnacle_odds).toFixed(2)}
                                </div>
                              </div>
                            )}
                        </div>
                      )}

                      {/* Balanced 3-Metric Financial Micro-Grid (2-Second Decision Read) */}
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-2.5 py-2.5 text-center">
                          <div className="truncate text-[10px] font-medium text-emerald-200/80">
                            {t.minOddsLabel}
                          </div>
                          <div className="mt-1 font-mono text-base font-bold text-emerald-400 tabular-nums sm:text-lg">
                            ≥ {minOdds.toFixed(2)}
                          </div>
                        </div>

                        <div className="rounded-xl border border-white/[0.08] bg-[#090D16]/90 px-2.5 py-2.5 text-center">
                          <div className="truncate text-[10px] font-medium text-slate-400">
                            {hasLiveOdds ? t.liveEvLabel : "EV %"}
                          </div>
                          <div
                            className={`mt-1 font-mono text-base font-bold tabular-nums sm:text-lg ${
                              liveEvPct !== null
                                ? liveEvPct > 0
                                  ? "text-emerald-400"
                                  : liveEvPct < 0
                                  ? "text-rose-400"
                                  : "text-slate-200"
                                : "text-emerald-400"
                            }`}
                          >
                            {liveEvPct !== null
                              ? `${liveEvPct > 0 ? "+" : ""}${liveEvPct.toFixed(1)}%`
                              : `+${sig.ev_percent.toFixed(1)}%`}
                          </div>
                        </div>

                        <div className="rounded-xl border border-white/[0.08] bg-[#090D16]/90 px-2.5 py-2.5 text-center">
                          <div className="truncate text-[10px] font-medium text-slate-400">
                            {t.suggestedStake}
                          </div>
                          <div className="mt-1 font-mono text-base font-bold text-white tabular-nums sm:text-lg">
                            ${stakeUsd.toFixed(0)}
                          </div>
                          <div className="font-mono text-[10px] text-slate-400 tabular-nums">
                            {(stakePct * 100).toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Harmonized Equal-Size Action Buttons */}
                    <div className="relative mt-4 grid grid-cols-2 gap-2.5 border-t border-white/10 pt-4">
                      <button
                        type="button"
                        onClick={() => handleCopySignal(sig, idx)}
                        className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-all duration-200 ${
                          isCopied
                            ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                            : "border-white/10 bg-[#090D16] text-slate-200 hover:border-white/25 hover:text-white"
                        }`}
                      >
                        {isCopied ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-slate-400" />
                        )}
                        <span className="truncate">
                          {isCopied ? `${t.copiedSignal} ✓` : t.copySignal}
                        </span>
                      </button>

                      <button
                        type="button"
                        aria-expanded={isMenuOpen}
                        onClick={() =>
                          setOpenBookmakerId((prev) =>
                            prev === cardId ? null : cardId
                          )
                        }
                        className={`inline-flex h-9 items-center justify-center gap-1 rounded-lg border px-3 text-xs font-semibold transition-all duration-200 ${
                          isLiveActionable
                            ? "border-emerald-400 bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 hover:bg-emerald-400"
                            : hasLiveOdds
                            ? "border-amber-500/35 bg-amber-500/10 text-amber-300 hover:border-amber-400/60 hover:bg-amber-500/20"
                            : "border-emerald-500/45 bg-emerald-500/15 text-emerald-300 hover:border-emerald-400 hover:bg-emerald-500/25 hover:text-emerald-200"
                        }`}
                      >
                        <span className="truncate">{t.executePickBtn}</span>
                        <ChevronDown
                          className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                            isMenuOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isMenuOpen && (
                        <div
                          className={`absolute bottom-full z-30 mb-2 w-72 max-w-[calc(100vw-3rem)] rounded-xl border border-white/15 bg-[#0B0F19]/95 p-2.5 shadow-2xl shadow-black/80 backdrop-blur-xl ${
                            t.dir === "rtl" ? "left-0" : "right-0"
                          }`}
                        >
                          <div className="rounded-lg border border-emerald-500/35 bg-emerald-950/50 px-2.5 py-1.5 text-[11px] font-medium text-emerald-300">
                            {t.executeMinOddsReminder}{" "}
                            <span className="font-mono font-bold tabular-nums">
                              {minOdds.toFixed(2)}
                            </span>
                          </div>

                          <div className="mt-2.5 space-y-2.5">
                            {BOOKMAKER_CATEGORIES.map((group, gIdx) => (
                              <div
                                key={group.id}
                                className={
                                  gIdx > 0
                                    ? "border-t border-white/10 pt-2.5"
                                    : ""
                                }
                              >
                                <div className="px-1.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                  {group.id === "global-crypto"
                                    ? t.bookmakerCatGlobalCrypto
                                    : t.bookmakerCatEuLicensed}
                                </div>
                                <div className="mt-1 space-y-1">
                                  {group.items.map((bm) => (
                                    <button
                                      key={bm.id}
                                      type="button"
                                      onClick={() =>
                                        handleExecuteBookmaker(sig, bm)
                                      }
                                      className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-start text-xs transition-all duration-150 hover:bg-white/[0.06]"
                                    >
                                      <div className="min-w-0">
                                        <div className="font-semibold text-white">
                                          {bm.name}
                                        </div>
                                        <div className="truncate font-mono text-[10px] text-slate-400">
                                          {bm.tag}
                                        </div>
                                      </div>
                                      <ExternalLink className="h-3.5 w-3.5 shrink-0 text-emerald-400/80" />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* Execution Rule Notice (Amber Semantic Alert) */}
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 text-xs leading-relaxed text-amber-200/90">
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
      <footer className="mt-16 border-t border-white/10 bg-[#070A12]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-9 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Zap className="h-4 w-4 text-emerald-400" />
              <span>AlphaPitch Quantitative Terminal</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              {t.footerDisclaimer}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <a
              href={BACKEND_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0B0F19] px-3.5 py-2 font-medium text-slate-300 transition-all duration-200 hover:border-white/25 hover:text-white"
            >
              <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
              <span>{t.footerRepoLink}</span>
            </a>
            <a
              href={TELEGRAM_BOT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/12 px-3.5 py-2 font-semibold text-emerald-300 transition-all duration-200 hover:bg-emerald-500/20"
            >
              <Send className="h-3.5 w-3.5" />
              <span>{t.footerTelegramLink}</span>
            </a>
          </div>
        </div>
      </footer>
      {/* Subtle Floating Copy-Before-Redirect Toast */}
      {executeToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 end-5 z-50 flex max-w-[calc(100vw-2.5rem)] items-start gap-2.5 rounded-xl border border-emerald-500/40 bg-[#0B0F19]/95 px-4 py-3 shadow-2xl shadow-black/70 backdrop-blur-xl"
        >
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <Check className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0 text-xs">
            <div className="font-semibold text-emerald-300">
              {t.matchCopiedToastTitle}
            </div>
            <div className="mt-0.5 truncate font-mono text-[11px] text-slate-200">
              {executeToast.match}
            </div>
            <div className="mt-0.5 text-[10px] text-slate-400">
              {executeToast.bookmaker} · {t.matchCopiedToastSub}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
