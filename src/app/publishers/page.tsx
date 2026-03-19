'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { PublisherTable } from '@/components/publishers/publisher-table';
import { Badge } from '@/components/ui/badge';
import { Publisher, PUBLISHER_CATEGORIES, TIER_PRIORITIES, AFFILIATE_NETWORKS, TCL_PRESETS, LEVOIT_PRESETS, INSTA360_PRESETS, DiscoveryPreset } from '@/types';
import { Search, Sparkles, Loader2, ChevronLeft, ChevronRight, Filter, Tv, Wind, Camera, Download } from 'lucide-react';

const categoryOptions = [
  { value: '', label: 'All Categories' },
  ...PUBLISHER_CATEGORIES.map((c) => ({ value: c, label: c })),
];

const tierOptions = [
  { value: '', label: 'All Tiers' },
  ...TIER_PRIORITIES.map((t) => ({ value: t, label: t })),
];

const networkOptions = [
  { value: '', label: 'All Networks' },
  ...AFFILIATE_NETWORKS.map((n) => ({ value: n, label: n })),
];

const PAGE_SIZE = 50;

export default function PublishersPage() {
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [tier, setTier] = useState('');
  const [network, setNetwork] = useState('');
  const [hasEmail, setHasEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [discovering, setDiscovering] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showPresets, setShowPresets] = useState(false);

  useEffect(() => {
    fetchPublishers();
  }, [page, category, tier, network, hasEmail, searchQuery]);

  async function fetchPublishers() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      if (tier) params.set('tier', tier);
      if (network) params.set('network', network);
      if (hasEmail) params.set('has_email', hasEmail);
      if (searchQuery) params.set('search', searchQuery);
      params.set('offset', String(page * PAGE_SIZE));
      params.set('limit', String(PAGE_SIZE));
      const res = await fetch(`/api/publishers?${params}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setPublishers(data);
          setTotalCount(data.length >= PAGE_SIZE ? (page + 2) * PAGE_SIZE : page * PAGE_SIZE + data.length);
        } else {
          setPublishers(data.publishers || []);
          setTotalCount(data.total || 0);
        }
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  }

  async function handleDiscover(preset?: DiscoveryPreset) {
    const searchKeyword = preset ? preset.keyword : keyword;
    const searchCategory = preset ? preset.category : category;
    if (!searchKeyword.trim()) return;
    setDiscovering(true);
    try {
      const res = await fetch('/api/publishers/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: searchKeyword,
          category: searchCategory,
          product: preset?.name || '',
          brand: preset?.brand || '',
        }),
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

  function handleSearch() {
    setPage(0);
    setSearchQuery(keyword);
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <>
      <Header
        title="Publisher Finder"
        description={`Discover affiliate publishers from ${totalCount.toLocaleString()} records`}
        actions={
          <a href="/api/reports?type=publishers&format=csv" download="publishers_export.csv">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </a>
        }
      />

      <div className="p-8 space-y-6">
        {/* AI Discovery Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">AI Publisher Discovery</h3>
            <Button variant="outline" size="sm" onClick={() => setShowPresets(!showPresets)}>
              {showPresets ? 'Hide' : 'Show'} Presets
            </Button>
          </div>

          {showPresets && (
            <div className="mb-4 space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tv className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-semibold text-gray-700">TCL Presets</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TCL_PRESETS.map((preset) => (
                    <Button
                      key={preset.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleDiscover(preset)}
                      disabled={discovering}
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Wind className="h-4 w-4 text-teal-600" />
                  <span className="text-xs font-semibold text-gray-700">Levoit Presets</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {LEVOIT_PRESETS.map((preset) => (
                    <Button
                      key={preset.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleDiscover(preset)}
                      disabled={discovering}
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Camera className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-semibold text-gray-700">Insta360 Presets</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {INSTA360_PRESETS.map((preset) => (
                    <Button
                      key={preset.id}
                      variant="outline"
                      size="sm"
                      onClick={() => handleDiscover(preset)}
                      disabled={discovering}
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Input
              placeholder="e.g. action camera, 360 camera review"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              id="keyword"
              label="Search / Keyword"
            />
            <Select
              id="category"
              label="Category"
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(0); }}
              options={categoryOptions}
            />
            <Select
              id="tier"
              label="Tier"
              value={tier}
              onChange={(e) => { setTier(e.target.value); setPage(0); }}
              options={tierOptions}
            />
            <div className="flex items-end gap-2">
              <Button onClick={() => handleDiscover()} disabled={discovering || !keyword.trim()} className="flex-1">
                {discovering ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Discovering...</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" /> Discover</>
                )}
              </Button>
              <Button variant="outline" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-2 h-4 w-4" /> Filters
            </Button>
            {(category || tier || network || hasEmail) && (
              <div className="flex gap-2">
                {category && <Badge variant="info">{category}</Badge>}
                {tier && <Badge variant="purple">{tier}</Badge>}
                {network && <Badge variant="success">{network}</Badge>}
                {hasEmail && <Badge>Has Email</Badge>}
                <button
                  onClick={() => { setCategory(''); setTier(''); setNetwork(''); setHasEmail(''); setPage(0); }}
                  className="text-xs text-red-500 hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {totalCount > 0 ? `Page ${page + 1} of ${totalPages} (${totalCount.toLocaleString()} total)` : `${publishers.length} publishers`}
          </p>
        </div>

        {showFilters && (
          <div className="rounded-lg border border-gray-200 bg-white p-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            <Select
              id="network-filter"
              label="Network"
              value={network}
              onChange={(e) => { setNetwork(e.target.value); setPage(0); }}
              options={networkOptions}
            />
            <Select
              id="email-filter"
              label="Has Email"
              value={hasEmail}
              onChange={(e) => { setHasEmail(e.target.value); setPage(0); }}
              options={[
                { value: '', label: 'Any' },
                { value: 'true', label: 'Yes' },
                { value: 'false', label: 'No' },
              ]}
            />
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <PublisherTable publishers={publishers} />
        )}

        {/* Pagination */}
        {totalCount > PAGE_SIZE && (
          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <span className="text-sm text-gray-600">Page {page + 1}</span>
            <Button variant="outline" size="sm" disabled={publishers.length < PAGE_SIZE} onClick={() => setPage(page + 1)}>
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
