import { useEffect, useRef } from "react";

const PUB_ID = "ca-pub-4079300108937036";

export function AdScript() {
  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${PUB_ID}`}
      crossOrigin="anonymous"
    />
  );
}

export function AdSlot({ slot, format = "auto", className = "" }: { slot?: string; format?: string; className?: string }) {
  const ref = useRef<HTMLModElement>(null);
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, []);
  return (
    <ins
      ref={ref}
      className={`adsbygoogle block ${className}`}
      style={{ display: "block" }}
      data-ad-client={PUB_ID}
      data-ad-slot={slot ?? "0000000000"}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}