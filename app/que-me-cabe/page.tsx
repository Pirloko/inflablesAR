import type { Metadata } from "next";
import FitCalculator from "@/components/calculator/FitCalculator";
import { getInflatables } from "@/lib/queries";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "¿Qué juego inflable me cabe?",
  description:
    "Calcula gratis qué juegos inflables caben en tu patio en Rancagua: escribe el largo y ancho de tu espacio y te decimos cuáles caben con su margen de seguridad.",
};

export default async function QueMeCabePage() {
  const inflatables = await getInflatables();

  return (
    <div className="mx-auto max-w-2xl space-y-6 pt-10">
      <header className="text-center">
        <h1 className="text-3xl font-extrabold text-slate-900">📏 ¿Qué me cabe?</h1>
        <p className="mt-3 text-slate-600">
          Mide el largo y el ancho de tu patio y te decimos qué juegos caben.
          Consideramos el <span className="font-semibold">margen de seguridad</span>{" "}
          que necesita cada inflable: espacio para las estacas, el motor y para que los
          niños circulen alrededor.
        </p>
      </header>

      <FitCalculator inflatables={inflatables} />

      <p className="text-center text-sm text-slate-500">
        💡 Dato: en las fichas puedes ver cada juego a escala real en tu patio con la
        cámara de tu celu — así confirmas al 100% antes de arrendar.
      </p>
    </div>
  );
}
