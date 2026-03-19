'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, X } from 'lucide-react';

export function SetupBanner() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        if (!data.anthropic_configured) setShow(true);
      })
      .catch(() => {});
  }, [dismissed]);

  if (!show || dismissed) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-3 text-sm">
      <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
      <span className="text-amber-800">
        <strong>AI features not active.</strong> Add your Anthropic API key to enable strategy generation and publisher discovery.
      </span>
      <Link
        href="/settings"
        className="ml-1 text-amber-900 font-semibold underline underline-offset-2 hover:text-amber-700"
      >
        Configure now →
      </Link>
      <button
        onClick={() => { setShow(false); setDismissed(true); }}
        className="ml-auto text-amber-500 hover:text-amber-700"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
