import { useEffect, useRef, useState } from "react";

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

/** AdSense "in-article" — native-looking, low-friction in-content ad. */
export function AdInArticle({ slot, className = "" }: { slot?: string; className?: string }) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}
  }, []);
  return (
    <div className={`my-6 ${className}`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 text-center">Reclamă</div>
      <ins
        className="adsbygoogle block"
        style={{ display: "block", textAlign: "center" }}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-client={PUB_ID}
        data-ad-slot={slot ?? "0000000000"}
      />
    </div>
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
  const [closed, setClosed] = useState(false);
  if (closed) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-lg">
      <div className="relative mx-auto flex items-center justify-center py-1">
        <span className="absolute left-2 top-1 text-[9px] uppercase tracking-wider text-muted-foreground">Reclamă</span>
        <button
          type="button"
          aria-label="Închide reclama"
          onClick={() => setClosed(true)}
          className="absolute right-2 top-1 text-[11px] leading-none text-muted-foreground hover:text-foreground rounded px-1"
        >
          ✕
        </button>
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

/**
 * Aggressive floating social/promo bar — dismissible after 8s auto-appear.
 * High-CTR placement without popup blocker triggers.
 */
export function AdSocialBar() {
  const [visible, setVisible] = useState(false);
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = sessionStorage.getItem("ga_sb_closed");
    if (seen) return;
    const t = setTimeout(() => setVisible(true), 6000);
    return () => clearTimeout(t);
  }, []);
  if (closed || !visible) return null;
  return (
    <div className="fixed left-2 right-2 bottom-[70px] z-30 md:left-auto md:right-4 md:top-4 md:bottom-auto md:z-[60] md:max-w-sm">
      <div className="relative rounded-lg border border-primary/30 bg-gradient-to-r from-primary to-purple-600 p-3 pr-8 text-white shadow-2xl">
        <button
          type="button"
          aria-label="Închide"
          onClick={() => {
            setClosed(true);
            try { sessionStorage.setItem("ga_sb_closed", "1"); } catch {}
          }}
          className="absolute right-1.5 top-1.5 text-white/80 hover:text-white text-xs leading-none rounded px-1.5 py-0.5"
        >
          ✕
        </button>
        <a
          href={SMARTLINK_URL}
          target="_blank"
          rel="noopener sponsored"
          className="block"
        >
          <div className="text-[10px] uppercase tracking-wider opacity-80">Recomandat</div>
          <div className="text-sm font-semibold leading-tight">
            Simulare admitere GRATIS · vezi ce medie iei →
          </div>
          <div className="text-[11px] opacity-90 mt-0.5">Deblochează accesul instant</div>
        </a>
      </div>
    </div>
  );
}

/**
 * Aggressive one-time "click anywhere" pop-under trigger — first click on page opens smartlink in new tab.
 * Session-scoped so a returning user isn't re-prompted every second.
 */
export function AdPopunderTrigger() {
  // Removed: hijacking the first click to open an affiliate tab created a
  // broken/spammy UX and tripped popup blockers. Kept as a no-op export for
  // backward compatibility with any lingering imports.
  return null;
}

/** Stacked double in-article slot — 2x AdSense back to back for heavy in-content monetization. */
export function AdInArticleStack({ className = "" }: { className?: string }) {
  return (
    <div className={`my-6 space-y-4 ${className}`}>
      <AdInArticle />
      <AdInArticle />
    </div>
  );
}
