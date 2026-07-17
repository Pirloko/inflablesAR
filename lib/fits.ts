import type { Inflatable } from "./types";

export type FitVerdict = "holgura" | "justo" | "no-cabe";

export type FitResult = {
  verdict: FitVerdict;
  /** true si cabe solo girándolo 90° */
  rotated: boolean;
  /** metros que sobran en el lado más apretado (0 si no cabe) */
  slack: number;
};

type Dims = Pick<Inflatable, "length_m" | "width_m" | "safety_margin_m">;

/** Espacio total que ocupa el juego instalado: footprint + margen por cada lado. */
export function requiredFootprint(inf: Dims) {
  return {
    length: inf.length_m + 2 * inf.safety_margin_m,
    width: inf.width_m + 2 * inf.safety_margin_m,
  };
}

/** Bajo esta holgura extra (además del margen de seguridad) lo llamamos "justo". */
const SLACK_HOLGURA_M = 0.5;

export function checkFit(
  spaceLength: number,
  spaceWidth: number,
  inf: Dims
): FitResult {
  const req = requiredFootprint(inf);
  const orientations = [
    { l: req.length, w: req.width, rotated: false },
    { l: req.width, w: req.length, rotated: true },
  ];

  let best: { rotated: boolean; slack: number } | null = null;
  for (const o of orientations) {
    if (spaceLength >= o.l && spaceWidth >= o.w) {
      const slack = Math.min(spaceLength - o.l, spaceWidth - o.w);
      if (!best || slack > best.slack) best = { rotated: o.rotated, slack };
    }
  }

  if (!best) return { verdict: "no-cabe", rotated: false, slack: 0 };
  return {
    verdict: best.slack >= SLACK_HOLGURA_M ? "holgura" : "justo",
    rotated: best.rotated,
    slack: best.slack,
  };
}
