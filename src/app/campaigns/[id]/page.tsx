'use client';

import { useState, useEffect, use } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Campaign, SequenceStep } from '@/types';
import { ArrowLeft, Plus, Loader2, Play, Pause } from 'lucide-react';
import Link from 'next/link';

const actionLabels: Record<string, string> = {
  connect: 'Connect',
  message: 'Send Message',
  follow_up: 'Follow Up',
  email: 'Send Email',
};

const defaultSequence: SequenceStep[] = [
  { step: 1, action: 'connect', channel: 'linkedin', day: 1 },
  { step: 2, action: 'message', channel: 'linkedin', day: 3 },
  { step: 3, action: 'follow_up', channel: 'linkedin', day: 7 },
  { step: 4, action: 'email', channel: 'email', day: 14 },
];

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCampaign() {
      try {
        const res = await fetch(`/api/campaigns?id=${id}`);
        if (res.ok) {
          const data = await res.json();
          setCampaign(Array.isArray(data) ? data[0] : data);
        }
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    }
    fetchCampaign();
  }, [id]);

  function addStep() {
    if (!campaign) return;
    const seq = campaign.sequence || [];
    const newStep: SequenceStep = {
      step: seq.length + 1,
      action: 'message',
      channel: 'linkedin',
      day: seq.length > 0 ? seq[seq.length - 1].day + 3 : 1,
    };
    setCampaign({ ...campaign, sequence: [...seq, newStep] });
  }

  async function saveSequence() {
    if (!campaign) return;
    await fetch('/api/campaigns', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: campaign.id, sequence: campaign.sequence }),
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <p className="text-gray-500">Campaign not found</p>
        <Link href="/campaigns" className="mt-4 text-indigo-600 hover:underline">Back to campaigns</Link>
      </div>
    );
  }

  const sequence = campaign.sequence?.length ? campaign.sequence : defaultSequence;

  return (
    <>
      <Header
        title={campaign.name}
        description={`${campaign.brand || 'No brand'} - ${campaign.category || 'Uncategorized'}`}
        actions={
          <div className="flex gap-3">
            <Link href="/campaigns">
              <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
            </Link>
            {campaign.status === 'active' ? (
              <Button variant="secondary"><Pause className="mr-2 h-4 w-4" /> Pause</Button>
            ) : (
              <Button><Play className="mr-2 h-4 w-4" /> Activate</Button>
            )}
          </div>
        }
      />

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          <Card><p className="text-sm text-gray-500">Status</p><Badge variant={campaign.status === 'active' ? 'success' : 'default'} className="mt-1">{campaign.status}</Badge></Card>
          <Card><p className="text-sm text-gray-500">Steps</p><p className="text-2xl font-bold mt-1">{sequence.length}</p></Card>
          <Card><p className="text-sm text-gray-500">Duration</p><p className="text-2xl font-bold mt-1">{sequence.length > 0 ? sequence[sequence.length - 1].day : 0} days</p></Card>
          <Card><p className="text-sm text-gray-500">Brand</p><p className="text-lg font-semibold mt-1">{campaign.brand || '-'}</p></Card>
        </div>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Automation Sequence</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={addStep}><Plus className="mr-1 h-4 w-4" /> Add Step</Button>
              <Button size="sm" onClick={saveSequence}>Save</Button>
            </div>
          </div>

          <div className="space-y-3">
            {sequence.map((step, i) => (
              <div key={i} className="flex items-center gap-4 rounded-lg border border-gray-200 p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                  {step.step}
                </div>
                <div className="flex-1 grid grid-cols-3 gap-4">
                  <Select
                    id={`action-${i}`}
                    value={step.action}
                    onChange={(e) => {
                      const newSeq = [...sequence];
                      newSeq[i] = { ...newSeq[i], action: e.target.value as SequenceStep['action'] };
                      setCampaign({ ...campaign, sequence: newSeq });
                    }}
                    options={[
                      { value: 'connect', label: 'Connect' },
                      { value: 'message', label: 'Send Message' },
                      { value: 'follow_up', label: 'Follow Up' },
                      { value: 'email', label: 'Send Email' },
                    ]}
                  />
                  <Select
                    id={`channel-${i}`}
                    value={step.channel}
                    onChange={(e) => {
                      const newSeq = [...sequence];
                      newSeq[i] = { ...newSeq[i], channel: e.target.value as 'linkedin' | 'email' };
                      setCampaign({ ...campaign, sequence: newSeq });
                    }}
                    options={[
                      { value: 'linkedin', label: 'LinkedIn' },
                      { value: 'email', label: 'Email' },
                    ]}
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Day</span>
                    <input
                      type="number"
                      value={step.day}
                      onChange={(e) => {
                        const newSeq = [...sequence];
                        newSeq[i] = { ...newSeq[i], day: parseInt(e.target.value) || 1 };
                        setCampaign({ ...campaign, sequence: newSeq });
                      }}
                      className="w-20 rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
                      min={1}
                    />
                  </div>
                </div>
                <Badge variant={step.channel === 'linkedin' ? 'info' : 'purple'}>
                  {actionLabels[step.action]}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
