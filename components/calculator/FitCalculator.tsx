"use client";

import Link from "next/link";
import { useState } from "react";
import { checkFit, requiredFootprint, type FitVerdict } from "@/lib/fits";
import { formatDims } from "@/lib/format";
import type { Inflatable } from "@/lib/types";

const VERDICT: Record<
  FitVerdict,
  { icon: string; label: string; className: string }
> = {
  holgura: {
    icon: "✅",
    label: "Cabe con holgura",
    className: "border-green-200 bg-green-50 text-green-800",
  },
  justo: {
    icon: "⚠️",
    label: "Cabe justo",
    className: "border-amber-200 bg-amber-50 text-amber-800",
  },
  "no-cabe": {
    icon: "❌",
    label: "No cabe",
    className: "border-red-200 bg-red-50 text-red-700",
  },
};

function parseMeters(value: string): number {
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export default function FitCalculator({ inflatables }: { inflatables: Inflatable[] }) {
  const [largo, setLargo] = useState("");
  const [ancho, setAncho] = useState("");

  const l = parseMeters(largo);
  const a = parseMeters(ancho);
  const ready = l > 0 && a > 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Largo de tu espacio (m)", value: largo, set: setLargo, ph: "ej: 7" },
          { label: "Ancho (m)", value: ancho, set: setAncho, ph: "ej: 5,5" },
        ].map((f) => (
          <label key={f.label} className="block">
            <span className="mb-1 block text-sm font-semibold text-slate-700">
              {f.label}
            </span>
            <input
              type="text"
              inputMode="decimal"
              placeholder={f.ph}
              value={f.value}
              onChange={(e) => f.set(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-lg focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </label>
        ))}
      </div>

      {ready ? (
        <ul className="mt-4 space-y-2">
          {inflatables.map((inf) => {
            const fit = checkFit(l, a, inf);
            const req = requiredFootprint(inf);
            const v = VERDICT[fit.verdict];
            return (
              <li
                key={inf.id}
                className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 ${v.className}`}
              >
                <div>
                  <p className="font-bold">
                    {v.icon} {inf.name}
                  </p>
                  <p className="text-sm opacity-80">
                    {v.label}
                    {fit.rotated && " (girándolo 90°)"} · necesita{" "}
                    {formatDims(req.length, req.width)} en total
                  </p>
                </div>
                {fit.verdict !== "no-cabe" && (
                  <Link
                    href={`/juego/${inf.slug}`}
                    className="shrink-0 rounded-full bg-white px-4 py-2 text-sm font-bold text-sky-700 shadow-sm"
                  >
                    Ver ficha
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-slate-500">
          Mide tu patio (a pasos largos ≈ 1 metro también sirve 😉) y escribe las
          medidas para ver qué juegos te caben, considerando el margen de seguridad.
        </p>
      )}
    </div>
  );
}
