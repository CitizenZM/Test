'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { PublisherTable } from '@/components/publishers/publisher-table';
import { Publisher } from '@/types';
import { Search, Sparkles, Loader2 } from 'lucide-react';

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'Tech', label: 'Tech' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Fitness', label: 'Fitness' },
  { value: 'Lifestyle', label: 'Lifestyle' },
  { value: 'Fashion', label: 'Fashion' },
  { value: 'Travel', label: 'Travel' },
  { value: 'Food', label: 'Food' },
  { value: 'Gaming', label: 'Gaming' },
  { value: 'Health', label: 'Health' },
  { value: 'Beauty', label: 'Beauty' },
];

export default function PublishersPage() {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [product, setProduct] = useState('');
  const [loading, setLoading] = useState(false);
  const [discovering, setDiscovering] = useState(false);

  useEffect(() => {
    fetchPublishers();
  }, []);

  async function fetchPublishers() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      const res = await fetch(`/api/publishers?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPublishers(data);
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  }

  async function handleDiscover() {
    if (!keyword.trim()) return;
    setDiscovering(true);
    try {
      const res = await fetch('/api/publishers/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, category, product }),
      });
      if (res.ok) {
        const data = await res.json();
        setPublishers((prev) => [...data, ...prev]);
      }
    } catch {
      // Handle error
    } finally {
      setDiscovering(false);
    }
  }

  return (
    <>
      <Header
        title="Publisher Finder"
        description="Discover affiliate publishers using AI"
      />

      <div className="p-8 space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">AI Publisher Discovery</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Input
              placeholder="e.g. fitness blog, smart home review"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              id="keyword"
              label="Keyword"
            />
            <Select
              id="category"
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={categoryOptions}
            />
            <Input
              placeholder="e.g. treadmill, security camera"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              id="product"
              label="Product (optional)"
            />
            <div className="flex items-end">
              <Button onClick={handleDiscover} disabled={discovering || !keyword.trim()} className="w-full">
                {discovering ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Discovering...</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" /> Discover with AI</>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search publishers..."
                className="rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <p className="text-sm text-gray-500">{publishers.length} publishers</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <PublisherTable publishers={publishers} />
        )}
      </div>
    </>
  );
}
