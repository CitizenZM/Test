'use client';

import { useState, useEffect, Suspense } from 'react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessagePreview } from '@/components/outreach/message-preview';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Publisher, Outreach, MessageType, MANAGED_BRANDS } from '@/types';
import { Sparkles, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

const MESSAGE_TYPES: { value: MessageType; label: string }[] = [
  { value: 'cold_intro', label: 'Cold Introduction' },
  { value: 'linkedin_connect', label: 'LinkedIn Connection Request' },
  { value: 'linkedin_inmail', label: 'LinkedIn InMail' },
  { value: 'follow_up', label: 'Follow-Up' },
  { value: 'partnership_proposal', label: 'Partnership Proposal' },
  { value: 'editor_pitch', label: 'Editor Pitch' },
  { value: 'product_launch', label: 'Product Launch' },
  { value: 'seasonal_invite', label: 'Seasonal Campaign Invite' },
  { value: 'commission_offer', label: 'Commission Offer' },
  { value: 'reengagement', label: 'Re-engagement' },
];

function OutreachContent() {
  const searchParams = useSearchParams();
  const preselectedPublisher = searchParams.get('publisher');

  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [outreachList, setOutreachList] = useState<Outreach[]>([]);
  const [selectedPublisher, setSelectedPublisher] = useState(preselectedPublisher || '');
  const [channel, setChannel] = useState<'linkedin' | 'email'>('email');
  const [messageType, setMessageType] = useState<MessageType>('cold_intro');
  const [brandId, setBrandId] = useState('tcl');
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const [pubRes, outRes] = await Promise.all([
        fetch('/api/publishers?limit=200'),
        fetch('/api/outreach'),
      ]);
      if (pubRes.ok) {
        const data = await pubRes.json();
        setPublishers(Array.isArray(data) ? data : data.publishers || []);
      }
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
      const brand = MANAGED_BRANDS.find(b => b.id === brandId);
      const res = await fetch('/api/outreach/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publisher,
          channel,
          message_type: messageType,
          brand_id: brandId,
          brand_name: brand?.name,
        }),
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
          message_type: messageType,
          message: generatedMessage,
          brand_id: brandId,
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
      <Header title="AI Outreach" description="Generate brand-personalized outreach messages with AI" />

      <div className="p-8 space-y-6">
        <Card>
          <CardTitle>Message Generator</CardTitle>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
            <Select
              id="brand-select"
              label="Brand"
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              options={MANAGED_BRANDS.map((b) => ({ value: b.id, label: b.name }))}
            />
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
                { value: 'email', label: 'Email' },
                { value: 'linkedin', label: 'LinkedIn' },
              ]}
            />
            <Select
              id="type-select"
              label="Message Type"
              value={messageType}
              onChange={(e) => setMessageType(e.target.value as MessageType)}
              options={MESSAGE_TYPES}
            />
            <div className="flex items-end">
              <Button onClick={handleGenerate} disabled={generating || !selectedPublisher} className="w-full">
                {generating ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" /> Generate</>
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
              <Button variant="outline" onClick={() => handleGenerate()}>Regenerate</Button>
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
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outreachList.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium">{o.publisher?.publisher_name || o.publisher_id}</TableCell>
                    <TableCell><Badge variant={o.channel === 'linkedin' ? 'info' : 'purple'}>{o.channel}</Badge></TableCell>
                    <TableCell><span className="text-xs text-gray-500">{o.message_type || '-'}</span></TableCell>
                    <TableCell><Badge variant={o.status === 'replied' ? 'success' : o.status === 'contacted' ? 'info' : 'default'}>{o.status}</Badge></TableCell>
                    <TableCell>{o.sent_at ? formatDate(o.sent_at) : '-'}</TableCell>
                    <TableCell className="max-w-xs truncate">{o.message || '-'}</TableCell>
                  </TableRow>
                ))}
                {outreachList.length === 0 && (
                  <TableRow>
                    <TableCell className="text-center text-gray-500 py-8" colSpan={6}>
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
