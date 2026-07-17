export function waLink(message: string): string {
  const num = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
  return `https://wa.me/${num}?text=${encodeURIComponent(message)}`;
}

export function rentMessage(name: string, url: string): string {
  return `Hola! Quiero arrendar el ${name} 🏰. Lo vi en el catálogo: ${url}. Fecha tentativa: ___`;
}

export const GENERIC_MESSAGE =
  "Hola! Quiero arrendar un juego inflable 🏰. Vi el catálogo en la web.";
