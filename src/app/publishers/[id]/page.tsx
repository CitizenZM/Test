'use client';

import { useState, useEffect, use } from 'react';
import { Header } from '@/components/layout/header';
import { PublisherCard } from '@/components/publishers/publisher-card';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Publisher, Outreach, PublisherEditor } from '@/types';
import { Brain, Mail, Loader2, ArrowLeft, User } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default function PublisherDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [publisher, setPublisher] = useState<Publisher | null>(null);
  const [editors, setEditors] = useState<PublisherEditor[]>([]);
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
          setEditors(data.editors || []);
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
    setAnalyzing(true);
    try {
      const res = await fetch(`/api/publishers/${id}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ website: publisher.website || publisher.domain, name: publisher.publisher_name }),
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

  return (
    <>
      <Header
        title={publisher.publisher_name || 'Publisher'}
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

        {editors.length > 0 && (
          <Card>
            <CardTitle>Editor Contacts</CardTitle>
            <div className="mt-4 space-y-3">
              {editors.map((editor) => (
                <div key={editor.id} className="flex items-start justify-between rounded-lg border border-gray-100 p-3">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-indigo-50 p-2">
                      <User className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{editor.editor_name}</p>
                      {editor.role && <p className="text-xs text-gray-500">{editor.role}</p>}
                      {editor.email && (
                        <a href={`mailto:${editor.email}`} className="text-xs text-indigo-600 hover:underline">{editor.email}</a>
                      )}
                      {editor.recent_article_title && (
                        <p className="mt-1 text-xs text-gray-400">
                          Recent: {editor.recent_article_url ? (
                            <a href={editor.recent_article_url} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">{editor.recent_article_title}</a>
                          ) : editor.recent_article_title}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {editor.linkedin_url && (
                      <a href={editor.linkedin_url} target="_blank" rel="noopener noreferrer">
                        <Badge variant="info">LinkedIn</Badge>
                      </a>
                    )}
                    {editor.twitter_handle && <Badge variant="default">@{editor.twitter_handle}</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

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
