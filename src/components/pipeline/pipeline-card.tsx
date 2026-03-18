'use client';

import { Outreach } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Globe, Mail, Linkedin } from 'lucide-react';

interface PipelineCardProps {
  outreach: Outreach;
  onClick?: () => void;
}

export function PipelineCard({ outreach, onClick }: PipelineCardProps) {
  const publisher = outreach.publisher;

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-lg border border-gray-200 bg-white p-3 shadow-sm hover:shadow-md transition-shadow"
    >
      <p className="font-medium text-sm text-gray-900">{publisher?.publisher_name || 'Unknown'}</p>
      {publisher?.domain && (
        <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
          <Globe className="h-3 w-3" /> {publisher.domain}
        </p>
      )}
      <div className="mt-2 flex items-center gap-2">
        {outreach.channel === 'linkedin' && <Linkedin className="h-3.5 w-3.5 text-blue-600" />}
        {outreach.channel === 'email' && <Mail className="h-3.5 w-3.5 text-purple-600" />}
        {publisher?.tier_priority && (
          <Badge variant={publisher.tier_priority.includes('1') ? 'success' : 'default'}>
            {publisher.tier_priority}
          </Badge>
        )}
      </div>
    </div>
  );
}
