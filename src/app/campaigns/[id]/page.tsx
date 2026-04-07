'use client';

import { useState, useEffect, use } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { Campaign, type BrandWithProfile } from '@/types';
import { ArrowLeft, Loader2, Play, Pause, Copy, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [brand, setBrand] = useState<BrandWithProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const { toasts, toast, removeToast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/campaigns?id=${id}`);
        if (res.ok) {
          const data = await res.json();
          const c = Array.isArray(data) ? data[0] : data;
          setCampaign(c);

          // Fetch brand info
          if (c?.brand_id) {
            const brandRes = await fetch(`/api/brands/${c.brand_id}`);
            if (brandRes.ok) setBrand(await brandRes.json());
          }
        } else {
          toast.error('Failed to load campaign');
        }
      } catch {
        toast.error('Network error loading campaign');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  async function toggleStatus() {
    if (!campaign) return;
    const newStatus = campaign.status === 'active' ? 'draft' : 'active';
    setToggling(true);
    try {
      const res = await fetch('/api/campaigns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: campaign.id, status: newStatus }),
      });
      if (res.ok) {
        setCampaign({ ...campaign, status: newStatus });
        toast.success(`Campaign ${newStatus === 'active' ? 'activated' : 'set to draft'}`);
      } else {
        toast.error('Failed to update campaign status');
      }
    } catch {
      toast.error('Network error updating campaign');
    } finally {
      setToggling(false);
    }
  }

  function copyStrategy() {
    if (!campaign?.strategy) return;
    navigator.clipboard.writeText(JSON.stringify(campaign.strategy, null, 2));
    toast.success('Strategy JSON copied to clipboard');
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const strategy = campaign.strategy as Record<string, any> | null;
  const channelRecs = strategy?.channel_recommendations as Record<string, { priority?: string; notes?: string; formats?: string[] }> | undefined;

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Header
        title={campaign.name}
        description={`${brand?.brand_name || 'No brand'} — ${campaign.goal || 'No goal'}`}
        actions={
          <div className="flex gap-3">
            <Link href="/campaigns">
              <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
            </Link>
            {campaign.status === 'active' ? (
              <Button variant="secondary" onClick={toggleStatus} disabled={toggling}>
                {toggling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Pause className="mr-2 h-4 w-4" />}
                Set Draft
              </Button>
            ) : (
              <Button onClick={toggleStatus} disabled={toggling}>
                {toggling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                Activate
              </Button>
            )}
          </div>
        }
      />

      <div className="p-8 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Card>
            <p className="text-sm text-gray-500">Status</p>
            <Badge variant={campaign.status === 'active' ? 'success' : campaign.status === 'paused' ? 'warning' : 'default'} className="mt-1">
              {campaign.status}
            </Badge>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Goal</p>
            <p className="text-lg font-semibold mt-1 capitalize">{campaign.goal || '-'}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Channels</p>
            <div className="flex gap-1 flex-wrap mt-1">
              {(campaign.channels || []).map(ch => (
                <Badge key={ch} variant="info">{ch}</Badge>
              ))}
            </div>
          </Card>
          <Card>
            <p className="text-sm text-gray-500">Brand</p>
            <p className="text-lg font-semibold mt-1">{brand?.brand_name || '-'}</p>
            {brand?.primary_domain && (
              <a href={brand.primary_domain} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 flex items-center gap-1 hover:underline">
                {brand.primary_domain} <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </Card>
        </div>

        {/* Briefing */}
        {campaign.briefing_text && (
          <Card>
            <CardTitle>Campaign Briefing</CardTitle>
            <p className="mt-3 text-sm text-gray-700 whitespace-pre-line">{campaign.briefing_text}</p>
          </Card>
        )}

        {/* Languages */}
        {campaign.languages && campaign.languages.length > 0 && (
          <Card>
            <CardTitle>Languages</CardTitle>
            <div className="flex gap-2 mt-3">
              {campaign.languages.map(lang => (
                <Badge key={lang} variant="default">{lang.toUpperCase()}</Badge>
              ))}
            </div>
          </Card>
        )}

        {/* AI Strategy */}
        {strategy && (
          <Card>
            <div className="flex items-center justify-between">
              <CardTitle>AI Campaign Strategy</CardTitle>
              <div className="flex gap-2">
                <Badge variant={campaign.strategy_status === 'completed' ? 'success' : 'info'}>
                  {campaign.strategy_status || 'generated'}
                </Badge>
                <Button variant="ghost" size="sm" onClick={copyStrategy}>
                  <Copy className="h-3 w-3 mr-1" /> Copy JSON
                </Button>
              </div>
            </div>

            {/* Content Strategy */}
            {strategy.content_strategy && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-semibold text-gray-900">Content Strategy</h4>
                <p className="text-sm text-gray-700">
                  {String(strategy.content_strategy.key_angle || '')}
                </p>
                {Array.isArray(strategy.content_strategy.hook_themes) && (
                  <div className="flex gap-2 flex-wrap">
                    {strategy.content_strategy.hook_themes.map((theme: string, i: number) => (
                      <Badge key={i} variant="default">{theme}</Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Audience Analysis */}
            {strategy.audience_analysis && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-semibold text-gray-900">Audience Analysis</h4>
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Primary:</span> {String(strategy.audience_analysis.primary_segment || '')}
                </p>
                {strategy.audience_analysis.secondary_segment && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Secondary:</span> {String(strategy.audience_analysis.secondary_segment)}
                  </p>
                )}
              </div>
            )}

            {/* Channel Recommendations */}
            {channelRecs && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-semibold text-gray-900">Channel Recommendations</h4>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {Object.entries(channelRecs).map(([ch, info]) => (
                    <div key={ch} className="rounded-lg border border-gray-100 p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium capitalize">{ch}</span>
                        <Badge variant={info.priority === 'high' ? 'success' : info.priority === 'medium' ? 'warning' : 'default'}>
                          {info.priority || 'normal'}
                        </Badge>
                      </div>
                      {info.notes && <p className="text-xs text-gray-500 mt-1">{info.notes}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Metadata */}
        <Card>
          <CardTitle>Details</CardTitle>
          <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Created</p>
              <p className="font-medium">{formatDate(campaign.created_at)}</p>
            </div>
            <div>
              <p className="text-gray-500">Updated</p>
              <p className="font-medium">{formatDate(campaign.updated_at)}</p>
            </div>
            <div>
              <p className="text-gray-500">Campaign ID</p>
              <p className="font-mono text-xs">{campaign.id}</p>
            </div>
            {campaign.user_id && (
              <div>
                <p className="text-gray-500">User ID</p>
                <p className="font-mono text-xs">{campaign.user_id}</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
