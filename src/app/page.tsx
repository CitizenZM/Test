'use client';

import { useState, useEffect } from 'react';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MANAGED_BRANDS,
  type BrandWithProfile,
  getFirstProfile,
} from '@/types';
import {
  Users,
  Mail,
  MessageSquare,
  CalendarCheck,
  Handshake,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Search,
  Zap,
  Target,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  leadsDiscovered: number;
  outreachSent: number;
  replies: number;
  meetings: number;
  partners: number;
  activePartners: number;
}

const QUICK_ACTIONS = [
  { label: 'Find Publishers', href: '/publishers', icon: Search, desc: 'AI-powered discovery', gradient: 'from-blue-500 to-blue-600' },
  { label: 'Create Outreach', href: '/outreach', icon: Mail, desc: 'Generate personalized messages', gradient: 'from-violet-500 to-purple-600' },
  { label: 'New Campaign', href: '/campaigns', icon: Target, desc: 'Launch recruitment campaign', gradient: 'from-amber-500 to-orange-500' },
  { label: 'View Pipeline', href: '/pipeline', icon: BarChart3, desc: 'Track partner progress', gradient: 'from-emerald-500 to-green-600' },
] as const;

const STRATEGY_COLORS = [
  { bg: 'bg-blue-50/80', border: 'border-blue-100', title: 'text-blue-800', sub: 'text-blue-600', kw: 'text-blue-500' },
  { bg: 'bg-teal-50/80', border: 'border-teal-100', title: 'text-teal-800', sub: 'text-teal-600', kw: 'text-teal-500' },
  { bg: 'bg-amber-50/80', border: 'border-amber-100', title: 'text-amber-800', sub: 'text-amber-600', kw: 'text-amber-500' },
  { bg: 'bg-violet-50/80', border: 'border-violet-100', title: 'text-violet-800', sub: 'text-violet-600', kw: 'text-violet-500' },
  { bg: 'bg-pink-50/80', border: 'border-pink-100', title: 'text-pink-800', sub: 'text-pink-600', kw: 'text-pink-500' },
];

const FALLBACK_BRANDS = [
  { name: 'TCL', cat: 'Consumer Electronics', desc: 'TVs, Monitors, Tablets, Phones', target: 'Tech editorial, gaming, deal sites' },
  { name: 'Levoit', cat: 'Home Appliances', desc: 'Air Purifiers, Humidifiers, Vacuums', target: 'Home, health, pet, deal sites' },
  { name: 'Insta360', cat: 'Action Cameras', desc: '360° Cameras, Action Cams, AI Editing', target: 'Content creators, tech reviewers' },
];

