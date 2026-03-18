'use client';

import { useState, useEffect, Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessagePreview } from '@/components/outreach/message-preview';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Publisher, Outreach } from '@/types';
import { Sparkles, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

function OutreachContent() {
  const searchParams = useSearchParams();
  const preselectedPublisher = searchParams.get('publisher');

  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [outreachList, setOutreachList] = useState<Outreach[]>([]);
  const [selectedPublisher, setSelectedPublisher] = useState(preselectedPublisher || '');
  const [channel, setChannel] = useState<'linkedin' | 'email'>('linkedin');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const [pubRes, outRes] = await Promise.all([
        fetch('/api/publishers'),
        fetch('/api/outreach'),
      ]);
      if (pubRes.ok) setPublishers(await pubRes.json());
      if (outRes.ok) setOutreachList(await outRes.json());
    }
    fetchData();
  }, []);

  async function handleGenerate() {
    if (!selectedPublisher) return;
    const publisher = publishers.find((p) => String(p.id) === selectedPublisher);
    if (!publisher) return;

    setGenerating(true);
    try {
      const res = await fetch('/api/outreach/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publisher, channel }),
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedMessage(data.message);
      }
    } catch {
      // Handle error
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!generatedMessage || !selectedPublisher) return;
    try {
      await fetch('/api/outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publisher_id: selectedPublisher,
          channel,
          message: generatedMessage,
          status: 'contacted',
        }),
      });
      setGeneratedMessage('');
      const res = await fetch('/api/outreach');
      if (res.ok) setOutreachList(await res.json());
    } catch {
      // Handle error
    }
  }

  return (
    <>
      <Header title="AI Outreach" description="Generate personalized outreach messages with AI" />

      <div className="p-8 space-y-6">
        <Card>
          <CardTitle>Message Generator</CardTitle>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Select
              id="publisher-select"
              label="Publisher"
              value={selectedPublisher}
              onChange={(e) => setSelectedPublisher(e.target.value)}
              options={[
                { value: '', label: 'Select a publisher' },
                ...publishers.map((p) => ({ value: String(p.id), label: p.publisher_name || p.domain || 'Unknown' })),
              ]}
            />
            <Select
              id="channel-select"
              label="Channel"
              value={channel}
              onChange={(e) => setChannel(e.target.value as 'linkedin' | 'email')}
              options={[
                { value: 'linkedin', label: 'LinkedIn' },
                { value: 'email', label: 'Email' },
              ]}
            />
            <div className="flex items-end">
              <Button onClick={handleGenerate} disabled={generating || !selectedPublisher} className="w-full">
                {generating ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" /> Generate Message</>
                )}
              </Button>
            </div>
          </div>
        </Card>

        {generatedMessage && (
          <div className="space-y-3">
            <MessagePreview message={generatedMessage} channel={channel} />
            <div className="flex gap-3">
              <Button onClick={handleSave}>Save & Mark Sent</Button>
              <Button variant="outline" onClick={() => setGeneratedMessage('')}>Clear</Button>
            </div>
          </div>
        )}

        <Card padding={false}>
          <div className="p-6 pb-0">
            <CardTitle>Outreach History</CardTitle>
          </div>
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Publisher</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outreachList.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.publisher?.name || o.publisher_id}</TableCell>
                    <TableCell><Badge variant={o.channel === 'linkedin' ? 'info' : 'purple'}>{o.channel}</Badge></TableCell>
                    <TableCell><Badge variant={o.status === 'replied' ? 'success' : o.status === 'contacted' ? 'info' : 'default'}>{o.status}</Badge></TableCell>
                    <TableCell>{o.sent_at ? formatDate(o.sent_at) : '-'}</TableCell>
                    <TableCell className="max-w-xs truncate">{o.message || '-'}</TableCell>
                  </TableRow>
                ))}
                {outreachList.length === 0 && (
                  <TableRow>
                    <TableCell className="text-center text-gray-500 py-8" colSpan={5}>
                      No outreach records yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </>
  );
}

export default function OutreachPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>}>
      <OutreachContent />
    </Suspense>
  );
}
