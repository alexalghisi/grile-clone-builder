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
      const message = reason?.message ? String(reason.message) : String(reason);
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