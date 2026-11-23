export type Locale = "en" | "ar" | "fr";

export interface Dictionary {
  dir: "ltr" | "rtl";
  brandName: string;
  brandSub: string;
  liveSyncBadge: string;
  fallbackBadge: string;
  telegramCta: string;
  shareBtn: string;
  copied: string;
  heroTag: string;
  heroTitle: string;
  heroSubtitle: string;
  lastUpdated: string;
  kpiSignals: string;
  kpiSignalsSub: string;
  kpiLiveHit: string;
  kpiLiveHitSub: string;
  kpiOosRoi: string;
  kpiOosRoiSub: string;
  kpiMaxDd: string;
  kpiMaxDdSub: string;
  kpiClv: string;
  kpiClvSub: string;
  calcTitle: string;
  calcSubtitle: string;
  calcBankrollLabel: string;
  calcModeLabel: string;
  calcModeFull: string;
  calcModeHalf: string;
  calcTotalExposure: string;
  calcExpectedEdge: string;
  signalsTitle: string;
  signalsSubtitle: string;
  filterAllLeagues: string;
  filterAllMarkets: string;
  sortConfidence: string;
  sortKickoff: string;
  sortMinOdds: string;
  noSignals: string;
  calibratedProb: string;
  minOddsLabel: string;
  evSafetyBadge: string;
  verifiedOddsBadge: string;
  suggestedStake: string;
  expectedGoalsLabel: string;
  copySignal: string;
  copiedSignal: string;
  brokerWarning: string;
  auditTitle: string;
  auditSubtitle: string;
  betaBannerTitle: string;
  betaBannerBody: string;
  chartTitle: string;
  chartSubtitle: string;
  chartBestMarket: string;
  chartPinnacle: string;
  chartClv: string;
  tableToggleApproved: string;
  tableToggleAll: string;
  colLeague: string;
  colMarket: string;
  colBets: string;
  colWinRate: string;
  colAvgOdds: string;
  colBestRoi: string;
  colPinRoi: string;
  colMaxDd: string;
  colClv: string;
  colBrier: string;
  colStatus: string;
  statusApproved: string;
  statusFiltered: string;
  liveRecordTitle: string;
  liveRecordSubtitle: string;
  settledPicks: string;
  pendingPicks: string;
  winsLabel: string;
  halfWinsLabel: string;
  lossesLabel: string;
  byLeagueTitle: string;
  byMarketTitle: string;
  methodologyTitle: string;
  footerDisclaimer: string;
  footerRepoLink: string;
  footerTelegramLink: string;
}

