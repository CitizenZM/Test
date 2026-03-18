'use client';

import { useState, useEffect, use } from 'react';
import { Header } from '@/components/layout/header';
import { PublisherCard } from '@/components/publishers/publisher-card';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Publisher, Outreach, normalizePublisher } from '@/types';
import { Brain, Mail, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default function PublisherDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [publisher, setPublisher] = useState<Publisher | null>(null);
  const [outreachHistory, setOutreachHistory] = useState<Outreach[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/publishers/${id}`);
        if (res.ok) {
          const data = await res.json();
          setPublisher(data.publisher);
          setOutreachHistory(data.outreach || []);
        }
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  async function handleAnalyze() {
    if (!publisher) return;
    const norm = normalizePublisher(publisher);
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/publishers/${id}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ website: publisher.website || publisher.domain, name: norm.name }),
      });
      if (res.ok) {
        const data = await res.json();
        setPublisher((prev) => prev ? { ...prev, modeled_roas: data.publisher_score / 20, domain_authority: data.traffic_score, summary_note: data.analysis } : null);
      }
    } catch {
      // Handle error
    } finally {
      setAnalyzing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!publisher) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-gray-500">Publisher not found</p>
        <Link href="/publishers" className="mt-4 text-indigo-600 hover:underline">Back to publishers</Link>
      </div>
    );
  }

  const norm = normalizePublisher(publisher);

  return (
    <>
      <Header
        title={norm.name || 'Publisher'}
        description="Publisher Intelligence"
        actions={
          <div className="flex gap-3">
            <Link href="/publishers">
              <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
            </Link>
            <Button onClick={handleAnalyze} disabled={analyzing}>
              {analyzing ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</>
              ) : (
                <><Brain className="mr-2 h-4 w-4" /> AI Analyze</>
              )}
            </Button>
            <Link href={`/outreach?publisher=${id}`}>
              <Button variant="secondary"><Mail className="mr-2 h-4 w-4" /> Create Outreach</Button>
            </Link>
          </div>
        }
      />

      <div className="p-8 space-y-6">
        <PublisherCard publisher={publisher} />

        <Card>
          <CardTitle>Outreach History</CardTitle>
          {outreachHistory.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">No outreach yet for this publisher.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {outreachHistory.map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={o.status === 'replied' ? 'success' : o.status === 'contacted' ? 'info' : 'default'}>{o.status}</Badge>
                      <Badge>{o.channel || 'N/A'}</Badge>
                    </div>
                    {o.message && <p className="mt-1 text-sm text-gray-600 line-clamp-1">{o.message}</p>}
                  </div>
                  <span className="text-xs text-gray-400">{o.sent_at ? formatDate(o.sent_at) : '-'}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
