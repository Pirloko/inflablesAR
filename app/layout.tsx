import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import WhatsAppButton from "@/components/ui/WhatsAppButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Arriendoinflables — Arriendo de juegos inflables en Rancagua",
    template: "%s | Arriendoinflables Rancagua",
  },
  description:
    "Arriendo de juegos inflables para cumpleaños y eventos en Rancagua. Mira cada juego a escala real en tu patio con la cámara de tu celular, sin instalar nada.",
  openGraph: {
    type: "website",
    locale: "es_CL",
    siteName: "Arriendoinflables",
  },
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Arriendoinflables",
  description: "Arriendo de juegos inflables para cumpleaños y eventos",
  url: SITE_URL,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Rancagua",
    addressRegion: "Región de O'Higgins",
    addressCountry: "CL",
  },
  areaServed: "Rancagua y alrededores",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-CL">
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-extrabold text-sky-700">
              🏰 Arriendoinflables
            </Link>
            <WhatsAppButton className="rounded-full bg-green-500 px-4 py-2 text-sm font-bold text-white shadow-sm active:scale-95">
              WhatsApp
            </WhatsAppButton>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 pb-16">{children}</main>

        <footer className="border-t border-slate-200 bg-white py-8">
          <div className="mx-auto max-w-5xl space-y-1 px-4 text-sm text-slate-500">
            <p className="font-bold text-slate-700">🏰 Arriendoinflables</p>
            <p>Arriendo de juegos inflables en Rancagua y alrededores.</p>
            <p>
              <Link href="/que-me-cabe" className="text-sky-600 hover:underline">
                ¿No sabes si te cabe? Prueba la calculadora →
              </Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
