'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  BRAND_CATEGORIES,
  type BrandWithProfile,
  type BrandProfile,
  type BrandCompetitor,
  type RecruitmentStrategy,
} from '@/types';
import { formatDate } from '@/lib/utils';
import {
  Save,
  Sparkles,
  Loader2,
  Trash2,
  Plus,
  ArrowRight,
  Target,
  Tag,
  Globe,
  TrendingUp,
  Search,
  RefreshCw,
  Users,
  MessageSquare,
  DollarSign,
} from 'lucide-react';

const categoryOptions = BRAND_CATEGORIES.map((c) => ({ value: c, label: c }));

export default function BrandDetailPage() {
  const params = useParams();
  const router = useRouter();
  const brandId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Form state
  const [brandName, setBrandName] = useState('');
  const [brandUrl, setBrandUrl] = useState('');
  const [category, setCategory] = useState('');
  const [competitors, setCompetitors] = useState<BrandCompetitor[]>([]);
  const [strategy, setStrategy] = useState<RecruitmentStrategy | null>(null);
  const [strategyDate, setStrategyDate] = useState<string | null>(null);

  const fetchBrand = useCallback(async () => {
    try {
      const res = await fetch(`/api/brands/${brandId}`);
      if (!res.ok) return;
      const data: BrandWithProfile = await res.json();

      setBrandName(data.brand_name);
      setBrandUrl(data.primary_domain || '');
      setCategory(data.category || '');

      const profile: BrandProfile | undefined = Array.isArray(
        data.brand_profiles
      )
        ? data.brand_profiles[0]
        : data.brand_profiles || undefined;

      if (profile) {
        setCompetitors(profile.competitors || []);
        setStrategy(profile.recruitment_strategy || null);
        setStrategyDate(profile.strategy_generated_at || null);
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  }, [brandId]);

  useEffect(() => {
    fetchBrand();
  }, [fetchBrand]);

  function addCompetitor() {
    if (competitors.length < 5) {
      setCompetitors([...competitors, { name: '', url: '' }]);
    }
  }

  function removeCompetitor(index: number) {
    setCompetitors(competitors.filter((_, i) => i !== index));
  }

  function updateCompetitor(
    index: number,
    field: 'name' | 'url',
    value: string
  ) {
    const updated = [...competitors];
    updated[index] = { ...updated[index], [field]: value };
    setCompetitors(updated);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/brands/${brandId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_name: brandName,
          primary_domain: brandUrl,
          category,
          competitors: competitors.filter((c) => c.name || c.url),
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      // Handle error
    } finally {
      setSaving(false);
    }
  }

  async function handleGenerateStrategy() {
    setGenerating(true);
    setGenerateError(null);
    try {
      // Save profile first
      await fetch(`/api/brands/${brandId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_name: brandName,
          primary_domain: brandUrl,
          category,
          competitors: competitors.filter((c) => c.name || c.url),
        }),
      });

      const res = await fetch(`/api/brands/${brandId}/strategy`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        setStrategy(data.strategy);
        setStrategyDate(new Date().toISOString());
      } else {
        const err = await res.json().catch(() => ({}));
        const msg = err.error || 'Strategy generation failed';
        if (msg.includes('OPENAI_API_KEY') || msg.includes('API key')) {
          setGenerateError('AI not configured. Go to Settings to add your OpenAI API key.');
        } else {
          setGenerateError(msg);
        }
      }
    } catch {
      setGenerateError('Network error. Please try again.');
    } finally {
      setGenerating(false);
    }
  }

  function buildPublisherFinderUrl() {
    if (!strategy) return '/publishers';
    const params = new URLSearchParams();
    params.set('brand_id', brandId);
    if (strategy.discovery_keywords.length > 0) {
      params.set('keyword', strategy.discovery_keywords[0]);
    }
    if (strategy.target_categories.length > 0) {
      params.set('category', strategy.target_categories[0]);
    }
    return `/publishers?${params.toString()}`;
  }

  if (loading) {
    return (
      <>
        <Header title="Brand Profile" description="Loading..." />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title={brandName || 'Brand Profile'}
        description="Advertiser profile and AI recruitment strategy"
        actions={
          <Link href="/brands">
            <Button variant="outline">Back to Brands</Button>
          </Link>
        }
      />

      <div className="p-8 animate-fade-in">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Section A: Advertiser Profile */}
          <div className="space-y-6">
            <Card>
              <CardTitle>Advertiser Profile</CardTitle>
              <div className="mt-4 space-y-4">
                <Input
                  id="brand-name"
                  label="Brand Name"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g., Acme Electronics"
                />
                <Input
                  id="brand-url"
                  label="Brand URL"
                  value={brandUrl}
                  onChange={(e) => setBrandUrl(e.target.value)}
                  placeholder="e.g., acme.com"
                />
                <Select
                  id="brand-category"
                  label="Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  options={[
                    { value: '', label: 'Select category...' },
                    ...categoryOptions,
                  ]}
                />

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-700">
                      Competitors
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={addCompetitor}
                      disabled={competitors.length >= 5}
                    >
                      <Plus className="mr-1 h-3 w-3" />
                      Add
                    </Button>
                  </div>
                  {competitors.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-200 p-4 text-center">
                      <p className="text-sm text-gray-400">
                        No competitors added yet
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={addCompetitor}
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Add Competitor
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {competitors.map((comp, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Input
                            id={`comp-name-${idx}`}
                            value={comp.name}
                            onChange={(e) =>
                              updateCompetitor(idx, 'name', e.target.value)
                            }
                            placeholder="Name"
                          />
                          <Input
                            id={`comp-url-${idx}`}
                            value={comp.url}
                            onChange={(e) =>
                              updateCompetitor(idx, 'url', e.target.value)
                            }
                            placeholder="URL"
                          />
                          <button
                            onClick={() => removeCompetitor(idx)}
                            className="shrink-0 rounded p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="mt-2 text-xs text-gray-400">
                    Up to 5 competitors. AI analyzes their affiliate strategies
                    to recommend publishers.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleSave}
                    disabled={saving || !brandName}
                    variant="outline"
                  >
                    {saving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Profile
                  </Button>
                  <Button
                    onClick={handleGenerateStrategy}
                    disabled={generating || !brandName || !brandUrl}
                  >
                    {generating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    {generating
                      ? 'Generating Strategy...'
                      : strategy
                        ? 'Regenerate Strategy'
                        : 'Generate AI Strategy'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Section B: AI Recruitment Strategy */}
          <div className="space-y-6">
            {generateError && !generating && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex gap-3">
                <span className="text-red-500 mt-0.5">⚠</span>
                <div>
                  <p className="text-sm font-medium text-red-800">{generateError}</p>
                  {generateError.includes('Settings') && (
                    <Link href="/settings" className="text-sm text-red-700 underline mt-1 block">
                      Go to Settings →
                    </Link>
                  )}
                </div>
              </div>
            )}
            {generating ? (
              <Card>
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mb-4" />
                  <p className="text-lg font-medium text-gray-900">
                    Generating Recruitment Strategy
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    AI is analyzing {brandName} and competitors to build a
                    publisher targeting strategy...
                  </p>
                </div>
              </Card>
            ) : strategy ? (
              <>
                {/* Target Categories */}
                <Card>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-5 w-5 text-indigo-600" />
                    <CardTitle>Target Categories</CardTitle>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {strategy.target_categories.map((cat) => (
                      <Badge key={cat} variant="info">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </Card>

                {/* Discovery Keywords */}
                <Card>
                  <div className="flex items-center gap-2 mb-3">
                    <Search className="h-5 w-5 text-purple-600" />
                    <CardTitle>Discovery Keywords</CardTitle>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {strategy.discovery_keywords.map((kw) => (
                      <Link
                        key={kw}
                        href={`/publishers?keyword=${encodeURIComponent(kw)}`}
                      >
                        <Badge
                          variant="purple"
                          className="cursor-pointer hover:opacity-80"
                        >
                          {kw}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </Card>

                {/* Publisher Tags */}
                <Card>
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="h-5 w-5 text-gray-600" />
                    <CardTitle>Publisher Tags</CardTitle>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {strategy.target_publisher_tags.map((tag) => (
                      <Badge key={tag} variant="default">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </Card>

                {/* Publisher Strategy */}
                {strategy.publisher_strategy && (
                  <Card>
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="h-5 w-5 text-indigo-600" />
                      <CardTitle>Publisher Strategy</CardTitle>
                    </div>
                    <div className="rounded-lg bg-indigo-50 p-4">
                      <p className="text-sm text-indigo-800 whitespace-pre-line">
                        {strategy.publisher_strategy}
                      </p>
                    </div>
                  </Card>
                )}

                {/* Recruitment Approach */}
                {strategy.recruitment_approach && (
                  <Card>
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare className="h-5 w-5 text-purple-600" />
                      <CardTitle>Recruitment Approach</CardTitle>
                    </div>
                    <div className="rounded-lg bg-purple-50 p-4">
                      <p className="text-sm text-purple-800 whitespace-pre-line">
                        {strategy.recruitment_approach}
                      </p>
                    </div>
                  </Card>
                )}

                {/* Commission Strategy */}
                {strategy.commission_strategy && (
                  <Card>
                    <div className="flex items-center gap-2 mb-3">
                      <DollarSign className="h-5 w-5 text-emerald-600" />
                      <CardTitle>Commission Strategy</CardTitle>
                    </div>
                    <div className="rounded-lg bg-emerald-50 p-4">
                      <p className="text-sm text-emerald-800 whitespace-pre-line">
                        {strategy.commission_strategy}
                      </p>
                    </div>
                  </Card>
                )}

                {/* Ideal Publisher Attributes */}
                <Card>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <CardTitle>Ideal Publisher Attributes</CardTitle>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Min. Monthly Traffic</span>
                      <span className="font-medium">
                        {strategy.ideal_publisher_attributes.min_traffic.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        Content Types
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {strategy.ideal_publisher_attributes.content_types.map(
                          (ct) => (
                            <Badge key={ct} variant="default">
                              {ct}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        Affiliate Networks
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {strategy.ideal_publisher_attributes.affiliate_networks.map(
                          (n) => (
                            <Badge key={n} variant="info">
                              {n}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">
                        Tier Priorities
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {strategy.ideal_publisher_attributes.tier_priorities.map(
                          (t) => (
                            <Badge key={t} variant="success">
                              {t}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Countries</p>
                      <div className="flex flex-wrap gap-1">
                        {strategy.ideal_publisher_attributes.countries.map(
                          (c) => (
                            <Badge key={c} variant="default">
                              <Globe className="mr-1 h-3 w-3" />
                              {c}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Audience Fit Notes */}
                <Card>
                  <CardTitle>Audience Fit Notes</CardTitle>
                  <div className="mt-3 rounded-lg bg-blue-50 p-4">
                    <p className="text-sm text-blue-800">
                      {strategy.audience_fit_notes}
                    </p>
                  </div>
                </Card>

                {/* Competitive Insights */}
                <Card>
                  <CardTitle>Competitive Insights</CardTitle>
                  <div className="mt-3 rounded-lg bg-amber-50 p-4">
                    <p className="text-sm text-amber-800">
                      {strategy.competitive_insights}
                    </p>
                  </div>
                </Card>

                {/* Outreach Angle */}
                {strategy.outreach_angle && (
                  <Card>
                    <CardTitle>Outreach Angle</CardTitle>
                    <div className="mt-3 rounded-lg bg-green-50 p-4">
                      <p className="text-sm text-green-800">
                        {strategy.outreach_angle}
                      </p>
                    </div>
                  </Card>
                )}

                {/* AI Confidence + Actions */}
                <Card>
                  <div className="flex items-center justify-between mb-3">
                    <CardTitle>AI Confidence</CardTitle>
                    <span className="text-sm font-medium text-gray-700">
                      {strategy.ai_confidence}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all"
                      style={{ width: `${strategy.ai_confidence}%` }}
                    />
                  </div>
                  {strategyDate && (
                    <p className="mt-2 text-xs text-gray-400">
                      Generated {formatDate(strategyDate)}
                    </p>
                  )}
                  <div className="mt-4 flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateStrategy}
                      disabled={generating}
                    >
                      <RefreshCw className="mr-1 h-3 w-3" />
                      Regenerate
                    </Button>
                    <Link href={buildPublisherFinderUrl()}>
                      <Button size="sm">
                        Apply to Publisher Finder
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              </>
            ) : (
              <Card>
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Sparkles className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-lg font-medium text-gray-900">
                    No Strategy Generated
                  </p>
                  <p className="text-sm text-gray-500 mt-1 max-w-sm">
                    Fill in the advertiser profile and competitors, then click
                    &quot;Generate AI Strategy&quot; to get AI-powered publisher
                    recruitment recommendations.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {saved && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-green-50 border border-green-200 p-4 shadow-lg">
          <p className="text-sm text-green-700 font-medium">
            Profile saved successfully
          </p>
        </div>
      )}
    </>
  );
}
