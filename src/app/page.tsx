'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { StatCard } from '@/components/analytics/stat-card';
import { Card, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  Mail,
  MessageSquare,
  CalendarCheck,
  Handshake,
  Zap,
  ArrowRight,
  TrendingUp,
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

  const recentActivity = [
    { action: 'New publisher discovered', detail: 'TechRadar', time: '2 hours ago' },
    { action: 'Outreach sent', detail: "Tom's Guide - LinkedIn", time: '3 hours ago' },
    { action: 'Reply received', detail: 'Wirecutter', time: '5 hours ago' },
    { action: 'Meeting scheduled', detail: 'The Verge', time: '1 day ago' },
    { action: 'Partner activated', detail: 'CNET', time: '2 days ago' },
  ];

  return (
    <>
      <Header
        title="Dashboard"
        description="Overview of your affiliate recruitment pipeline"
        actions={
          <Link href="/publishers">
            <Button>
              <Zap className="mr-2 h-4 w-4" />
              Discover Publishers
            </Button>
          </Link>
        }
      />

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard title="Leads Discovered" value={loading ? '...' : stats.leadsDiscovered} change="+12 this week" changeType="positive" icon={Users} iconColor="text-blue-600 bg-blue-50" />
          <StatCard title="Outreach Sent" value={loading ? '...' : stats.outreachSent} change="+8 this week" changeType="positive" icon={Mail} iconColor="text-indigo-600 bg-indigo-50" />
          <StatCard title="Replies" value={loading ? '...' : stats.replies} change="32% rate" changeType="positive" icon={MessageSquare} iconColor="text-yellow-600 bg-yellow-50" />
          <StatCard title="Meetings" value={loading ? '...' : stats.meetings} change="+3 this week" changeType="positive" icon={CalendarCheck} iconColor="text-purple-600 bg-purple-50" />
          <StatCard title="Partners" value={loading ? '...' : stats.partners} change="+2 this month" changeType="positive" icon={Handshake} iconColor="text-green-600 bg-green-50" />
          <StatCard title="Active" value={loading ? '...' : stats.activePartners} icon={TrendingUp} iconColor="text-emerald-600 bg-emerald-50" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardTitle>Recent Activity</CardTitle>
            <div className="mt-4 space-y-4">
              {recentActivity.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-indigo-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.action}</p>
                      <p className="text-xs text-gray-500">{item.detail}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{item.time}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardTitle>Quick Actions</CardTitle>
            <div className="mt-4 grid grid-cols-2 gap-3">
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
        </div>
      </div>
    </>
  );
}
