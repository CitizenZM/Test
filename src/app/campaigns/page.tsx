'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { Campaign, CampaignType, MANAGED_BRANDS, PUBLISHER_CATEGORIES } from '@/types';
import { Plus, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'info'> = {
  draft: 'default',
  active: 'success',
  paused: 'warning',
  completed: 'info',
};

const campaignTypeLabels: Record<CampaignType, string> = {
  recruitment: 'Publisher Recruitment',
  product_launch: 'Product Launch',
  seasonal: 'Seasonal Campaign',
  re_engagement: 'Re-engagement',
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBrand, setNewBrand] = useState('tcl');
  const [newCategory, setNewCategory] = useState('');
  const [newType, setNewType] = useState<CampaignType>('recruitment');
  const { toasts, toast, removeToast } = useToast();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    try {
      const res = await fetch('/api/campaigns');
      if (res.ok) {
        setCampaigns(await res.json());
      } else {
        toast.error('Failed to load campaigns');
      }
    } catch {
      toast.error('Network error loading campaigns');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!newName.trim()) {
      toast.warning('Please enter a campaign name');
      return;
    }
    setCreating(true);
    const brand = MANAGED_BRANDS.find(b => b.id === newBrand);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          brand_name: brand?.name || newBrand,
          brand_id: newBrand,
          category: newCategory,
          campaign_type: newType,
        }),
      });
      if (res.ok) {
        toast.success(`Campaign "${newName}" created!`);
        setShowCreate(false);
        setNewName('');
        setNewBrand('tcl');
        setNewCategory('');
        setNewType('recruitment');
        fetchCampaigns();
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
            <p className="mt-1 text-sm text-gray-400">Create a campaign to start recruiting publishers for TCL or Levoit</p>
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
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Steps</TableHead>
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
                  <TableCell>{c.brand_name || '-'}</TableCell>
                  <TableCell>
                    <Badge variant="info">{campaignTypeLabels[c.campaign_type] || c.campaign_type}</Badge>
                  </TableCell>
                  <TableCell>{c.category ? <Badge>{c.category}</Badge> : '-'}</TableCell>
                  <TableCell><Badge variant={statusVariant[c.status] || 'default'}>{c.status}</Badge></TableCell>
                  <TableCell>{c.sequence?.length || 0} steps</TableCell>
                  <TableCell>{formatDate(c.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Campaign">
        <div className="space-y-4">
          <Input id="name" label="Campaign Name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. TCL Q1 Publisher Recruitment" />
          <Select
            id="brand"
            label="Brand"
            value={newBrand}
            onChange={(e) => setNewBrand(e.target.value)}
            options={MANAGED_BRANDS.map((b) => ({ value: b.id, label: b.name }))}
          />
          <Select
            id="type"
            label="Campaign Type"
            value={newType}
            onChange={(e) => setNewType(e.target.value as CampaignType)}
            options={[
              { value: 'recruitment', label: 'Publisher Recruitment' },
              { value: 'product_launch', label: 'Product Launch' },
              { value: 'seasonal', label: 'Seasonal Campaign (Black Friday, Prime Day)' },
              { value: 're_engagement', label: 'Re-engagement' },
            ]}
          />
          <Select
            id="cat"
            label="Target Category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            options={[
              { value: '', label: 'All Categories' },
              ...PUBLISHER_CATEGORIES.map((c) => ({ value: c, label: c })),
            ]}
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
