'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { StatCard } from '@/components/analytics/stat-card';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MANAGED_BRANDS } from '@/types';
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
    fetchStats();
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
            <CardTitle>Managed Brands</CardTitle>
            <div className="mt-4 space-y-3">
              {MANAGED_BRANDS.map((brand) => (
                <div key={brand.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: brand.color + '20' }}>
                      <span className="text-xs font-bold" style={{ color: brand.color }}>{brand.name[0]}</span>
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

          {/* Key Focus Areas */}
          <Card>
            <CardTitle>Key Focus Areas</CardTitle>
            <div className="mt-4 space-y-3">
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
                <p className="text-xs text-amber-600 mt-1">360° Cameras, Action Cams, AI Editing</p>
                <p className="text-xs text-amber-500 mt-1">Target: Content creators, tech reviewers</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
