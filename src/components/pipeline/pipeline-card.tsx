'use client';

import { Outreach } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Globe, Mail, Linkedin } from 'lucide-react';
import { memo } from 'react';

interface PipelineCardProps {
  outreach: Outreach;
  onClick?: () => void;
}

export const PipelineCard = memo(function PipelineCard({ outreach, onClick }: PipelineCardProps) {
  const publisher = outreach.publisher;

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-xl border border-slate-200/60 bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_8px_rgba(0,0,0,0.06)] transition-all duration-200 hover:-translate-y-0.5"
    >
      <p className="font-semibold text-[13px] text-slate-800">{publisher?.publisher_name || 'Unknown'}</p>
      {publisher?.domain && (
        <p className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
          <Globe className="h-3 w-3" /> {publisher.domain}
        </p>
      )}
      <div className="mt-2.5 flex items-center gap-2">
        {outreach.channel === 'linkedin' && <Linkedin className="h-3.5 w-3.5 text-blue-500" />}
        {outreach.channel === 'email' && <Mail className="h-3.5 w-3.5 text-violet-500" />}
        {publisher?.tier_priority && (
          <Badge variant={publisher.tier_priority.includes('1') ? 'success' : 'default'}>
            {publisher.tier_priority}
          </Badge>
        )}
      </div>
    </div>
  );
});
