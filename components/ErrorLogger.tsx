'use client';

import { useEffect } from 'react';

export default function ErrorLogger() {
  useEffect(() => {
    const send = (message: string, stack: string, url: string) => {
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message, stack, url }),
      }).catch(() => {});
    };

    const onError = (e: ErrorEvent) => {
      send(e.message, e.error?.stack ?? '', e.filename ?? window.location.href);
    };

    const onUnhandled = (e: PromiseRejectionEvent) => {
      const reason = e.reason;
      const msg    = reason instanceof Error ? reason.message : String(reason);
      const stack  = reason instanceof Error ? (reason.stack ?? '') : '';
      send(msg, stack, window.location.href);
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandled);

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandled);
    };
  }, []);

  return null;
}
