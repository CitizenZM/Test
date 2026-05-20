import { Publisher, formatTraffic, formatGmv } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Mail, Linkedin, Users, DollarSign, MapPin, Calendar } from 'lucide-react';

interface PublisherCardProps {
  publisher: Publisher;
}

export function PublisherCard({ publisher }: PublisherCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">{publisher.publisher_name}</h2>
          {(publisher.website || publisher.domain) && (
            <a
              href={(publisher.website || publisher.domain || '').startsWith('http') ? (publisher.website || publisher.domain)! : `https://${publisher.website || publisher.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 flex items-center gap-1 text-sm text-indigo-600 hover:underline"
            >
              <Globe className="h-4 w-4" /> {publisher.domain || publisher.website}
            </a>
          )}
        </div>
        <div className="flex gap-2">
          {publisher.tier_priority && <Badge variant="info">{publisher.tier_priority}</Badge>}
          {publisher.onboarding_priority && <Badge variant="purple">{publisher.onboarding_priority}</Badge>}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div>
          <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">Category</p>
          <p className="mt-1 text-sm text-slate-800 font-medium">{publisher.category || '-'}</p>
        </div>
        <div>
          <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">Affiliate Type</p>
          <p className="mt-1 text-sm text-slate-800 font-medium">{publisher.affiliate_type || '-'}</p>
        </div>
        <div>
          <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">Est. Monthly Visits</p>
          <p className="mt-1 flex items-center gap-1 text-sm text-slate-800 font-medium">
            <Users className="h-4 w-4 text-slate-400" />
            {formatTraffic(publisher.estimated_monthly_visits)}
          </p>
        </div>
        <div>
          <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">Network</p>
          <p className="mt-1">
            {publisher.affiliate_network ? (
              <Badge variant="success">{publisher.affiliate_network}</Badge>
            ) : (
              <span className="text-slate-400">-</span>
            )}
          </p>
        </div>
        {publisher.historical_gmv != null && publisher.historical_gmv > 0 && (
          <div>
            <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">Historical GMV</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-800 font-medium">
              <DollarSign className="h-4 w-4 text-slate-400" />
              {formatGmv(publisher.historical_gmv)}
            </p>
          </div>
        )}
        {publisher.historical_transactions != null && publisher.historical_transactions > 0 && (
          <div>
            <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">Transactions</p>
            <p className="mt-1 text-sm text-slate-800 font-medium">{publisher.historical_transactions.toLocaleString()}</p>
          </div>
        )}
        {publisher.historical_roi != null && (
          <div>
            <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">Historical ROI</p>
            <p className="mt-1 text-sm text-slate-800 font-medium">{(publisher.historical_roi * 100).toFixed(1)}%</p>
          </div>
        )}
        {publisher.countries && (
          <div>
            <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">Countries</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-800">
              <MapPin className="h-4 w-4 text-slate-400" />
              {publisher.countries}
            </p>
          </div>
        )}
        {publisher.headquarters && (
          <div>
            <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">Headquarters</p>
            <p className="mt-1 text-sm text-slate-800">{publisher.headquarters}</p>
          </div>
        )}
        {publisher.founded_year && (
          <div>
            <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">Founded</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-800">
              <Calendar className="h-4 w-4 text-slate-400" />
              {publisher.founded_year}
            </p>
          </div>
        )}
        {publisher.domain_authority != null && (
          <div>
            <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">Domain Authority</p>
            <p className="mt-1 text-sm text-slate-800 font-medium">{publisher.domain_authority}</p>
          </div>
        )}
        {publisher.mau != null && publisher.mau > 0 && (
          <div>
            <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">MAU</p>
            <p className="mt-1 text-sm text-slate-800 font-medium">{formatTraffic(publisher.mau)}</p>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-2.5">
        {publisher.contact_email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-indigo-400" />
            <a href={`mailto:${publisher.contact_email}`} className="text-indigo-600 hover:underline">
              {publisher.contact_email}
            </a>
            {publisher.contact_name && <span className="text-slate-500">({publisher.contact_name})</span>}
          </div>
        )}
        {publisher.social_linkedin && (
          <div className="flex items-center gap-2 text-sm">
            <Linkedin className="h-4 w-4 text-blue-400" />
            <a href={publisher.social_linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              LinkedIn Profile
            </a>
          </div>
        )}
      </div>

      {publisher.description && (
        <div className="mt-6">
          <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">Description</p>
          <p className="mt-1.5 text-[13px] text-slate-700 leading-relaxed">{publisher.description}</p>
        </div>
      )}

      {publisher.summary_note && (
        <div className="mt-4">
          <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">Notes</p>
          <p className="mt-1.5 text-[13px] text-slate-700 leading-relaxed">{publisher.summary_note}</p>
        </div>
      )}

      {publisher.tcl_focus_areas && (
        <div className="mt-4">
          <p className="text-[12px] font-medium text-slate-500 uppercase tracking-wide">TCL Focus Areas</p>
          <p className="mt-1.5 text-[13px] text-slate-700 leading-relaxed">{publisher.tcl_focus_areas}</p>
        </div>
      )}
    </Card>
  );
}
