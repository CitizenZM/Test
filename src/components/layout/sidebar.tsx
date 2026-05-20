'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Search,
  Mail,
  Megaphone,
  KanbanSquare,
  BarChart3,
  Settings,
  Zap,
  Building2,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MANAGED_BRANDS } from '@/types';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Brand Profiles', href: '/brands', icon: Building2 },
  { name: 'Publisher Finder', href: '/publishers', icon: Search },
  { name: 'AI Outreach', href: '/outreach', icon: Mail },
  { name: 'Campaigns', href: '/campaigns', icon: Megaphone },
  { name: 'Pipeline', href: '/pipeline', icon: KanbanSquare },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-[260px] flex-col bg-[#0f1225] text-white">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
          <Zap className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-[15px] font-bold tracking-tight">AffiliateHunter</span>
          <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest">AI Platform</span>
        </div>
      </div>

      <div className="mx-4 my-2 h-px bg-white/[0.06]" />

      <div className="px-3 py-2">
        <p className="px-3 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Brands</p>
        <div className="space-y-0.5">
          {MANAGED_BRANDS.map((brand) => (
            <div
              key={brand.id}
              className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[13px] text-slate-400 hover:text-slate-300 hover:bg-white/[0.04] transition-colors cursor-default"
            >
              <div
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: brand.color, boxShadow: `0 0 0 2px #0f1225, 0 0 0 3px ${brand.color}40` }}
              />
              <span className="font-medium">{brand.name}</span>
              <span className="ml-auto text-[10px] text-slate-600">{brand.category}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-4 my-2 h-px bg-white/[0.06]" />

      <nav className="flex-1 space-y-0.5 px-3 py-2">
        <p className="px-3 mb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Menu</p>
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
              )}
            >
              <item.icon className={cn('h-[18px] w-[18px]', isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300')} />
              <span>{item.name}</span>
              {isActive && <ChevronRight className="ml-auto h-3.5 w-3.5 text-white/60" />}
            </Link>
          );
        })}
      </nav>

      <div className="mx-4 mb-2 h-px bg-white/[0.06]" />

      <div className="px-3 pb-4">
        <Link
          href="/settings"
          className={cn(
            'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200',
            pathname === '/settings'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/[0.06]'
          )}
        >
          <Settings className={cn('h-[18px] w-[18px]', pathname === '/settings' ? 'text-white' : 'text-slate-500 group-hover:text-slate-300')} />
          Settings
        </Link>
      </div>
    </aside>
  );
}
