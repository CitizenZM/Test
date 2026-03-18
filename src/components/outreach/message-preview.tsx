'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface MessagePreviewProps {
  message: string;
  channel: 'linkedin' | 'email';
  subject?: string;
}

export function MessagePreview({ message, channel, subject }: MessagePreviewProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Badge variant={channel === 'linkedin' ? 'info' : 'purple'}>
            {channel === 'linkedin' ? 'LinkedIn Message' : 'Email'}
          </Badge>
        </div>
        <Button variant="ghost" size="sm" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      {subject && (
        <div className="mb-3">
          <p className="text-xs font-medium text-gray-500">Subject</p>
          <p className="text-sm font-medium text-gray-900">{subject}</p>
        </div>
      )}
      <div className="rounded-lg bg-gray-50 p-4">
        <p className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">{message}</p>
      </div>
    </Card>
  );
}
