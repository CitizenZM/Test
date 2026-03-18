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
import { Campaign } from '@/types';
import { Plus, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';

const statusVariant: Record<string, 'default' | 'success' | 'warning' | 'info'> = {
  draft: 'default',
  active: 'success',
  paused: 'warning',
  completed: 'info',
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  async function fetchCampaigns() {
    try {
      const res = await fetch('/api/campaigns');
      if (res.ok) setCampaigns(await res.json());
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!newName.trim()) return;
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, brand: newBrand, category: newCategory }),
      });
      if (res.ok) {
        setShowCreate(false);
        setNewName('');
        setNewBrand('');
        setNewCategory('');
        fetchCampaigns();
      }
    } catch {
      // Handle error
    }
  }

  return (
    <>
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
                  <TableCell>{c.brand || '-'}</TableCell>
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
          <Input id="name" label="Campaign Name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Q1 Tech Publishers" />
          <Input id="brand" label="Brand" value={newBrand} onChange={(e) => setNewBrand(e.target.value)} placeholder="e.g. Gymshark" />
          <Select id="cat" label="Category" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} options={[
            { value: '', label: 'Select category' },
            { value: 'Tech', label: 'Tech' },
            { value: 'Fitness', label: 'Fitness' },
            { value: 'Finance', label: 'Finance' },
            { value: 'Lifestyle', label: 'Lifestyle' },
          ]} />
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!newName.trim()}>Create</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