const statConfig = [
  { key: 'leadsDiscovered' as const, label: 'Leads Discovered', icon: Users, gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-600', sub: 'publisher database' },
  { key: 'outreachSent' as const, label: 'Outreach Sent', icon: Mail, gradient: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-50', text: 'text-indigo-600', sub: 'all channels' },
  { key: 'replies' as const, label: 'Replies', icon: MessageSquare, gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-600', sub: 'responses' },
  { key: 'meetings' as const, label: 'Meetings', icon: CalendarCheck, gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', text: 'text-violet-600', sub: 'scheduled' },
  { key: 'partners' as const, label: 'Partners', icon: Handshake, gradient: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50', text: 'text-emerald-600', sub: 'converted' },
  { key: 'activePartners' as const, label: 'Active', icon: TrendingUp, gradient: 'from-teal-500 to-cyan-600', bg: 'bg-teal-50', text: 'text-teal-600', sub: 'generating revenue' },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    leadsDiscovered: 0,
    outreachSent: 0,
    replies: 0,
    meetings: 0,
    partners: 0,
    activePartners: 0,
  });
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<BrandWithProfile[]>([]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/analytics');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
      }
    }
    async function fetchBrands() {
      try {
        const res = await fetch('/api/brands');
        if (res.ok) {
          const data = await res.json();
          setBrands(data);
        }
      } catch {
        // Use defaults
      }
    }
    fetchStats();
    fetchBrands();
  }, []);

  return (
    <div className="p-8 space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 p-8 text-white shadow-xl shadow-indigo-500/15">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22%23fff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M20%200L40%2020L20%2040L0%2020z%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-indigo-200 text-sm font-medium mb-1">Welcome back</p>
            <h1 className="text-2xl font-bold tracking-tight">AffiliateHunter AI Dashboard</h1>
            <p className="mt-2 text-indigo-100 text-sm max-w-xl">
              AI-powered publisher recruitment for Cell Digital managed brands. Discover publishers, generate outreach, and grow your affiliate network.
            </p>
          </div>
          <div className="hidden lg:flex gap-3">
            <Link href="/publishers">
              <Button className="bg-white/15 backdrop-blur-sm border border-white/20 text-white hover:bg-white/25 shadow-none">
                <Search className="h-4 w-4" />
                Discover Publishers
              </Button>
            </Link>
            <Link href="/outreach">
              <Button className="bg-white text-indigo-700 hover:bg-white/90 shadow-none font-semibold">
                <Zap className="h-4 w-4" />
                AI Outreach
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {statConfig.map((s) => (
          <div key={s.key} className="group rounded-2xl border border-slate-200/60 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className={`rounded-xl p-2 ${s.bg} transition-transform duration-300 group-hover:scale-110`}>
                <s.icon className={`h-4 w-4 ${s.text}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800 tracking-tight">
              {loading ? <span className="animate-pulse-soft">--</span> : stats[s.key].toLocaleString()}
            </p>
            <p className="text-[11px] font-medium text-slate-400 mt-0.5 uppercase tracking-wide">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Managed Brands */}
        <Card className="lg:col-span-1">
          <div className="flex items-center justify-between mb-5">
            <CardTitle>Managed Brands</CardTitle>
            <Link href="/brands">
              <Button variant="ghost" size="sm">
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
          <div className="space-y-2.5">
            {brands.length > 0
              ? brands.map((brand) => (
                  <Link key={brand.id} href={`/brands/${brand.id}`}>
                    <div className="flex items-center justify-between rounded-xl border border-slate-100 p-3.5 hover:bg-indigo-50/30 hover:border-indigo-200/40 transition-all duration-200 cursor-pointer group">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-sm shadow-indigo-500/20">
                          <span className="text-xs font-bold text-white">
                            {brand.brand_name[0]}
                          </span>
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">{brand.brand_name}</p>
                          <p className="text-[11px] text-slate-400">{brand.category}</p>
                        </div>
                      </div>
                      <Badge variant="success">Active</Badge>
                    </div>
                  </Link>
                ))
              : MANAGED_BRANDS.map((brand) => (
                  <div
                    key={brand.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 p-3.5"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-9 w-9 rounded-xl flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${brand.color}, ${brand.color}dd)` }}
                      >
                        <span className="text-xs font-bold text-white">
                          {brand.name[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-slate-800">{brand.name}</p>
                        <p className="text-[11px] text-slate-400">{brand.category}</p>
                      </div>
                    </div>
                    <Badge variant="success">Active</Badge>
                  </div>
                ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardTitle className="mb-5">Quick Actions</CardTitle>
          <div className="space-y-2.5">
            {QUICK_ACTIONS.map((action) => (
              <Link key={action.href} href={action.href}>
                <div className="flex items-center gap-3.5 rounded-xl border border-slate-100 p-3.5 hover:bg-slate-50 hover:border-slate-200 transition-all duration-200 cursor-pointer group">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} shadow-sm`}>
                    <action.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors">{action.label}</p>
                    <p className="text-[11px] text-slate-400">{action.desc}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all duration-200" />
                </div>
              </Link>
            ))}
          </div>
        </Card>

        {/* AI Strategies */}
        <Card className="lg:col-span-1">
          <div className="flex items-center justify-between mb-5">
            <CardTitle>AI Strategies</CardTitle>
            <Link href="/brands">
              <Button variant="ghost" size="sm">
                <Sparkles className="h-3 w-3" />
                Manage
              </Button>
            </Link>
          </div>
          <div className="space-y-2.5">
            {(() => {
              const brandsWithStrategy = brands.filter((b) => {
                const p = getFirstProfile(b);
                return p?.recruitment_strategy;
              });

              const gradients = STRATEGY_COLORS;

              if (brandsWithStrategy.length > 0) {
                return brandsWithStrategy.map((brand, i) => {
                  const p = getFirstProfile(brand);
                  const s = p?.recruitment_strategy;
                  if (!s) return null;
                  const c = gradients[i % gradients.length];
                  return (
                    <Link key={brand.id} href={`/brands/${brand.id}`}>
                      <div className={`rounded-xl ${c.bg} border ${c.border} p-3.5 hover:opacity-90 transition-all duration-200 cursor-pointer`}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <Sparkles className={`h-3.5 w-3.5 ${c.sub}`} />
                          <p className={`text-[13px] font-semibold ${c.title}`}>
                            {brand.brand_name}
                          </p>
                          <span className={`text-[10px] font-medium ${c.sub} ml-auto`}>{brand.category}</span>
                        </div>
                        <p className={`text-[11px] ${c.sub}`}>
                          {s.target_categories.slice(0, 3).join(' · ')}
                        </p>
                        <p className={`text-[11px] ${c.kw} mt-0.5`}>
                          {s.discovery_keywords.slice(0, 3).join(', ')}
                        </p>
                      </div>
                    </Link>
                  );
                });
              }

              return (
                <>
                  {FALLBACK_BRANDS.map((brand, i) => {
                    const c = gradients[i];
                    return (
                      <div key={brand.name} className={`rounded-xl ${c.bg} border ${c.border} p-3.5`}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <Sparkles className={`h-3.5 w-3.5 ${c.sub}`} />
                          <p className={`text-[13px] font-semibold ${c.title}`}>{brand.name}</p>
                          <span className={`text-[10px] font-medium ${c.sub} ml-auto`}>{brand.cat}</span>
                        </div>
                        <p className={`text-[11px] ${c.sub}`}>{brand.desc}</p>
                        <p className={`text-[11px] ${c.kw} mt-0.5`}>Target: {brand.target}</p>
                      </div>
                    );
                  })}
                  <p className="text-[11px] text-slate-400 text-center mt-2">
                    <Link href="/brands" className="text-indigo-600 hover:underline font-medium">
                      Set up brand profiles
                    </Link>{' '}
                    to generate AI strategies
                  </p>
                </>
              );
            })()}
          </div>
        </Card>
      </div>
    </div>
  );
}
