"use client";

import { useEffect, useState } from "react";
import { GENERIC_MESSAGE, rentMessage, waLink } from "@/lib/whatsapp";

type Props = {
  /** Si viene, el mensaje pre-llenado pide arrendar este inflable con el link de la ficha. */
  inflatableName?: string;
  className?: string;
  children: React.ReactNode;
};

export default function WhatsAppButton({ inflatableName, className, children }: Props) {
  const [href, setHref] = useState(() =>
    waLink(inflatableName ? rentMessage(inflatableName, "") : GENERIC_MESSAGE)
  );

  useEffect(() => {
    const pageUrl = window.location.origin + window.location.pathname;
    setHref(
      waLink(inflatableName ? rentMessage(inflatableName, pageUrl) : GENERIC_MESSAGE)
    );
  }, [inflatableName]);

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}
