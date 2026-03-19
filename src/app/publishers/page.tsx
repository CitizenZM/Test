'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { PublisherTable } from '@/components/publishers/publisher-table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Publisher,
  PUBLISHER_CATEGORIES,
  TIER_PRIORITIES,
  AFFILIATE_NETWORKS,
  type BrandWithProfile,
  type BrandProfile,
  type RecruitmentStrategy,
} from '@/types';
import {
  Search,
  Sparkles,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Download,
  Building2,
  Target,
  Users,
  ArrowRight,
  X,
} from 'lucide-react';

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
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    }>
      <PublishersPageInner />
    </Suspense>
  );
}

function PublishersPageInner() {
  const searchParams = useSearchParams();

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
  const [bulkDiscovering, setBulkDiscovering] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number; found: number; tasks_run?: number } | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Brand profile integration
  const [brands, setBrands] = useState<BrandWithProfile[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState('');
  const [activeStrategy, setActiveStrategy] = useState<RecruitmentStrategy | null>(null);
  const [showStrategyPanel, setShowStrategyPanel] = useState(false);

  // Fetch brands on mount
  useEffect(() => {
    fetch('/api/brands')
      .then((res) => res.json())
      .then((data: BrandWithProfile[]) => {
        if (Array.isArray(data)) setBrands(data);
      })
      .catch(() => {});
  }, []);

  // Handle URL params (brand_id from "Apply to Publisher Finder" button)
  useEffect(() => {
    if (brands.length === 0) return;
    const brandIdParam = searchParams.get('brand_id');
    if (brandIdParam && !selectedBrandId) {
      applyBrandSelection(brandIdParam);
    }
  }, [brands, searchParams]);

  const getSelectedBrand = useCallback(() => {
    return brands.find((b) => b.id === selectedBrandId);
  }, [brands, selectedBrandId]);

  function getProfileStrategy(brand: BrandWithProfile): RecruitmentStrategy | null {
    const profile: BrandProfile | undefined = Array.isArray(brand.brand_profiles)
      ? brand.brand_profiles[0]
      : brand.brand_profiles || undefined;
    return profile?.recruitment_strategy || null;
  }

  function applyBrandSelection(brandId: string) {
    setSelectedBrandId(brandId);

    const brand = brands.find((b) => b.id === brandId);
    if (!brand) return;

    const strategy = getProfileStrategy(brand);
    if (!strategy) {
      setActiveStrategy(null);
      return;
    }

    setActiveStrategy(strategy);
    setShowStrategyPanel(true);

    // Auto-fill filters from strategy
    if (strategy.target_categories.length > 0) {
      setCategory(strategy.target_categories[0]);
    }
    if (strategy.ideal_publisher_attributes.tier_priorities.length > 0) {
      setTier(strategy.ideal_publisher_attributes.tier_priorities[0]);
    }
    if (strategy.ideal_publisher_attributes.affiliate_networks.length > 0) {
      setNetwork(strategy.ideal_publisher_attributes.affiliate_networks[0]);
    }
    if (strategy.discovery_keywords.length > 0) {
      setKeyword(strategy.discovery_keywords[0]);
      setSearchQuery(strategy.discovery_keywords[0]);
    }
    setPage(0);
  }

  function handleBrandSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const brandId = e.target.value;
    if (!brandId) {
      clearBrandSelection();
      return;
    }
    applyBrandSelection(brandId);
  }

  function clearBrandSelection() {
    setSelectedBrandId('');
    setActiveStrategy(null);
    setShowStrategyPanel(false);
    setCategory('');
    setTier('');
    setNetwork('');
    setKeyword('');
    setSearchQuery('');
    setPage(0);
  }

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

  async function handleDiscover() {
    const searchKeyword = keyword;
    if (!searchKeyword.trim()) return;
    setDiscovering(true);
    try {
      const selectedBrand = getSelectedBrand();
      const res = await fetch('/api/publishers/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: searchKeyword,
          category: category,
          product: '',
          brand: selectedBrand?.brand_name || '',
          strategy: activeStrategy || undefined,
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

  async function handleBulkDiscover() {
    if (!activeStrategy || !selectedBrand) return;
    setBulkDiscovering(true);
    setBulkProgress({ current: 0, total: 15, found: 0 });
    try {
      const res = await fetch('/api/publishers/bulk-discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords: activeStrategy.discovery_keywords,
          categories: activeStrategy.target_categories,
          brand: selectedBrand.brand_name,
          strategy: activeStrategy,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setBulkProgress({ current: data.tasks_run, total: data.tasks_run, found: data.total_saved });
        await fetchPublishers();
      }
    } catch {
      // Handle error
    } finally {
      setBulkDiscovering(false);
      // Don't auto-hide - user can dismiss manually
    }
  }

  function handleSearch() {
    setPage(0);
    setSearchQuery(keyword);
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const selectedBrand = getSelectedBrand();
  const brandHasNoStrategy = selectedBrandId && !activeStrategy;

  return (
    <>
      <Header
        title="Publisher Finder"
        description={`Discover affiliate publishers from ${totalCount.toLocaleString()} records`}
        actions={
          <a
            href={`/api/reports?format=csv${category ? `&category=${encodeURIComponent(category)}` : ''}${tier ? `&tier=${encodeURIComponent(tier)}` : ''}${network ? `&network=${encodeURIComponent(network)}` : ''}${hasEmail === 'true' ? '&has_email=true' : ''}`}
            download="publishers_export.csv"
          >
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </a>
        }
      />

      <div className="p-8 space-y-6">
        {/* Brand Profile Selector */}
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-5 shadow-sm">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 shrink-0">
              <Building2 className="h-5 w-5 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-900">Brand Profile</span>
            </div>
            <div className="flex-1 min-w-[200px] max-w-xs">
              <Select
                id="brand-select"
                value={selectedBrandId}
                onChange={handleBrandSelect}
                options={[
                  { value: '', label: 'Select a brand...' },
                  ...brands
                    .filter((b) => getProfileStrategy(b))
                    .map((b) => ({ value: b.id, label: `${b.brand_name} (Strategy Ready)` })),
                  ...brands
                    .filter((b) => !getProfileStrategy(b))
                    .map((b) => ({ value: b.id, label: b.brand_name })),
                ]}
              />
            </div>
            {activeStrategy && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStrategyPanel(!showStrategyPanel)}
              >
                {showStrategyPanel ? 'Hide' : 'Show'} Strategy
              </Button>
            )}
            {activeStrategy && selectedBrand && (
              <Button
                size="sm"
                onClick={handleBulkDiscover}
                disabled={bulkDiscovering}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {bulkDiscovering ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Discovering...</>
                ) : (
                  <><Sparkles className="mr-2 h-4 w-4" /> Discover 200+ Publishers for {selectedBrand.brand_name}</>
                )}
              </Button>
            )}
            {selectedBrandId && (
              <Button variant="ghost" size="sm" onClick={clearBrandSelection}>
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            )}
            {activeStrategy && (
              <div className="flex items-center gap-2 ml-auto">
                <Badge variant="success">Strategy Applied</Badge>
                <span className="text-xs text-gray-500">
                  Filters auto-set from {selectedBrand?.brand_name} strategy
                </span>
              </div>
            )}
          </div>

          {/* No strategy warning */}
          {brandHasNoStrategy && (
            <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3 flex items-center gap-3">
              <span className="text-sm text-amber-800">
                No strategy generated for this brand yet.
              </span>
              <Link href={`/brands/${selectedBrandId}`}>
                <Button size="sm" variant="outline">
                  Generate Strategy <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Strategy Summary Panel */}
        {showStrategyPanel && activeStrategy && (
          <div className="rounded-xl border border-indigo-100 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Target className="h-4 w-4 text-indigo-600" />
                Strategy Summary for {selectedBrand?.brand_name}
              </h4>
              <Link href={`/brands/${selectedBrandId}`}>
                <Button variant="ghost" size="sm">View Full Strategy</Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5">Target Categories</p>
                <div className="flex flex-wrap gap-1.5">
                  {activeStrategy.target_categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setCategory(cat); setPage(0); }}
                      className={cn(
                        'text-xs px-2.5 py-1 rounded-full border transition-colors',
                        category === cat
                          ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5">Discovery Keywords</p>
                <div className="flex flex-wrap gap-1.5">
                  {activeStrategy.discovery_keywords.map((kw) => (
                    <button
                      key={kw}
                      onClick={() => { setKeyword(kw); setSearchQuery(kw); setPage(0); }}
                      className={cn(
                        'text-xs px-2.5 py-1 rounded-full border transition-colors',
                        keyword === kw
                          ? 'bg-purple-100 border-purple-300 text-purple-700'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      )}
                    >
                      {kw}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5">Publisher Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {activeStrategy.target_publisher_tags.map((tag) => (
                    <Badge key={tag} variant="default">{tag}</Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5">Ideal Attributes</p>
                <div className="flex flex-wrap gap-1.5 text-xs text-gray-600">
                  <Badge variant="info">
                    Min. {activeStrategy.ideal_publisher_attributes.min_traffic.toLocaleString()} visits/mo
                  </Badge>
                  {activeStrategy.ideal_publisher_attributes.countries.map((c) => (
                    <Badge key={c} variant="default">{c}</Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Publisher Strategy (from enhanced AI) */}
            {activeStrategy.publisher_strategy && (
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-indigo-600" />
                  <p className="text-xs font-medium text-gray-500">Publisher Strategy</p>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-line line-clamp-4">
                  {activeStrategy.publisher_strategy}
                </p>
              </div>
            )}

            {/* Active Filters Summary */}
            <div className="border-t border-gray-100 pt-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400">Active filters:</span>
              {category && <Badge variant="info">{category}</Badge>}
              {tier && <Badge variant="purple">{tier}</Badge>}
              {network && <Badge variant="success">{network}</Badge>}
              {keyword && <Badge variant="default">{keyword}</Badge>}
            </div>
          </div>
        )}

        {/* AI Discovery Section */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900">
              AI Publisher Discovery
              {selectedBrand && activeStrategy && (
                <span className="ml-2 text-xs font-normal text-indigo-600">
                  powered by {selectedBrand.brand_name} strategy
                </span>
              )}
            </h3>
          </div>

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

          {/* Quick keyword/category chips when strategy is active */}
          {activeStrategy && activeStrategy.discovery_keywords.length > 1 && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400">Quick keywords:</span>
              {activeStrategy.discovery_keywords.map((kw) => (
                <button
                  key={kw}
                  onClick={() => { setKeyword(kw); setSearchQuery(kw); setPage(0); }}
                  className={cn(
                    'text-xs px-2 py-0.5 rounded-full border transition-colors',
                    keyword === kw
                      ? 'bg-indigo-100 border-indigo-300 text-indigo-700'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  )}
                >
                  {kw}
                </button>
              ))}
            </div>
          )}
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

        {/* Bulk Discovery Progress */}
        {bulkDiscovering && (
          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 flex items-center gap-4">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-indigo-900">
                Discovering publishers for {selectedBrand?.brand_name}...
              </p>
              <p className="text-xs text-indigo-600 mt-0.5">
                AI is searching across all strategy keywords and categories. This takes 2-3 minutes and will find 150-200 publishers.
              </p>
              <div className="mt-2 h-1.5 rounded-full bg-indigo-200 overflow-hidden">
                <div className="h-full rounded-full bg-indigo-600 animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        )}

        {/* Bulk Discovery Result */}
        {!bulkDiscovering && bulkProgress && bulkProgress.found > 0 && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-900">
                ✓ Bulk Discovery Complete — {bulkProgress.found} new publishers added
              </p>
              <p className="text-xs text-green-700 mt-0.5">
                {bulkProgress.tasks_run} keyword searches completed. Publisher list updated below.
              </p>
            </div>
            <button onClick={() => setBulkProgress(null)} className="text-green-500 hover:text-green-700 text-lg">×</button>
          </div>
        )}

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
