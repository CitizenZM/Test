'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { StatCard } from '@/components/analytics/stat-card';
import { Card, CardTitle } from '@/components/ui/card';
import { AnalyticsData } from '@/types';
import { Users, Mail, MessageSquare, CalendarCheck, Handshake, TrendingUp, Percent, Target } from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/analytics');
        if (res.ok) setData(await res.json());
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  const stats = data || {
    leadsDiscovered: 0,
    outreachSent: 0,
    replies: 0,
    meetings: 0,
    partners: 0,
    activePartners: 0,
    replyRate: 0,
    partnerConversion: 0,
  };

  return (
    <>
      <Header title="Analytics" description="Track your affiliate recruitment performance" />

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Leads Discovered" value={stats.leadsDiscovered} icon={Users} iconColor="text-blue-600 bg-blue-50" />
          <StatCard title="Outreach Sent" value={stats.outreachSent} icon={Mail} iconColor="text-indigo-600 bg-indigo-50" />
          <StatCard title="Replies" value={stats.replies} icon={MessageSquare} iconColor="text-yellow-600 bg-yellow-50" />
          <StatCard title="Meetings" value={stats.meetings} icon={CalendarCheck} iconColor="text-purple-600 bg-purple-50" />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Partners" value={stats.partners} icon={Handshake} iconColor="text-green-600 bg-green-50" />
          <StatCard title="Active Partners" value={stats.activePartners} icon={TrendingUp} iconColor="text-emerald-600 bg-emerald-50" />
          <StatCard title="Reply Rate" value={`${stats.replyRate.toFixed(1)}%`} icon={Percent} iconColor="text-orange-600 bg-orange-50" />
          <StatCard title="Conversion Rate" value={`${stats.partnerConversion.toFixed(1)}%`} icon={Target} iconColor="text-rose-600 bg-rose-50" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardTitle>Pipeline Funnel</CardTitle>
            <div className="mt-6 space-y-3">
              {[
                { label: 'Leads', value: stats.leadsDiscovered, color: 'bg-gray-400' },
                { label: 'Contacted', value: stats.outreachSent, color: 'bg-blue-500' },
                { label: 'Replied', value: stats.replies, color: 'bg-yellow-500' },
                { label: 'Meetings', value: stats.meetings, color: 'bg-purple-500' },
                { label: 'Partners', value: stats.partners, color: 'bg-green-500' },
                { label: 'Active', value: stats.activePartners, color: 'bg-emerald-500' },
              ].map((stage) => {
                const maxVal = Math.max(stats.leadsDiscovered, 1);
                const width = Math.max((stage.value / maxVal) * 100, 2);
                return (
                  <div key={stage.label} className="flex items-center gap-4">
                    <span className="w-24 text-sm font-medium text-gray-600">{stage.label}</span>
                    <div className="flex-1">
                      <div className="h-8 rounded-lg bg-gray-100 overflow-hidden">
                        <div
                          className={`h-full rounded-lg ${stage.color} flex items-center justify-end pr-3 transition-all`}
                          style={{ width: `${width}%` }}
                        >
                          <span className="text-xs font-bold text-white">{stage.value}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <CardTitle>Key Metrics</CardTitle>
            <div className="mt-6 space-y-6">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Reply Rate</span>
                  <span className="font-semibold">{stats.replyRate.toFixed(1)}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min(stats.replyRate, 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Partner Conversion</span>
                  <span className="font-semibold">{stats.partnerConversion.toFixed(1)}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-green-500" style={{ width: `${Math.min(stats.partnerConversion, 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Lead → Active Rate</span>
                  <span className="font-semibold">
                    {stats.leadsDiscovered > 0
                      ? ((stats.activePartners / stats.leadsDiscovered) * 100).toFixed(1)
                      : '0.0'}%
                  </span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{
                      width: `${stats.leadsDiscovered > 0 ? Math.min((stats.activePartners / stats.leadsDiscovered) * 100, 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
