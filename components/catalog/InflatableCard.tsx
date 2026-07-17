import Image from "next/image";
import Link from "next/link";
import { formatCLP, formatDims, formatMeters } from "@/lib/format";
import type { Inflatable } from "@/lib/types";

export default function InflatableCard({ inf }: { inf: Inflatable }) {
  const photo = inf.photos?.[0];

  return (
    <Link
      href={`/juego/${inf.slug}`}
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-sky-100">
        {photo ? (
          <Image
            src={photo}
            alt={inf.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl">🏰</div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-sky-800 shadow-sm">
          {formatDims(inf.length_m, inf.width_m)} · {formatMeters(inf.height_m)} m de
          alto
        </span>
      </div>

      <div className="space-y-2 p-4">
        <h3 className="text-lg font-bold text-slate-900">{inf.name}</h3>
        {(inf.age_range || inf.capacity) && (
          <p className="text-sm text-slate-500">
            {[inf.age_range, inf.capacity].filter(Boolean).join(" · ")}
          </p>
        )}
        <div className="flex items-center justify-between pt-1">
          {inf.price_clp != null && (
            <p className="text-lg font-extrabold text-slate-900">
              {formatCLP(inf.price_clp)}
              <span className="text-sm font-normal text-slate-500"> / jornada</span>
            </p>
          )}
          <span className="text-sm font-semibold text-sky-600 group-hover:underline">
            Ver ficha →
          </span>
        </div>
      </div>
    </Link>
  );
}
