'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { StatCard } from '@/components/analytics/stat-card';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MANAGED_BRANDS,
  type BrandWithProfile,
  type BrandProfile,
} from '@/types';
import {
  Users,
  Mail,
  MessageSquare,
  CalendarCheck,
  Handshake,
  Zap,
  ArrowRight,
  TrendingUp,
  Download,
  Sparkles,
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
    <>
      <Header
        title="Dashboard"
        description="AffiliateHunter AI — Publisher Recruitment for Cell Digital"
        actions={
          <div className="flex gap-3">
            <Link href="/publishers">
              <Button>
                <Zap className="mr-2 h-4 w-4" />
                Discover Publishers
              </Button>
            </Link>
            <a href="/api/reports?type=publishers&format=csv" download>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </a>
          </div>
        }
      />

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard title="Leads Discovered" value={loading ? '...' : stats.leadsDiscovered.toLocaleString()} change="publisher database" changeType="positive" icon={Users} iconColor="text-blue-600 bg-blue-50" />
          <StatCard title="Outreach Sent" value={loading ? '...' : stats.outreachSent} change="all channels" changeType="positive" icon={Mail} iconColor="text-indigo-600 bg-indigo-50" />
          <StatCard title="Replies" value={loading ? '...' : stats.replies} icon={MessageSquare} iconColor="text-yellow-600 bg-yellow-50" />
          <StatCard title="Meetings" value={loading ? '...' : stats.meetings} icon={CalendarCheck} iconColor="text-purple-600 bg-purple-50" />
          <StatCard title="Partners" value={loading ? '...' : stats.partners} icon={Handshake} iconColor="text-green-600 bg-green-50" />
          <StatCard title="Active" value={loading ? '...' : stats.activePartners} icon={TrendingUp} iconColor="text-emerald-600 bg-emerald-50" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Managed Brands */}
          <Card>
            <div className="flex items-center justify-between">
              <CardTitle>Managed Brands</CardTitle>
              <Link href="/brands">
                <Button variant="ghost" size="sm">
                  Manage <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {brands.length > 0
                ? brands.map((brand) => (
                    <Link key={brand.id} href={`/brands/${brand.id}`}>
                      <div className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-indigo-50 flex items-center justify-center">
                            <span className="text-xs font-bold text-indigo-600">
                              {brand.brand_name[0]}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{brand.brand_name}</p>
                            <p className="text-xs text-gray-400">{brand.category}</p>
                          </div>
                        </div>
                        <Badge variant="success">Active</Badge>
                      </div>
                    </Link>
                  ))
                : MANAGED_BRANDS.map((brand) => (
                    <div
                      key={brand.id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: brand.color + '20' }}
                        >
                          <span
                            className="text-xs font-bold"
                            style={{ color: brand.color }}
                          >
                            {brand.name[0]}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{brand.name}</p>
                          <p className="text-xs text-gray-400">{brand.category}</p>
                        </div>
                      </div>
                      <Badge variant="success">Active</Badge>
                    </div>
                  ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardTitle>Quick Actions</CardTitle>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <Link href="/publishers">
                <Button variant="outline" className="w-full justify-between">
                  Find Publishers <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/outreach">
                <Button variant="outline" className="w-full justify-between">
                  Create Outreach <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/campaigns">
                <Button variant="outline" className="w-full justify-between">
                  New Campaign <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pipeline">
                <Button variant="outline" className="w-full justify-between">
                  View Pipeline <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>

          {/* Key Focus Areas / AI Strategies */}
          <Card>
            <div className="flex items-center justify-between">
              <CardTitle>AI Recruitment Strategies</CardTitle>
              <Link href="/brands">
                <Button variant="ghost" size="sm">
                  <Sparkles className="mr-1 h-3 w-3" />
                  Manage
                </Button>
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {(() => {
                const brandsWithStrategy = brands.filter((b) => {
                  const p: BrandProfile | undefined = Array.isArray(b.brand_profiles)
                    ? b.brand_profiles[0]
                    : b.brand_profiles || undefined;
                  return p?.recruitment_strategy;
                });

                if (brandsWithStrategy.length > 0) {
                  const bgColors = ['bg-blue-50', 'bg-teal-50', 'bg-amber-50', 'bg-purple-50', 'bg-pink-50'];
                  const textColors = ['text-blue-800', 'text-teal-800', 'text-amber-800', 'text-purple-800', 'text-pink-800'];
                  const subColors = ['text-blue-600', 'text-teal-600', 'text-amber-600', 'text-purple-600', 'text-pink-600'];
                  const subColors2 = ['text-blue-500', 'text-teal-500', 'text-amber-500', 'text-purple-500', 'text-pink-500'];

                  return brandsWithStrategy.map((brand, i) => {
                    const p: BrandProfile | undefined = Array.isArray(brand.brand_profiles)
                      ? brand.brand_profiles[0]
                      : brand.brand_profiles || undefined;
                    const s = p?.recruitment_strategy;
                    if (!s) return null;
                    const ci = i % bgColors.length;
                    return (
                      <Link key={brand.id} href={`/brands/${brand.id}`}>
                        <div className={`rounded-lg ${bgColors[ci]} p-3 hover:opacity-90 transition-opacity cursor-pointer`}>
                          <p className={`text-sm font-medium ${textColors[ci]}`}>
                            {brand.brand_name} — {brand.category}
                          </p>
                          <p className={`text-xs ${subColors[ci]} mt-1`}>
                            {s.target_categories.slice(0, 3).join(', ')}
                          </p>
                          <p className={`text-xs ${subColors2[ci]} mt-1`}>
                            Keywords: {s.discovery_keywords.slice(0, 3).join(', ')}
                          </p>
                        </div>
                      </Link>
                    );
                  });
                }

                // Fallback to hardcoded defaults
                return (
                  <>
                    <div className="rounded-lg bg-blue-50 p-3">
                      <p className="text-sm font-medium text-blue-800">TCL — Consumer Electronics</p>
                      <p className="text-xs text-blue-600 mt-1">TVs, Monitors, Tablets, Phones, Audio</p>
                      <p className="text-xs text-blue-500 mt-1">Target: Tech editorial, gaming, deal sites</p>
                    </div>
                    <div className="rounded-lg bg-teal-50 p-3">
                      <p className="text-sm font-medium text-teal-800">Levoit — Home Appliances</p>
                      <p className="text-xs text-teal-600 mt-1">Air Purifiers, Humidifiers, Vacuums, Fans</p>
                      <p className="text-xs text-teal-500 mt-1">Target: Home, health, pet, deal sites</p>
                    </div>
                    <div className="rounded-lg bg-amber-50 p-3">
                      <p className="text-sm font-medium text-amber-800">Insta360 — Action Cameras</p>
                      <p className="text-xs text-amber-600 mt-1">360&deg; Cameras, Action Cams, AI Editing</p>
                      <p className="text-xs text-amber-500 mt-1">Target: Content creators, tech reviewers</p>
                    </div>
                    <p className="text-xs text-gray-400 text-center mt-2">
                      <Link href="/brands" className="text-indigo-600 hover:underline">
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
    </>
  );
}