export const DICTIONARIES: Record<Locale, Dictionary> = {
  en: {
    dir: "ltr",
    brandName: "AlphaPitch",
    brandSub: "QUANT FOOTBALL TERMINAL",
    liveSyncBadge: "AUTO-SYNC · 15M ISR",
    fallbackBadge: "SNAPSHOT FALLBACK",
    telegramCta: "Telegram Alerts",
    shareBtn: "Share",
    copied: "Link Copied",
    heroTag: "DIXON-COLES MLE · TIME-DECAY xG · PLATT CALIBRATION",
    heroTitle: "Institutional Football Alpha & +EV Signals Terminal",
    heroSubtitle:
      "Zero-leakage quantitative probability engine audited across 14,845 Big-5 European matches (2019–2026) against real closing market lines. Only positive-EV, positive-CLV markets are cleared for live dispatch.",
    lastUpdated: "Engine Sync",
    kpiSignals: "Active +EV Signals",
    kpiSignalsSub: "Approved for upcoming slate",
    kpiLiveHit: "Live Beta Win Rate",
    kpiLiveHitSub: "Real settled match results",
    kpiOosRoi: "Verified OOS ROI",
    kpiOosRoiSub: "Best Market · 2019–2026",
    kpiMaxDd: "Max Drawdown",
    kpiMaxDdSub: "Flat 1u · 758 OOS bets",
    kpiClv: "Pinnacle Fair CLV",
    kpiClvSub: "Beating sharp closing line",
    calcTitle: "Interactive Kelly Bankroll Calculator",
    calcSubtitle:
      "Enter your total betting bankroll to dynamically compute exact dollar stakes across every live signal below.",
    calcBankrollLabel: "Total Bankroll ($ USD)",
    calcModeLabel: "Risk Profile",
    calcModeFull: "Standard (1.0x Suggested)",
    calcModeHalf: "Conservative (0.5x Half)",
    calcTotalExposure: "Total Slate Exposure",
    calcExpectedEdge: "Target +EV Edge (@ Min Odds)",
    signalsTitle: "+EV Live Signals Board",
    signalsSubtitle:
      "Filtered strictly through backtest-approved markets (La Liga, Serie A, EPL DNB). Never take odds below the +6% EV Min Odds floor.",
    filterAllLeagues: "All Leagues",
    filterAllMarkets: "All Markets",
    sortConfidence: "Sort: Calibrated Prob",
    sortKickoff: "Sort: Kickoff Time",
    sortMinOdds: "Sort: Highest Min Odds",
    noSignals: "No approved signals match the selected filter right now.",
    calibratedProb: "Calibrated Prob",
    minOddsLabel: "Min Acceptable Odds",
    evSafetyBadge: "+6% EV Safety",
    verifiedOddsBadge: "Verified Market",
    suggestedStake: "Suggested Stake",
    expectedGoalsLabel: "Model xG",
    copySignal: "Copy Pick",
    copiedSignal: "Copied",
    brokerWarning:
      "Execution Rule: Only enter when your sportsbook offers decimal odds >= Min Acceptable Odds (incorporates +6% safety margin over Platt-calibrated fair odds).",
    auditTitle: "Verified Audit & Out-of-Sample Track Record",
    auditSubtitle:
      "Full transparency: strict walk-forward backtest (2019–2026) against football-data.co.uk Best Market & Pinnacle closing odds, plus live 2026/2027 settlement ledger.",
    betaBannerTitle: "Live Beta Track Record · Open Scientific Tracking",
    betaBannerBody:
      "AlphaPitch operates as an open quantitative research terminal. Historical ROI figures come from strict out-of-sample walk-forward testing with zero look-ahead leakage (2018 warmup excluded). Live 2026/27 ledger results are settled automatically via ESPN & football-data feeds. Financial ROI is only reported when verified bookmaker prices are logged.",
    chartTitle: "Verified Alpha Breakdown — ROI % & Pinnacle CLV % by Elite Market",
    chartSubtitle:
      "Comparing Best Market Flat ROI %, Pinnacle Opening ROI %, and Pinnacle Fair CLV % across the 6 production-cleared markets (2019–2026 OOS).",
    chartBestMarket: "Best Market ROI %",
    chartPinnacle: "Pinnacle Opening ROI %",
    chartClv: "Pinnacle Fair CLV %",
    tableToggleApproved: "Elite Approved (6)",
    tableToggleAll: "All Big-5 Tested (25)",
    colLeague: "League",
    colMarket: "Market",
    colBets: "Bets",
    colWinRate: "Win %",
    colAvgOdds: "Avg Odds",
    colBestRoi: "Best ROI",
    colPinRoi: "Pinnacle ROI",
    colMaxDd: "Max DD",
    colClv: "Fair CLV",
    colBrier: "Brier Skill",
    colStatus: "Status",
    statusApproved: "LIVE",
    statusFiltered: "EXCLUDED",
    liveRecordTitle: "Live 2026/2027 Season Settlement Ledger",
    liveRecordSubtitle:
      "Automated match-by-match verification synced from the autonomous backend engine.",
    settledPicks: "Settled Picks",
    pendingPicks: "Pending Picks",
    winsLabel: "Wins",
    halfWinsLabel: "Half Wins",
    lossesLabel: "Losses",
    byLeagueTitle: "Settled Accuracy by League",
    byMarketTitle: "Settled Accuracy by Market",
    methodologyTitle: "Quantitative Methodology & Anti-Leakage Controls",
    footerDisclaimer:
      "For quantitative research and informational analysis only. Past out-of-sample performance does not guarantee future returns. Bet responsibly.",
    footerRepoLink: "Backend Engine (GitHub)",
    footerTelegramLink: "Join Telegram Alerts Bot",
  },
  ar: {
    dir: "rtl",
    brandName: "AlphaPitch",
    brandSub: "منصة التحليل الكمي الرياضي",
    liveSyncBadge: "تحديث تلقائي · كل 15 دقيقة",
    fallbackBadge: "نسخة احتياطية محلية",
    telegramCta: "تنبيهات تيليغرام",
    shareBtn: "مشاركة",
    copied: "تم النسخ",
    heroTag: "DIXON-COLES MLE · معامل الزمن xG · معايرة PLATT",
    heroTitle: "منصة التحليل الرياضي الكمي وإشارات القيمة الموجبة (+EV)",
    heroSubtitle:
      "محرك احتمالات كمّي خالٍ من تسرب البيانات ومُدقَّق عبر 14,845 مباراة في الدوريات الأوروبية الخمس الكبرى (2019–2026) ضد أسعار الإغلاق الحقيقية. لا يُسمح بالبث الحي إلا للأسواق المثبتة بربحية موجبة وقيمة إغلاق متفوقة.",
    lastUpdated: "آخر مزامنة",
    kpiSignals: "إشارات الجولة المعتمدة",
    kpiSignalsSub: "فرص مستوفية للفلتر الكمي",
    kpiLiveHit: "دقة التسويات الحية",
    kpiLiveHitSub: "نتائج مباريات فعلية مسوّاة",
    kpiOosRoi: "عائد الباك-تست الموثق",
    kpiOosRoiSub: "Best Market · مواسم 2019–2026",
    kpiMaxDd: "أقصى تراجع (Max DD)",
    kpiMaxDdSub: "رهان ثابت 1u · 758 صفقة",
    kpiClv: "قيمة الإغلاق (Pinnacle CLV)",
    kpiClvSub: "تفوّق حقيقي على خط الإغلاق",
    calcTitle: "حاسبة إدارة رأس المال التفاعلية (Kelly Bankroll)",
    calcSubtitle:
      "أدخل إجمالي رأس مالك لتحديث قيمة الرهان بالدولار تلقائياً لكل إشارة حية في اللوحة أدناه.",
    calcBankrollLabel: "إجمالي رأس المال ($ USD)",
    calcModeLabel: "ملف المخاطرة",
    calcModeFull: "قياسي (1.0x المقترح)",
    calcModeHalf: "متحفظ (0.5x النصف)",
    calcTotalExposure: "إجمالي التعرض للجولة",
    calcExpectedEdge: "القيمة المتوقعة المستهدفة (+EV)",
    signalsTitle: "لوحة إشارات الجولة القادمة (+EV Live Signals)",
    signalsSubtitle:
      "مقتصرة حصرياً على الأسواق النخبوية الرابحة في الاختبار الخلفي (La Liga وSerie A وEPL DNB). يُمنع الدخول بأقل من الحد الأدنى للسعر (+6% أمان).",
    filterAllLeagues: "كل الدوريات",
    filterAllMarkets: "كل الأسواق",
    sortConfidence: "الترتيب: الأعلى ثقة",
    sortKickoff: "الترتيب: موعد المباراة",
    sortMinOdds: "الترتيب: أعلى حد أدنى للسعر",
    noSignals: "لا توجد إشارات معتمدة مطابقة للفلتر المحدد حالياً.",
    calibratedProb: "الاحتمال المعايَر",
    minOddsLabel: "الحد الأدنى للسعر المقبول",
    evSafetyBadge: "+6% أمان EV",
    verifiedOddsBadge: "سعر سوق مؤكد",
    suggestedStake: "حجم الرهان المقترح",
    expectedGoalsLabel: "الأهداف المتوقعة xG",
    copySignal: "نسخ التوصية",
    copiedSignal: "تم النسخ",
    brokerWarning:
      "قاعدة التنفيذ: لا تدخل الصفقة إلا إذا وفّر الوسيط سعراً عشرياً ≥ الحد الأدنى للسعر المقبول (يتضمن هامش أمان +6% فوق السعر العادل المعايَر).",
    auditTitle: "قسم الشفافية والتدقيق العلمي (Verified Audit & Track Record)",
    auditSubtitle:
      "شفافية كاملة: نتائج الاختبار الخلفي الصارم (2019–2026 Out-of-Sample) ضد أسعار السوق الفعلية وإغلاق Pinnacle، مع سجل التسوية الحي لموسم 2026/2027.",
    betaBannerTitle: "سجل تتبع حي مفتوح · Live Beta Track Record",
    betaBannerBody:
      "تعمل منصة AlphaPitch بنظام التتبع العلمي المفتوح. جميع أرقام العائد التاريخي ناتجة عن اختبار Walk-Forward صارم خالٍ من التسرب الزمني (استبعاد 2018 للإحماء). نتائج موسم 2026/2027 تُسوّى تلقائياً عبر بيانات ESPN وfootball-data، ولا يُحسب عائد مالي حي إلا عند تسجيل أسعار سوق مؤكدة.",
    chartTitle: "توزيع الألفا الموثق — العائد (ROI%) وقيمة الإغلاق (CLV%) للأسواق النخبوية",
    chartSubtitle:
      "مقارنة عائد أفضل سعر سوق مع عائد افتتاح Pinnacle وقيمة الإغلاق العادلة عبر الأزواج الستة المعتمدة للإنتاج (2019–2026).",
    chartBestMarket: "عائد Best Market %",
    chartPinnacle: "عائد Pinnacle %",
    chartClv: "قيمة إغلاق Pinnacle CLV %",
    tableToggleApproved: "النخبة المعتمدة (6)",
    tableToggleAll: "جميع أسواق Big-5 المختبرة (25)",
    colLeague: "الدوري",
    colMarket: "السوق",
    colBets: "الفرص",
    colWinRate: "الفوز%",
    colAvgOdds: "متوسط السعر",
    colBestRoi: "عائد السوق",
    colPinRoi: "عائد Pinnacle",
    colMaxDd: "أقصى تراجع",
    colClv: "قيمة CLV",
    colBrier: "مهارة Brier",
    colStatus: "الحالة",
    statusApproved: "نشط",
    statusFiltered: "مستبعد",
    liveRecordTitle: "سجل التسويات الحية لموسم 2026/2027",
    liveRecordSubtitle:
      "مطابقة تلقائية للنتائج الفعلية متزامنة مباشرة مع المحرك الخلفي على GitHub.",
    settledPicks: "صفقات مسوّاة",
    pendingPicks: "صفقات معلّقة",
    winsLabel: "فوز",
    halfWinsLabel: "نصف فوز",
    lossesLabel: "خسارة",
    byLeagueTitle: "الدقة المسوّاة حسب الدوري",
    byMarketTitle: "الدقة المسوّاة حسب السوق",
    methodologyTitle: "المنهجية الكمية وضوابط منع تسرب البيانات",
    footerDisclaimer:
      "لأغراض البحث الكمي والتحليل المعلوماتي فقط. الأداء التاريخي خارج العينة لا يضمن عوائد مستقبلية مماثلة.",
    footerRepoLink: "مستودع المحرك الخلفي (GitHub)",
    footerTelegramLink: "الاشتراك في بوت تنبيهات تيليغرام",
  },
  fr: {
    dir: "ltr",
    brandName: "AlphaPitch",
    brandSub: "TERMINAL QUANT FOOTBALL",
    liveSyncBadge: "SYNC AUTO · ISR 15M",
    fallbackBadge: "SNAPSHOT LOCAL",
    telegramCta: "Alertes Telegram",
    shareBtn: "Partager",
    copied: "Lien copié",
    heroTag: "DIXON-COLES MLE · xG DÉCROISSANCE · CALIBRATION PLATT",
    heroTitle: "Terminal Quantitatif Football Alpha & Signaux +EV",
    heroSubtitle:
      "Moteur probabiliste sans fuite de données audité sur 14 845 matchs du Big-5 européen (2019–2026) face aux cotes réelles de clôture. Seuls les marchés rentables à CLV positive sont activés en production.",
    lastUpdated: "Sync Moteur",
    kpiSignals: "Signaux +EV Actifs",
    kpiSignalsSub: "Approuvés pour la journée",
    kpiLiveHit: "Taux de Réussite Live",
    kpiLiveHitSub: "Résultats réels réglés",
    kpiOosRoi: "ROI Hors-Échantillon",
    kpiOosRoiSub: "Best Market · 2019–2026",
    kpiMaxDd: "Drawdown Max",
    kpiMaxDdSub: "Mise fixe 1u · 758 paris",
    kpiClv: "CLV Pinnacle Juste",
    kpiClvSub: "Surperformance clôture",
    calcTitle: "Calculateur de Bankroll Kelly Interactif",
    calcSubtitle:
      "Saisissez votre capital total pour calculer instantanément la mise exacte en dollars pour chaque signal.",
    calcBankrollLabel: "Capital Total ($ USD)",
    calcModeLabel: "Profil de Risque",
    calcModeFull: "Standard (1.0x Suggéré)",
    calcModeHalf: "Conservateur (0.5x Moitié)",
    calcTotalExposure: "Exposition Totale Journée",
    calcExpectedEdge: "Avantage +EV Cible",
    signalsTitle: "Tableau des Signaux Live +EV",
    signalsSubtitle:
      "Filtré exclusivement sur les marchés validés par backtest (La Liga, Serie A, EPL DNB). Ne jamais entrer sous la Cote Min (+6% EV).",
    filterAllLeagues: "Toutes Ligues",
    filterAllMarkets: "Tous Marchés",
    sortConfidence: "Tri : Probabilité Calibrée",
    sortKickoff: "Tri : Coup d'Envoi",
    sortMinOdds: "Tri : Cote Min Max",
    noSignals: "Aucun signal approuvé ne correspond à ce filtre.",
    calibratedProb: "Probabilité Calibrée",
    minOddsLabel: "Cote Minimale Requise",
    evSafetyBadge: "+6% Sécurité EV",
    verifiedOddsBadge: "Cote Vérifiée",
    suggestedStake: "Mise Suggérée",
    expectedGoalsLabel: "xG Modèle",
    copySignal: "Copier",
    copiedSignal: "Copié",
    brokerWarning:
      "Règle d'exécution : N'entrez que si votre bookmaker propose une cote >= Cote Minimale Requise (inclut +6% de marge de sécurité au-dessus de la cote juste).",
    auditTitle: "Audit Vérifié & Historique Hors-Échantillon",
    auditSubtitle:
      "Transparence totale : backtest walk-forward strict (2019–2026) face aux cotes réelles Best Market & Pinnacle, plus registre live 2026/2027.",
    betaBannerTitle: "Live Beta Track Record · Suivi Scientifique Ouvert",
    betaBannerBody:
      "AlphaPitch fonctionne en suivi scientifique ouvert. Les performances historiques proviennent d'un walk-forward strict sans fuite temporelle (saison 2018 exclue). Le registre 2026/27 est réglé automatiquement via ESPN & football-data.",
    chartTitle: "Performance Vérifiée — ROI % & CLV Pinnacle % par Marché Élite",
    chartSubtitle:
      "Comparaison ROI Best Market, ROI Ouverture Pinnacle et CLV Pinnacle sur les 6 marchés retenus en production (2019–2026).",
    chartBestMarket: "ROI Best Market %",
    chartPinnacle: "ROI Pinnacle %",
    chartClv: "CLV Pinnacle %",
    tableToggleApproved: "Élite Approuvée (6)",
    tableToggleAll: "Tout le Big-5 Testé (25)",
    colLeague: "Ligue",
    colMarket: "Marché",
    colBets: "Paris",
    colWinRate: "Réussite%",
    colAvgOdds: "Cote Moy",
    colBestRoi: "ROI Marché",
    colPinRoi: "ROI Pinnacle",
    colMaxDd: "DD Max",
    colClv: "CLV Juste",
    colBrier: "Brier Skill",
    colStatus: "Statut",
    statusApproved: "ACTIF",
    statusFiltered: "EXCLU",
    liveRecordTitle: "Registre Live de la Saison 2026/2027",
    liveRecordSubtitle:
      "Règlement automatique synchronisé directement avec le moteur GitHub.",
    settledPicks: "Paris Réglés",
    pendingPicks: "En Attente",
    winsLabel: "Gagnés",
    halfWinsLabel: "Demi-Gagnés",
    lossesLabel: "Perdus",
    byLeagueTitle: "Précision par Ligue",
    byMarketTitle: "Précision par Marché",
    methodologyTitle: "Méthodologie Quantitative & Anti-Fuite",
    footerDisclaimer:
      "À des fins de recherche quantitative et d'analyse uniquement. Les performances passées ne garantissent pas les résultats futurs.",
    footerRepoLink: "Moteur Backend (GitHub)",
    footerTelegramLink: "Rejoindre le Bot Telegram",
  },
};
