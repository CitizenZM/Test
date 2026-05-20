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

      <div className="p-8 space-y-8 animate-fade-in">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Leads Discovered" value={stats.leadsDiscovered.toLocaleString()} icon={Users} iconColor="text-blue-600 bg-blue-50" />
          <StatCard title="Outreach Sent" value={stats.outreachSent} icon={Mail} iconColor="text-indigo-600 bg-indigo-50" />
          <StatCard title="Replies" value={stats.replies} icon={MessageSquare} iconColor="text-amber-600 bg-amber-50" />
          <StatCard title="Meetings" value={stats.meetings} icon={CalendarCheck} iconColor="text-violet-600 bg-violet-50" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Partners" value={stats.partners} icon={Handshake} iconColor="text-emerald-600 bg-emerald-50" />
          <StatCard title="Active Partners" value={stats.activePartners} icon={TrendingUp} iconColor="text-teal-600 bg-teal-50" />
          <StatCard title="Reply Rate" value={`${stats.replyRate.toFixed(1)}%`} icon={Percent} iconColor="text-orange-600 bg-orange-50" />
          <StatCard title="Conversion Rate" value={`${stats.partnerConversion.toFixed(1)}%`} icon={Target} iconColor="text-rose-600 bg-rose-50" />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardTitle>Pipeline Funnel</CardTitle>
            <div className="mt-6 space-y-3">
              {[
                { label: 'Leads', value: stats.leadsDiscovered, color: 'bg-slate-400' },
                { label: 'Contacted', value: stats.outreachSent, color: 'bg-blue-500' },
                { label: 'Replied', value: stats.replies, color: 'bg-amber-500' },
                { label: 'Meetings', value: stats.meetings, color: 'bg-violet-500' },
                { label: 'Partners', value: stats.partners, color: 'bg-emerald-500' },
                { label: 'Active', value: stats.activePartners, color: 'bg-teal-500' },
              ].map((stage) => {
                const maxVal = Math.max(stats.leadsDiscovered, 1);
                const width = Math.max((stage.value / maxVal) * 100, 2);
                return (
                  <div key={stage.label} className="flex items-center gap-4">
                    <span className="w-24 text-[13px] font-medium text-slate-600">{stage.label}</span>
                    <div className="flex-1">
                      <div className="h-8 rounded-xl bg-slate-100/80 overflow-hidden">
                        <div
                          className={`h-full rounded-xl ${stage.color} flex items-center justify-end pr-3 transition-all duration-500`}
                          style={{ width: `${width}%` }}
                        >
                          <span className="text-[11px] font-bold text-white">{stage.value}</span>
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
                  <span className="text-slate-500 font-medium">Reply Rate</span>
                  <span className="font-bold text-slate-800">{stats.replyRate.toFixed(1)}%</span>
                </div>
                <div className="mt-2 h-2.5 rounded-full bg-slate-100/80">
                  <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-400 transition-all duration-500" style={{ width: `${Math.min(stats.replyRate, 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Partner Conversion</span>
                  <span className="font-bold text-slate-800">{stats.partnerConversion.toFixed(1)}%</span>
                </div>
                <div className="mt-2 h-2.5 rounded-full bg-slate-100/80">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-500" style={{ width: `${Math.min(stats.partnerConversion, 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 font-medium">Lead → Active Rate</span>
                  <span className="font-bold text-slate-800">
                    {stats.leadsDiscovered > 0
                      ? ((stats.activePartners / stats.leadsDiscovered) * 100).toFixed(1)
                      : '0.0'}%
                  </span>
                </div>
                <div className="mt-2 h-2.5 rounded-full bg-slate-100/80">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-500"
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
