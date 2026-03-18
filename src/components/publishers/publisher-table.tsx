'use client';

import { Publisher, normalizePublisher } from '@/types';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScoreBadge } from './score-badge';
import { formatNumber } from '@/lib/utils';
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
          <TableHead>Type</TableHead>
          <TableHead>Traffic</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Network</TableHead>
          <TableHead>Contact</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {publishers.map((rawPub) => {
          const pub = normalizePublisher(rawPub);
          return (
            <TableRow key={pub.id}>
              <TableCell>
                <Link href={`/publishers/${pub.id}`} className="group">
                  <p className="font-medium text-gray-900 group-hover:text-indigo-600">
                    {pub.name}
                  </p>
                  {(pub.website || pub.domain) && (
                    <p className="flex items-center gap-1 text-xs text-gray-400">
                      {pub.domain || pub.website} <ExternalLink className="h-3 w-3" />
                    </p>
                  )}
                </Link>
              </TableCell>
              <TableCell>
                {pub.category && <Badge>{pub.category}</Badge>}
              </TableCell>
              <TableCell>
                <span className="text-gray-600">{pub.content_type || '-'}</span>
              </TableCell>
              <TableCell>
                <span className="font-medium">
                  {pub.traffic_estimate ? formatNumber(pub.traffic_estimate) : '-'}
                </span>
              </TableCell>
              <TableCell>
                {pub.publisher_score ? <ScoreBadge score={pub.publisher_score} size="sm" /> : '-'}
              </TableCell>
              <TableCell>
                {pub.affiliate_friendly ? (
                  <Badge variant="success">{pub.affiliate_network || 'Yes'}</Badge>
                ) : (
                  <Badge variant="default">Unknown</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  {pub.email && <Badge variant="info">Email</Badge>}
                  {pub.linkedin && <Badge variant="purple">LinkedIn</Badge>}
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
