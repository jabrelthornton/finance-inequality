// ============================================================
//  CONTENT FILE
//  All user-facing copy lives here.
//  Edit this file to update text without touching any JSX.
// ============================================================

export const CONTENT = {

  // ── Hero ──────────────────────────────────────────────────
  hero: {
    eyebrow:   "Data Investigation · U.S. Economic Inequality",
    headline:  "The Persistent",
    headlineAccent: "Gap",
    subheading:
      "Six decades after the Civil Rights Act, Black Americans earn significantly less " +
      "and hold a fraction of the wealth of white Americans. This is what the data shows.",
  },

  // ── Hero Stat Cards ───────────────────────────────────────
  statCards: {
    incomeRatio: {
      label: "Black-to-white income ratio (2022)",
      sub:   "per $1 earned by white households",
    },
    wealthGap: {
      label: (multiplier) => `White families hold ${multiplier}× more wealth`,
      cardLabel: "Median wealth gap (2022)",
    },
    wealthChange: {
      label: "Wealth ratio change since 1989",
      sub:   "The gap has barely moved in 33 years",
    },
  },

  // ── Section 1: Income ─────────────────────────────────────
  income: {
    sectionTag: "U.S. Census Bureau, Table H-5",
    title:      "Median Household Income Has Stalled for Decades",
    body:
      "Adjusted for inflation, the income gap between Black and white households has remained " +
      "stubbornly wide since 1967. Despite periods of progress, Black households earn roughly " +
      "65 cents for every dollar earned by white households — nearly unchanged from 55 years ago.",
    bodyAccentPhrase: "65 cents",
    tabs: [
      ["gap",   "Dollar Gap"],
      ["ratio", "Earnings Ratio"],
      ["both",  "Both Lines"],
    ],
    ratioTooltipLabel: (value) => `Black earns ${value}¢ per white $1`,
    referenceLineLabel: "Equal pay",
    legendLabels: {
      white: "White households",
      black: "Black households",
    },
    dataNote:
      "Source: U.S. Census Bureau, Historical Income Tables: Households, Table H-5 — Adjusted to 2022 dollars (CPI-U-RS)",
  },

  // ── Section 2: Wealth Bar ─────────────────────────────────
  wealthBar: {
    sectionTag: "Federal Reserve Survey of Consumer Finances",
    title:      "The Wealth Gap Is Even Starker — and Growing",
    body: (whiteAmt, blackAmt, blackRatio, mult2022, mult1989) =>
      `Wealth — not income — determines financial security across generations. In 2022, the median ` +
      `white family held ${whiteAmt} in wealth. The median Black family held ${blackAmt} — just ` +
      `${blackRatio}¢ per white dollar. The white-to-Black multiplier in 2022 is ${mult2022}×, ` +
      `barely improved from ${mult1989}× in 1989.`,
    legendLabels: {
      white: "White families",
      black: "Black families",
    },
    dataNote:
      "Source: Federal Reserve Board, Survey of Consumer Finances (SCF) — Median family net worth, 2022 dollars",
  },

  // ── Section 3: Wealth Ratio ───────────────────────────────
  wealthRatio: {
    sectionTag: "Derived from Federal Reserve SCF",
    title:      "The Ratio Has Barely Moved",
    body:
      "Even as absolute wealth has grown for both groups, Black families' share of white wealth " +
      "has changed little. The 2008 financial crisis — which hit Black homeowners hardest — " +
      "erased gains made in the early 2000s.",
    tooltipLabel: (value) => `Black wealth = ${value}¢ per white $1`,
    dataNote:
      "Black wealth as cents per dollar of white wealth — 100¢ would represent full equality",
  },

  // ── Section 4: Personal Comparison ───────────────────────
  personalComparison: {
    sectionTag:  "Personal Calculator",
    title:       "Where Do You Stand?",
    body:        (year) =>
      `Enter your estimated net worth — assets minus debts — to see how you compare to the ` +
      `median Black and white family in ${year}.`,
    inputPlaceholder: "0",
    compareButton:    "Compare",
    statLabels: {
      black:      (above) => above ? "above median Black wealth"  : "of median Black wealth",
      white:      (above) => above ? "above median white wealth"  : "of median white wealth",
      gapLabel:   (year)  => `racial wealth gap (${year})`,
    },
    contextMessages: {
      aboveWhite: (whiteAmt) =>
        `Your net worth exceeds the median white family's wealth of ${whiteAmt}. ` +
        `You are in a position of significant financial advantage relative to both medians.`,
      aboveBlack: (blackAmt, whiteAmt, gap) =>
        `Your net worth is above the median Black family (${blackAmt}) but below the median ` +
        `white family (${whiteAmt}). The gap between those two medians is ${gap}.`,
      belowBoth: (blackAmt, whiteAmt, gap) =>
        `Your net worth is below both medians. The median Black family holds ${blackAmt} and ` +
        `the median white family holds ${whiteAmt} — a gap of ${gap}.`,
    },
    dataNote: (year, blackAmt, whiteAmt) =>
      `Comparison uses ${year} SCF median net worth — Black families: ${blackAmt} · White families: ${whiteAmt}`,
    chartLabels: {
      you:          "You",
      medianBlack:  "Median Black",
      medianWhite:  "Median White",
    },
    validation: {
      empty:      "Please enter a net worth value.",
      hasLetters: "Net worth must be a number — no letters allowed.",
      invalid:    "That doesn't look like a valid number. Try something like 50000 or $50,000.",
      negative:   "Negative net worth is valid in real life, but this calculator only supports values of $0 or more.",
      tooLarge:   "Please enter a value under $5 trillion.",
    },
  },

  // ── Why It Persists ───────────────────────────────────────
  whyItPersists: {
    eyebrow: "Why the gap persists",
    items: [
      {
        title: "Historical exclusion",
        body:
          "Redlining, GI Bill exclusions, and wealth-stripping policies in the 20th century " +
          "blocked Black families from building intergenerational wealth.",
      },
      {
        title: "Compounding disadvantage",
        body:
          "Wealth grows on itself. Families with more assets accumulate more through investment " +
          "returns, inheritance, and home equity.",
      },
      {
        title: "Income ceiling",
        body:
          "Even with better income today, earning less for decades means less saved, invested, " +
          "and passed down — the gap compounds over generations.",
      },
    ],
  },

  // ── About & Contact ───────────────────────────────────────
  about: {
    eyebrow:  "About",
    name:     "Jabre Thornton",
    tagline:  "Software Developer · Father",
    body1:
      "I built this site because the racial wealth and income gap is one of the most significant " +
      "and persistent injustices in American economic life — and I wanted to put real numbers " +
      "to it. Data has a way of cutting through the noise.",
    body2:
      "I'm a software developer and stay-at-home dad. This project is personal. The struggle " +
      "Black Americans have faced economically is not abstract to me, and I hope the data here " +
      "makes it less abstract for others too.",
  },

  contact: {
    eyebrow:     "Contact",
    title:       "Questions or Feedback?",
    body:
      "If you have questions about the data, want to report an error, or just want to " +
      "reach out — I'd love to hear from you.",
    email:       "jabrelthornton@gmail.com",
    emailLabel:  "jabrelthornton@gmail.com",
  },

  // ── Footer ────────────────────────────────────────────────
  footer: {
    sourcesLabel: "Data Sources",
    sources: [
      "U.S. Census Bureau — Historical Income Tables (Table H-5), 1967–2022, CPI-U-RS adjusted",
      "Federal Reserve Board — Survey of Consumer Finances (SCF), 1989–2022, median family net worth",
    ],
    citation:
      'Derenoncourt et al. (2022), "Wealth of Two Nations: The U.S. Racial Wealth Gap, 1860–2020"',
  },

  // ── Shared UI ─────────────────────────────────────────────
  loading: "Loading data…",
  tooltips: {
    incomeGap:    "Income Gap",
    wealthRatio:  (value) => `Black wealth = ${value}¢ per white $1`,
    incomeRatio:  (value) => `Black earns ${value}¢ per white $1`,
  },
};
