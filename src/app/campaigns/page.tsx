'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { Campaign, type BrandWithProfile } from '@/types';
import { Plus, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'info'> = {
  draft: 'default',
  active: 'success',
  paused: 'warning',
  completed: 'info',
};

const GOAL_OPTIONS = [
  { value: 'awareness', label: 'Brand Awareness' },
  { value: 'launch', label: 'Product Launch' },
  { value: 'seasonal', label: 'Seasonal Campaign' },
];

const CHANNEL_OPTIONS = ['email', 'linkedin', 'instagram', 'tiktok', 'twitter', 'edm', 'sms'];

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [brands, setBrands] = useState<BrandWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBrandId, setNewBrandId] = useState('');
  const [newGoal, setNewGoal] = useState('awareness');
  const [newBriefing, setNewBriefing] = useState('');
  const [newChannels, setNewChannels] = useState<string[]>(['email']);
  const { toasts, toast, removeToast } = useToast();

  useEffect(() => {
    Promise.all([
      fetch('/api/campaigns').then(r => r.ok ? r.json() : []),
      fetch('/api/brands').then(r => r.ok ? r.json() : []),
    ]).then(([campaignData, brandData]) => {
      setCampaigns(Array.isArray(campaignData) ? campaignData : []);
      setBrands(Array.isArray(brandData) ? brandData : []);
    }).catch(() => {
      toast.error('Failed to load data');
    }).finally(() => setLoading(false));
  }, []);

  function toggleChannel(ch: string) {
    setNewChannels(prev =>
      prev.includes(ch) ? prev.filter(c => c !== ch) : [...prev, ch]
    );
  }

  async function handleCreate() {
    if (!newName.trim()) {
      toast.warning('Please enter a campaign name');
      return;
    }
    setCreating(true);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          brand_id: newBrandId || null,
          goal: newGoal,
          briefing_text: newBriefing || null,
          channels: newChannels,
          languages: ['en'],
        }),
      });
      if (res.ok) {
        toast.success(`Campaign "${newName}" created!`);
        setShowCreate(false);
        setNewName('');
        setNewBrandId('');
        setNewGoal('recruitment');
        setNewBriefing('');
        setNewChannels(['email']);
        const updated = await fetch('/api/campaigns').then(r => r.json());
        setCampaigns(Array.isArray(updated) ? updated : []);
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.error || 'Failed to create campaign');
      }
    } catch {
      toast.error('Network error creating campaign');
    } finally {
      setCreating(false);
    }
  }

  function getBrandName(brandId: string | null) {
    if (!brandId) return '-';
    const brand = brands.find(b => b.id === brandId);
    return brand?.brand_name || brandId.substring(0, 8);
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header
        title="Campaigns"
        description="Manage outreach campaigns and automation sequences"
        actions={
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Campaign
          </Button>
        }
      />

      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : campaigns.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-16">
            <p className="text-gray-500">No campaigns yet</p>
            <p className="mt-1 text-sm text-gray-400">Create a campaign to start recruiting publishers</p>
            <Button className="mt-4" onClick={() => setShowCreate(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create your first campaign
            </Button>
          </Card>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Goal</TableHead>
                <TableHead>Channels</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link href={`/campaigns/${c.id}`} className="font-medium text-indigo-600 hover:underline">
                      {c.name}
                    </Link>
                  </TableCell>
                  <TableCell>{getBrandName(c.brand_id)}</TableCell>
                  <TableCell>
                    <Badge variant="info">{c.goal || '-'}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {(c.channels || []).slice(0, 3).map(ch => (
                        <Badge key={ch} variant="default">{ch}</Badge>
                      ))}
                      {(c.channels || []).length > 3 && (
                        <Badge variant="default">+{c.channels.length - 3}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell><Badge variant={statusVariant[c.status] || 'default'}>{c.status}</Badge></TableCell>
                  <TableCell>{formatDate(c.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Campaign">
        <div className="space-y-4">
          <Input
            id="name"
            label="Campaign Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. TCL Q3 Publisher Recruitment"
          />
          <Select
            id="brand"
            label="Brand"
            value={newBrandId}
            onChange={(e) => setNewBrandId(e.target.value)}
            options={[
              { value: '', label: 'Select a brand...' },
              ...brands.map((b) => ({ value: b.id, label: b.brand_name })),
            ]}
          />
          <Select
            id="goal"
            label="Campaign Goal"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            options={GOAL_OPTIONS}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Channels</label>
            <div className="flex flex-wrap gap-2">
              {CHANNEL_OPTIONS.map(ch => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => toggleChannel(ch)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    newChannels.includes(ch)
                      ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {ch}
                </button>
              ))}
            </div>
          </div>
          <Textarea
            id="briefing"
            label="Campaign Briefing (optional)"
            value={newBriefing}
            onChange={(e) => setNewBriefing(e.target.value)}
            placeholder="Describe the campaign goals, key messages, target audience..."
            rows={3}
          />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newName.trim() || creating}>
              {creating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
