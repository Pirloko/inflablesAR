"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";

type ModelViewerElement = HTMLElement & { canActivateAR?: boolean };

type Props = {
  modelUrl: string;
  name: string;
};

/**
 * Visualizador 3D/AR con model-viewer, cargado solo en cliente.
 * - Con soporte AR (celulares): botón "Ver en tu patio" a escala real (ar-scale fija).
 * - Sin soporte (desktop): modelo 3D navegable + QR para abrir la ficha en el celu.
 */
export default function ARViewer({ modelUrl, name }: Props) {
  const ref = useRef<ModelViewerElement | null>(null);
  const [arSupport, setArSupport] = useState<"cargando" | "si" | "no">("cargando");
  const [pageUrl, setPageUrl] = useState("");

  useEffect(() => {
    setPageUrl(window.location.href);
    let alive = true;
    import("@google/model-viewer").then(() =>
      customElements.whenDefined("model-viewer").then(() => {
        // canActivateAR se calcula al upgradearse el elemento; le damos un respiro
        setTimeout(() => {
          if (!alive) return;
          setArSupport(ref.current?.canActivateAR ? "si" : "no");
        }, 400);
      })
    );
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="space-y-4">
      <model-viewer
        ref={ref}
        src={modelUrl}
        alt={`Modelo 3D a escala real de ${name} con su zona de seguridad`}
        ar
        ar-modes="webxr scene-viewer quick-look"
        ar-scale="fixed"
        ar-placement="floor"
        camera-controls
        touch-action="pan-y"
        shadow-intensity="1"
        camera-orbit="35deg 75deg 110%"
        className="block h-[420px] w-full rounded-2xl bg-sky-50"
      >
        <button
          slot="ar-button"
          className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-sky-600 px-6 py-3 text-base font-bold text-white shadow-lg active:scale-95"
        >
          📱 Ver en tu patio
        </button>
      </model-viewer>

      <p className="text-sm text-slate-500">
        La caja celeste muestra el porte real del juego y la franja naranja el espacio
        libre que necesita alrededor (estacas, motor y circulación).
      </p>

      {arSupport === "no" && pageUrl && (
        <div className="flex items-center gap-4 rounded-2xl border border-sky-200 bg-sky-50 p-4">
          <div className="shrink-0 rounded-lg bg-white p-2">
            <QRCode value={pageUrl} size={104} />
          </div>
          <p className="text-sm text-slate-700">
            <span className="font-bold">¿Quieres verlo en tu patio?</span> Escanea este
            código con la cámara de tu celu y toca &ldquo;Ver en tu patio&rdquo;. No
            necesitas instalar nada.
          </p>
        </div>
      )}
    </div>
  );
}
