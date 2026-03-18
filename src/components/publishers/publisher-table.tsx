'use client';

import { Publisher, formatTraffic, formatGmv, getTierColor, getPriorityColor } from '@/types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface PublisherTableProps {
  publishers: Publisher[];
}

export function PublisherTable({ publishers }: PublisherTableProps) {
  if (publishers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white py-16">
        <p className="text-gray-500">No publishers found</p>
        <p className="mt-1 text-sm text-gray-400">Use AI Discovery to find affiliate publishers</p>
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
          <TableHead>Contact</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {publishers.map((pub) => (
          <TableRow key={pub.id}>
            <TableCell>
              <Link href={`/publishers/${pub.id}`} className="group">
                <p className="font-medium text-gray-900 group-hover:text-indigo-600">
                  {pub.publisher_name}
                </p>
                {pub.domain && (
                  <p className="flex items-center gap-1 text-xs text-gray-400">
                    {pub.domain} <ExternalLink className="h-3 w-3" />
                  </p>
                )}
              </Link>
            </TableCell>
            <TableCell>
              {pub.category && <Badge>{pub.category}</Badge>}
            </TableCell>
            <TableCell>
              {pub.tier_priority && (
                <Badge variant={getTierColor(pub.tier_priority) as 'success' | 'info' | 'default'}>
                  {pub.tier_priority}
                </Badge>
              )}
            </TableCell>
            <TableCell>
              <span className="font-medium">{formatTraffic(pub.estimated_monthly_visits)}</span>
            </TableCell>
            <TableCell>
              <span className="font-medium">{formatGmv(pub.historical_gmv)}</span>
            </TableCell>
            <TableCell>
              {pub.affiliate_network ? (
                <Badge variant="success">{pub.affiliate_network}</Badge>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                {pub.contact_email && <Badge variant="info">Email</Badge>}
                {pub.social_linkedin && <Badge variant="purple">LinkedIn</Badge>}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
