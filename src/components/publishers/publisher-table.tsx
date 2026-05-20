'use client';

import { Publisher, formatTraffic, formatGmv, getTierColor } from '@/types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Mail, Linkedin, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

interface PublisherTableProps {
  publishers: Publisher[];
}

function CopyEmailButton({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }
  return (
    <button
      onClick={handleCopy}
      className="ml-1 rounded-md p-0.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
      title="Copy email"
    >
      {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

export function PublisherTable({ publishers }: PublisherTableProps) {
  if (publishers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-16">
        <p className="text-slate-500 font-medium">No publishers found</p>
        <p className="mt-1 text-sm text-slate-400">Use AI Discovery to find affiliate publishers</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Publisher</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Tier</TableHead>
          <TableHead>Traffic</TableHead>
          <TableHead>GMV</TableHead>
          <TableHead>Network</TableHead>
          <TableHead>Contact Email</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {publishers.map((pub) => (
          <TableRow key={pub.id}>
            <TableCell>
              <Link href={`/publishers/${pub.id}`} className="group">
                <p className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                  {pub.publisher_name}
                </p>
                {pub.domain && (
                  <p className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                    {pub.domain} <ExternalLink className="h-3 w-3" />
                  </p>
                )}
              </Link>
            </TableCell>
            <TableCell>
              {pub.category && (
                <Badge className="text-[11px] whitespace-nowrap">{pub.category}</Badge>
              )}
            </TableCell>
            <TableCell>
              {pub.tier_priority && (
                <Badge variant={getTierColor(pub.tier_priority) as 'success' | 'info' | 'default'}>
                  {pub.tier_priority}
                </Badge>
              )}
            </TableCell>
            <TableCell>
              <span className="font-semibold text-slate-700 tabular-nums">{formatTraffic(pub.estimated_monthly_visits)}</span>
            </TableCell>
            <TableCell>
              <span className="font-semibold text-slate-700 tabular-nums">{formatGmv(pub.historical_gmv)}</span>
            </TableCell>
            <TableCell>
              {pub.affiliate_network ? (
                <Badge variant="success" className="text-[11px]">{pub.affiliate_network}</Badge>
              ) : (
                <span className="text-slate-400">-</span>
              )}
            </TableCell>
            <TableCell>
              <div className="flex flex-col gap-1">
                {pub.contact_name && (
                  <p className="text-[11px] font-medium text-slate-700">{pub.contact_name}</p>
                )}
                {pub.contact_email ? (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3 text-indigo-500 shrink-0" />
                    <a
                      href={`mailto:${pub.contact_email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[11px] text-indigo-600 hover:underline truncate max-w-[160px]"
                      title={pub.contact_email}
                    >
                      {pub.contact_email}
                    </a>
                    <CopyEmailButton email={pub.contact_email} />
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400">No email</span>
                )}
                {pub.social_linkedin && (
                  <div className="flex items-center gap-1">
                    <Linkedin className="h-3 w-3 text-blue-500 shrink-0" />
                    <a
                      href={pub.social_linkedin.startsWith('http') ? pub.social_linkedin : `https://linkedin.com/in/${pub.social_linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[11px] text-blue-600 hover:underline"
                    >
                      LinkedIn
                    </a>
                  </div>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
