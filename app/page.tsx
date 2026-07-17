import Link from "next/link";
import InflatableCard from "@/components/catalog/InflatableCard";
import FitCalculator from "@/components/calculator/FitCalculator";
import { getInflatables } from "@/lib/queries";

export const revalidate = 600;

const PASOS = [
  {
    icon: "📱",
    title: "Abre la ficha en tu celu",
    text: "Entra a cualquier juego del catálogo desde tu celular.",
  },
  {
    icon: "🎥",
    title: "Toca “Ver en tu patio”",
    text: "Se abre la cámara y el juego aparece a escala real, con su zona de seguridad marcada.",
  },
  {
    icon: "✅",
    title: "Confirma que cabe y arrienda",
    text: "Si cabe, nos escribes por WhatsApp y coordinamos la fecha. Así de simple.",
  },
];

export default async function Home() {
  const inflatables = await getInflatables();

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="pt-10 text-center sm:pt-14">
        <h1 className="mx-auto max-w-2xl text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
          Juegos inflables para el cumpleaños,{" "}
          <span className="text-sky-600">probados en tu patio antes de arrendar</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
          Con la cámara de tu celu ves cada juego a escala real en tu espacio. Sin
          instalar nada, sin sorpresas el día del evento.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <a
            href="#catalogo"
            className="rounded-full bg-sky-600 px-6 py-3 font-bold text-white shadow-md active:scale-95"
          >
            Ver los juegos
          </a>
          <Link
            href="/que-me-cabe"
            className="rounded-full border border-slate-300 bg-white px-6 py-3 font-bold text-slate-700 active:scale-95"
          >
            📏 ¿Qué me cabe?
          </Link>
        </div>
      </section>

      {/* Catálogo */}
      <section id="catalogo" className="scroll-mt-20">
        <h2 className="mb-4 text-2xl font-extrabold text-slate-900">Nuestros juegos</h2>
        {inflatables.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {inflatables.map((inf) => (
              <InflatableCard key={inf.id} inf={inf} />
            ))}
          </div>
        ) : (
          <p className="text-slate-500">Pronto subiremos el catálogo completo 🏗️</p>
        )}
      </section>

      {/* Calculadora */}
      <section>
        <h2 className="mb-1 text-2xl font-extrabold text-slate-900">
          📏 ¿Qué me cabe?
        </h2>
        <p className="mb-4 text-slate-600">
          Escribe las medidas de tu patio y te decimos al tiro qué juegos caben.
        </p>
        <FitCalculator inflatables={inflatables} />
      </section>

      {/* Cómo funciona el AR */}
      <section className="rounded-2xl bg-sky-50 p-6 sm:p-8">
        <h2 className="mb-6 text-2xl font-extrabold text-slate-900">
          ¿Cómo lo veo en mi patio?
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {PASOS.map((paso, i) => (
            <div key={paso.title}>
              <div className="mb-2 text-3xl">{paso.icon}</div>
              <h3 className="font-bold text-slate-900">
                {i + 1}. {paso.title}
              </h3>
              <p className="mt-1 text-sm text-slate-600">{paso.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
