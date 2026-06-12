import type { AeviaScore, ClassifiedMarker, MarkerStatus } from "./types.js";

/**
 * TRIN 4 — AEVIA-SCORE (0-100).
 *
 * Porteret og udvidet fra app'ens src/score.ts. Samme vægtning:
 *   50%  markør-klassificering
 *   35%  efterlevelse (adherence)
 *   15%  momentum (fremgang siden sidste test)
 *
 * Markør-point pr. tilstand (transparent, udvider app'ens optimal/taet/udenfor
 * til fire tier). SKAL bekræftes af Judit:
 *   optimal = 1,0 · ok = 0,5 · watch = 0,25 · action = 0,0
 */
const STATUS_POINTS: Record<MarkerStatus, number> = {
  optimal: 1,
  ok: 0.5,
  watch: 0.25,
  action: 0,
};

/** Rangering af tilstande, så momentum kan se om en markør er blevet bedre. */
const STATUS_RANK: Record<MarkerStatus, number> = {
  action: 0,
  watch: 1,
  ok: 2,
  optimal: 3,
};

export interface ScoreContext {
  /** 7-dages protokol-efterlevelse, 0-1. */
  adherence: number;
  /** Forrige tests klassificering (markør-id → status) til momentum. */
  previous?: Record<string, MarkerStatus>;
  /**
   * Første test (baseline): ingen protokol at efterleve og ingen tidligere test.
   * Scoren bliver REN markør-score; efterlevelse + momentum udelades (null).
   */
  baseline?: boolean;
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

function markerScore(classified: ClassifiedMarker[]): number {
  if (classified.length === 0) return 0;
  const sum = classified.reduce((acc, m) => acc + STATUS_POINTS[m.status], 0);
  return (sum / classified.length) * 100;
}

/**
 * Momentum: andel af markører der er rykket til en bedre tilstand, eller som
 * blev i optimal. Uden forrige test → 50 (neutral), som i app'en.
 */
function momentumScore(classified: ClassifiedMarker[], previous?: Record<string, MarkerStatus>): number {
  if (!previous) return 50;
  const comparable = classified.filter((m) => previous[m.id] != null);
  if (comparable.length === 0) return 50;
  const improved = comparable.filter((m) => {
    const before = previous[m.id]!;
    const movedUp = STATUS_RANK[m.status] > STATUS_RANK[before];
    const heldOptimal = m.status === "optimal" && before === "optimal";
    return movedUp || heldOptimal;
  }).length;
  return (improved / comparable.length) * 100;
}

/** Score pr. markørkategori (0-100) — samme point-skala som markerPart. */
function categoryBreakdown(classified: ClassifiedMarker[]): Record<string, number> {
  const groups = new Map<string, ClassifiedMarker[]>();
  for (const m of classified) {
    const arr = groups.get(m.category) ?? [];
    arr.push(m);
    groups.set(m.category, arr);
  }
  const out: Record<string, number> = {};
  for (const [cat, arr] of groups) out[cat] = Math.round(markerScore(arr));
  return out;
}

export function computeAeviaScore(classified: ClassifiedMarker[], ctx: ScoreContext): AeviaScore {
  const markers = markerScore(classified);

  // Baseline (første test): ingen protokol/tidligere test → ren markør-score.
  if (ctx.baseline) {
    return {
      total: Math.round(markers),
      components: { markers: Math.round(markers), adherence: null, momentum: null },
      breakdown: categoryBreakdown(classified),
      baseline: true,
    };
  }

  const adherence = clamp01(ctx.adherence) * 100;
  const momentum = momentumScore(classified, ctx.previous);
  const total = Math.round(markers * 0.5 + adherence * 0.35 + momentum * 0.15);

  return {
    total,
    components: {
      markers: Math.round(markers),
      adherence: Math.round(adherence),
      momentum: Math.round(momentum),
    },
    breakdown: categoryBreakdown(classified),
    baseline: false,
  };
}

export function scoreLabel(score: number): string {
  if (score >= 85) return "Fremragende";
  if (score >= 70) return "Stærk";
  if (score >= 55) return "På vej";
  return "Tid til fokus";
}
