import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import ARViewer from "@/components/ar/ARViewer";
import FootprintDiagram from "@/components/FootprintDiagram";
import WhatsAppButton from "@/components/ui/WhatsAppButton";
import { requiredFootprint } from "@/lib/fits";
import { formatCLP, formatDims, formatMeters } from "@/lib/format";
import { getInflatableBySlug, getInflatables } from "@/lib/queries";

export const revalidate = 600;

type Params = { slug: string };

export async function generateStaticParams() {
  const inflatables = await getInflatables();
  return inflatables.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const inf = await getInflatableBySlug(slug);
  if (!inf) return {};
  const req = requiredFootprint(inf);
  const description = `Arriendo de ${inf.name} en Rancagua: ${formatDims(inf.length_m, inf.width_m)} y ${formatMeters(inf.height_m)} m de alto. Necesita ${formatDims(req.length, req.width)} de espacio. Míralo a escala real en tu patio con tu celular.`;
  return {
    title: inf.name,
    description,
    openGraph: {
      title: `${inf.name} — Arriendoinflables Rancagua`,
      description,
      images: inf.photos?.length ? [inf.photos[0]] : undefined,
    },
  };
}

export default async function FichaPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const inf = await getInflatableBySlug(slug);
  if (!inf || !inf.active) notFound();

  const req = requiredFootprint(inf);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: inf.name,
    description: inf.description ?? undefined,
    image: inf.photos?.length ? inf.photos : undefined,
    offers:
      inf.price_clp != null
        ? {
            "@type": "Offer",
            price: inf.price_clp,
            priceCurrency: "CLP",
            availability: "https://schema.org/InStock",
            areaServed: "Rancagua, Chile",
          }
        : undefined,
  };

  return (
    <article className="space-y-8 pt-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* Galería */}
      {inf.photos?.length ? (
        <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto rounded-2xl">
          {inf.photos.map((photo, i) => (
            <div
              key={photo}
              className="relative aspect-[4/3] w-[85%] shrink-0 snap-center overflow-hidden rounded-2xl bg-sky-100 sm:w-[48%]"
            >
              <Image
                src={photo}
                alt={`${inf.name} — foto ${i + 1}`}
                fill
                sizes="(max-width: 640px) 85vw, 48vw"
                className="object-cover"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-sky-100 text-7xl sm:aspect-[2/1]">
          🏰
        </div>
      )}

      {/* Título + datos clave */}
      <header className="space-y-3">
        <h1 className="text-3xl font-extrabold text-slate-900">{inf.name}</h1>
        <div className="flex flex-wrap gap-2 text-sm font-semibold">
          <span className="rounded-full bg-sky-100 px-3 py-1 text-sky-800">
            📐 {formatDims(inf.length_m, inf.width_m)} · {formatMeters(inf.height_m)} m
            de alto
          </span>
          {inf.age_range && (
            <span className="rounded-full bg-violet-100 px-3 py-1 text-violet-800">
              🎂 {inf.age_range}
            </span>
          )}
          {inf.capacity && (
            <span className="rounded-full bg-pink-100 px-3 py-1 text-pink-800">
              👧 {inf.capacity}
            </span>
          )}
        </div>
        {inf.price_clp != null && (
          <p className="text-2xl font-extrabold text-slate-900">
            {formatCLP(inf.price_clp)}
            <span className="text-base font-normal text-slate-500"> por jornada</span>
          </p>
        )}
        {inf.description && (
          <p className="max-w-2xl text-slate-600">{inf.description}</p>
        )}
      </header>

      {/* Visualizador AR */}
      <section>
        <h2 className="mb-3 text-xl font-extrabold text-slate-900">
          🎥 Míralo en tu patio, a escala real
        </h2>
        {inf.model_url ? (
          <ARViewer modelUrl={inf.model_url} name={inf.name} />
        ) : (
          <p className="rounded-2xl bg-slate-100 p-4 text-slate-500">
            El visualizador 3D de este juego estará disponible prontito 🛠️
          </p>
        )}
      </section>

      {/* Espacio necesario */}
      <section className="grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="mb-3 text-xl font-extrabold text-slate-900">
            📏 ¿Cuánto espacio necesita?
          </h2>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <FootprintDiagram
              length_m={inf.length_m}
              width_m={inf.width_m}
              safety_margin_m={inf.safety_margin_m}
            />
          </div>
        </div>
        <div>
          <h2 className="mb-3 text-xl font-extrabold text-slate-900">Requisitos</h2>
          <ul className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 text-slate-700">
            <li>
              <span className="font-bold">Espacio total:</span>{" "}
              {formatDims(req.length, req.width)} (el juego más{" "}
              {formatMeters(inf.safety_margin_m)} m libres por lado para estacas, motor
              y circulación).
            </li>
            <li>
              <span className="font-bold">Altura libre:</span>{" "}
              {formatMeters(inf.height_m)} m — ojo con cables, ramas y techos.
            </li>
            {inf.power_required && (
              <li>
                <span className="font-bold">Enchufe cerca:</span> el motor queda
                conectado durante todo el evento.
              </li>
            )}
            <li>
              <span className="font-bold">Superficie:</span> pasto o piso parejo y
              limpio, sin piedras ni escombros.
            </li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-2xl bg-green-50 p-6 text-center">
        <h2 className="text-xl font-extrabold text-slate-900">
          ¿Te tinca para el cumpleaños?
        </h2>
        <p className="mt-1 text-slate-600">
          Escríbenos y coordinamos fecha, traslado e instalación.
        </p>
        <WhatsAppButton
          inflatableName={inf.name}
          className="mt-4 inline-block rounded-full bg-green-500 px-8 py-4 text-lg font-bold text-white shadow-md active:scale-95"
        >
          💬 Arrendar por WhatsApp
        </WhatsAppButton>
      </section>
    </article>
  );
}
