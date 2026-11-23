# AlphaPitch Terminal — Quantitative Football Alpha & +EV Terminal

Institutional-grade **Next.js (App Router) + TypeScript + Tailwind CSS** web terminal connected automatically (zero-maintenance 15-minute ISR) to the autonomous quantitative engine in [`75nn12345872168/football-betting-autoloop`](https://github.com/75nn12345872168/football-betting-autoloop).

## Key Features
- **Zero-Maintenance Automated Data Layer:** Pulls `predictions_latest.json`, `performance_summary.json`, and `backtest_verified_stats.json` directly from GitHub Raw API (`revalidate: 900`) with built-in local fallbacks.
- **Dark Financial Terminal UI:** Engineered for clarity (`#090D16` / `#111827` / Emerald `#10B981` / Cyan `#06B6D4`) with full **EN / AR (RTL) / FR** internationalization.
- **Interactive Kelly Bankroll Calculator:** Real-time `$` position sizing & expected edge calculation across every upcoming `+EV` signal.
- **Verified Audit & Track Record:** Strict out-of-sample (2019–2026) Big-5 backtest matrix (`+7.95%` Best Market ROI, `+7.15%` Pinnacle ROI, `+0.56%` Fair CLV, `5.61%` Max Drawdown), Recharts visualizations, and live 2026/2027 settlement ledger.
- **Global SEO Ready:** Full `Metadata`, `OpenGraph`, `Schema.org JSON-LD` (`SoftwareApplication` + `Dataset`), `sitemap.ts`, and `robots.ts`.

## Local Development
```bash
npm install
npm run dev
```

## Production Build
```bash
npm run typecheck
npm run build
```

## One-Click Deploy on Vercel
Import `https://github.com/75nn12345872168/alpha-pitch-terminal` in [Vercel](https://vercel.com/new) — no environment variables or backend database required.
