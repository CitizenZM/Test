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
        if (!data.openai_configured && !data.anthropic_configured) setShow(true);
      })
      .catch(() => {});
  }, [dismissed]);

  if (!show || dismissed) return null;

  return (
    <div className="bg-amber-50/80 border-b border-amber-100 px-6 py-2.5 flex items-center gap-3 text-sm backdrop-blur-sm">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100">
        <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
      </div>
      <span className="text-amber-800 text-[13px]">
        <strong>AI features not active.</strong> Add your OpenAI API key to enable strategy generation and publisher discovery.
      </span>
      <Link
        href="/settings"
        className="ml-1 text-amber-900 font-semibold text-[13px] underline underline-offset-2 hover:text-amber-700"
      >
        Configure now
      </Link>
      <button
        onClick={() => { setShow(false); setDismissed(true); }}
        className="ml-auto rounded-lg p-1 text-amber-400 hover:bg-amber-100 hover:text-amber-600 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
