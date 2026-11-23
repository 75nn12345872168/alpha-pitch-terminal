import React from "react";
import { fetchTerminalBundle } from "@/lib/dataFetcher";
import { TerminalApp } from "@/components/TerminalApp";

export const revalidate = 900; // 15-minute ISR

export default async function HomePage() {
  const bundle = await fetchTerminalBundle();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://alpha-pitch-terminal.vercel.app";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "AlphaPitch Terminal",
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web",
        url: siteUrl,
        description:
          "Quantitative football alpha & +EV probability terminal powered by Dixon-Coles MLE, time-decayed xG, and Platt calibration across European Big-5 leagues.",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "Dataset",
        name: "AlphaPitch Out-of-Sample Big-5 European Football Closing Odds Backtest (2019–2026)",
        description: `Verified walk-forward quantitative backtest across 14,845 Big-5 European football matches achieving +${bundle.backtest.profitable_selection_best_market.flat_roi_pct.toFixed(
          2
        )}% Best Market ROI and +${bundle.backtest.profitable_selection_pinnacle.flat_roi_pct.toFixed(
          2
        )}% Pinnacle ROI with ${bundle.backtest.profitable_selection_best_market.flat_max_dd_pct.toFixed(
          2
        )}% Max Drawdown.`,
        url: "https://github.com/75nn12345872168/football-betting-autoloop",
        creator: {
          "@type": "Organization",
          name: "AlphaPitch Quantitative Research",
        },
        temporalCoverage: "2018-08/2026-11",
        license: "https://opensource.org/licenses/MIT",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TerminalApp bundle={bundle} />
    </>
  );
}
