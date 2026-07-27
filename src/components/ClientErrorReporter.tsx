import { useEffect } from "react";

function send(payload: Record<string, unknown>) {
  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/public/log-error", blob);
      return;
    }
    void fetch("/api/public/log-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {}
}

const sent = new Set<string>();
function once(key: string) {
  if (sent.has(key)) return false;
  sent.add(key);
  if (sent.size > 50) sent.clear();
  return true;
}

export function ClientErrorReporter() {
  useEffect(() => {
    const onError = (ev: ErrorEvent) => {
      const msg = ev.message || "";
      const filename = ev.filename || "";
      const stackStr = ev.error?.stack ? String(ev.error.stack) : "";
      if (
        msg.includes("ResizeObserver loop") ||
        msg.includes("ResizeObserver loop completed with undelivered notifications") ||
        msg === "Script error." ||
        msg.includes("Non-Error promise rejection captured") ||
        // Third-party ad/analytics noise — cannot fix from our side
        msg.includes("adsbygoogle") ||
        msg.includes("TagError") ||
        msg.includes("No slot size for availableWidth") ||
        filename.includes("googlesyndication") ||
        filename.includes("googletagmanager") ||
        filename.includes("google-analytics") ||
        filename.includes("highperformanceformat") ||
        filename.includes("profitablecpmratenetwork") ||
        stackStr.includes("googlesyndication") ||
        stackStr.includes("adsbygoogle") ||
        // Minified React #418/#423/#425 are hydration mismatches usually caused by
        // browser extensions injecting DOM; recoverable, not actionable.
        /Minified React error #(418|421|422|423|425)/.test(msg)
      ) {
        return;
      }
      const key = `${ev.message}|${ev.filename}:${ev.lineno}`;
      if (!once(key)) return;
      send({
        source: "client",
        message: ev.message || "Unknown error",
        url: typeof location !== "undefined" ? location.href : undefined,
        stack: ev.error?.stack ? String(ev.error.stack) : `${ev.filename}:${ev.lineno}:${ev.colno}`,
        userAgent: navigator.userAgent,
      });
    };
    const onRejection = (ev: PromiseRejectionEvent) => {
      const reason: any = ev.reason;
      if (reason === undefined || reason === null) return;
      const message = reason?.message ? String(reason.message) : String(reason);
      if (!message || message === "undefined" || message === "null" || message === "[object Object]") return;
      if (message.includes("ResizeObserver loop")) return;
      if (message.includes("Load failed") || message.includes("NetworkError") || message.includes("Failed to fetch")) return;
      if (message.includes("AbortError") || message.includes("The operation was aborted")) return;
      if (message.includes("adsbygoogle") || message.includes("TagError")) return;
      if (/Minified React error #(418|421|422|423|425)/.test(message)) return;
      if (
        message.includes("sessionStorage") ||
        message.includes("localStorage") ||
        message.includes("Access is denied for this document")
      ) return;
      const key = `rejection|${message}`;
      if (!once(key)) return;
      send({
        source: "client-rejection",
        message,
        url: typeof location !== "undefined" ? location.href : undefined,
        stack: reason?.stack ? String(reason.stack) : undefined,
        userAgent: navigator.userAgent,
      });
    };
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);
  return null;
}

export function reportClientError(message: string, extra?: Record<string, unknown>) {
  send({
    source: "client-manual",
    message,
    url: typeof location !== "undefined" ? location.href : undefined,
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
    extra,
  });
}