import { useEffect, useRef } from "react";

const PUB_ID = "ca-pub-4079300108937036";
const SMARTLINK_URL = "https://www.profitablecpmratenetwork.com/rb3h7gyjnd?key=3640d7c71ce0ba1cecb15ee392442c42";

export function AdScript() {
  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${PUB_ID}`}
      crossOrigin="anonymous"
    />
  );
}

/** Google AdSense responsive slot */
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

/** Adsterra/ProfitableCPM iframe banner — isolated via srcDoc to avoid atOptions collisions */
function AdsterraBanner({
  adKey,
  width,
  height,
  className = "",
}: {
  adKey: string;
  width: number;
  height: number;
  className?: string;
}) {
  const srcDoc = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:transparent;overflow:hidden}</style></head><body><script type="text/javascript">atOptions={'key':'${adKey}','format':'iframe','height':${height},'width':${width},'params':{}};<\/script><script type="text/javascript" src="//www.highperformanceformat.com/${adKey}/invoke.js"><\/script></body></html>`;
  return (
    <iframe
      title="advertisement"
      srcDoc={srcDoc}
      width={width}
      height={height}
      scrolling="no"
      frameBorder={0}
      sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      className={`mx-auto block max-w-full ${className}`}
      style={{ width, height, border: 0 }}
    />
  );
}

/** 728x90 leaderboard — desktop only */
export function AdLeaderboard({ className = "" }: { className?: string }) {
  return (
    <div className={`hidden md:flex w-full justify-center ${className}`}>
      <AdsterraBanner adKey="abd8df0c76ef871bb2f3a6bdfda2a972" width={728} height={90} />
    </div>
  );
}

/** 320x50 mobile banner */
export function AdMobileBanner({ className = "" }: { className?: string }) {
  return (
    <div className={`flex md:hidden w-full justify-center ${className}`}>
      <AdsterraBanner adKey="1d52bf344109233191b521892428281b" width={320} height={50} />
    </div>
  );
}

/** Sticky bottom bar — 320x50 mobile + 728x90 desktop. Highest-RPM placement. */
export function StickyBottomAd() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-lg">
      <div className="relative mx-auto flex items-center justify-center py-1">
        <span className="absolute left-2 top-1 text-[9px] uppercase tracking-wider text-muted-foreground/70">Reclamă</span>
        <div className="md:hidden"><AdsterraBanner adKey="1d52bf344109233191b521892428281b" width={320} height={50} /></div>
        <div className="hidden md:block"><AdsterraBanner adKey="abd8df0c76ef871bb2f3a6bdfda2a972" width={728} height={90} /></div>
      </div>
    </div>
  );
}

/** Smartlink — opens monetized direct link in new tab. Wrap around CTAs for max RPM. */
export function smartlinkHref() {
  return SMARTLINK_URL;
}

export function SmartlinkButton({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <a
      href={SMARTLINK_URL}
      target="_blank"
      rel="noopener sponsored"
      className={className}
    >
      {children}
    </a>
  );
}
