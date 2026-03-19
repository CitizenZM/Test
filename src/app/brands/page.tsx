'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/header';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import {
  MANAGED_BRANDS,
  BRAND_CATEGORIES,
  type BrandWithProfile,
  type BrandCompetitor,
} from '@/types';
import { formatDate } from '@/lib/utils';
import {
  Building2,
  Plus,
  ExternalLink,
  Sparkles,
  Loader2,
  Trash2,
  ArrowRight,
} from 'lucide-react';

const categoryOptions = BRAND_CATEGORIES.map((c) => ({ value: c, label: c }));

export default function BrandsPage() {
  const [brands, setBrands] = useState<BrandWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formCompetitors, setFormCompetitors] = useState<BrandCompetitor[]>([
    { name: '', url: '' },
  ]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, []);

  async function fetchBrands() {
    try {
      const res = await fetch('/api/brands');
      if (res.ok) {
        const data = await res.json();
        setBrands(data);
      }
    } catch {
      // Use empty
    } finally {
      setLoading(false);
    }
  }

  function addCompetitor() {
    if (formCompetitors.length < 5) {
      setFormCompetitors([...formCompetitors, { name: '', url: '' }]);
    }
  }

  function removeCompetitor(index: number) {
    setFormCompetitors(formCompetitors.filter((_, i) => i !== index));
  }

  function updateCompetitor(
    index: number,
    field: 'name' | 'url',
    value: string
  ) {
    const updated = [...formCompetitors];
    updated[index] = { ...updated[index], [field]: value };
    setFormCompetitors(updated);
  }

  async function handleCreate() {
    setCreating(true);
    try {
      const res = await fetch('/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_name: formName,
          primary_domain: formUrl,
          category: formCategory,
          competitors: formCompetitors.filter((c) => c.name || c.url),
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setFormName('');
        setFormUrl('');
        setFormCategory('');
        setFormCompetitors([{ name: '', url: '' }]);
        fetchBrands();
      }
    } catch {
      // Handle error
    } finally {
      setCreating(false);
    }
  }

  function getProfile(brand: BrandWithProfile) {
    if (Array.isArray(brand.brand_profiles)) return brand.brand_profiles[0];
    return brand.brand_profiles;
  }

  // Merge DB brands with MANAGED_BRANDS defaults
  const dbBrandDomains = brands.map((b) => b.primary_domain?.toLowerCase());
  const defaultBrands = MANAGED_BRANDS.filter(
    (mb) => !dbBrandDomains.includes(mb.domain.toLowerCase())
  );

  return (
    <>
      <Header
        title="Advertiser Profiles"
        description="Manage brand profiles and AI recruitment strategies"
        actions={
          <Button onClick={() => setShowModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Brand
          </Button>
        }
      />

      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : brands.length === 0 && defaultBrands.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Building2 className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-900">
                No brands configured yet
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Add your first advertiser profile to get started with AI-powered
                publisher recruitment.
              </p>
              <Button className="mt-4" onClick={() => setShowModal(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Brand
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* DB brands */}
            {brands.map((brand) => {
              const profile = getProfile(brand);
              const competitors = profile?.competitors || [];
              const hasStrategy = !!profile?.recruitment_strategy;

              return (
                <Card key={brand.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {brand.brand_name}
                        </h3>
                        {brand.primary_domain && (
                          <a
                            href={`https://${brand.primary_domain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                          >
                            {brand.primary_domain}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                    <Badge variant={hasStrategy ? 'success' : 'warning'}>
                      {hasStrategy ? 'Strategy Generated' : 'No Strategy'}
                    </Badge>
                  </div>

                  {brand.category && (
                    <Badge variant="info" className="mt-3">
                      {brand.category}
                    </Badge>
                  )}

                  {competitors.length > 0 && (
                    <p className="mt-3 text-sm text-gray-500">
                      <span className="font-medium text-gray-700">
                        Competitors:
                      </span>{' '}
                      {competitors.map((c) => c.name).join(', ')}
                    </p>
                  )}

                  {hasStrategy && profile?.strategy_generated_at && (
                    <p className="mt-2 text-xs text-gray-400">
                      Strategy generated {formatDate(profile.strategy_generated_at)}
                    </p>
                  )}

                  <div className="mt-4 flex gap-2">
                    <Link href={`/brands/${brand.id}`}>
                      <Button variant="outline" size="sm">
                        View Profile
                        <ArrowRight className="ml-2 h-3 w-3" />
                      </Button>
                    </Link>
                    {hasStrategy && (
                      <Link
                        href={`/publishers?strategy=${brand.id}`}
                      >
                        <Button variant="ghost" size="sm">
                          <Sparkles className="mr-1 h-3 w-3" />
                          Apply Strategy
                        </Button>
                      </Link>
                    )}
                  </div>
                </Card>
              );
            })}

            {/* Default MANAGED_BRANDS not yet in DB */}
            {defaultBrands.map((mb) => (
              <Card key={mb.id}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: mb.color + '20' }}
                    >
                      <span
                        className="text-sm font-bold"
                        style={{ color: mb.color }}
                      >
                        {mb.name[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {mb.name}
                      </h3>
                      <a
                        href={`https://${mb.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                      >
                        {mb.domain}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                  <Badge variant="default">Default</Badge>
                </div>
                <Badge variant="info" className="mt-3">
                  {mb.category}
                </Badge>
                <p className="mt-3 text-sm text-gray-500">
                  Managed brand preset. Add as an advertiser profile to generate
                  an AI recruitment strategy.
                </p>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFormName(mb.name);
                      setFormUrl(mb.domain);
                      setFormCategory(mb.category);
                      setShowModal(true);
                    }}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Create Profile
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Brand Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Add Advertiser Profile"
      >
        <div className="space-y-4">
          <Input
            id="brand-name"
            label="Brand Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="e.g., Acme Electronics"
          />
          <Input
            id="brand-url"
            label="Brand URL"
            value={formUrl}
            onChange={(e) => setFormUrl(e.target.value)}
            placeholder="e.g., acme.com"
          />
          <Select
            id="brand-category"
            label="Category"
            value={formCategory}
            onChange={(e) => setFormCategory(e.target.value)}
            options={[{ value: '', label: 'Select category...' }, ...categoryOptions]}
          />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Competitors
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={addCompetitor}
                disabled={formCompetitors.length >= 5}
              >
                <Plus className="mr-1 h-3 w-3" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {formCompetitors.map((comp, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    id={`comp-name-${idx}`}
                    value={comp.name}
                    onChange={(e) =>
                      updateCompetitor(idx, 'name', e.target.value)
                    }
                    placeholder="Competitor name"
                  />
                  <Input
                    id={`comp-url-${idx}`}
                    value={comp.url}
                    onChange={(e) =>
                      updateCompetitor(idx, 'url', e.target.value)
                    }
                    placeholder="competitor.com"
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
            <p className="mt-1 text-xs text-gray-400">
              Up to 5 competitors. AI will analyze their affiliate strategies.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!formName || !formUrl || creating}
            >
              {creating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Create Brand
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
