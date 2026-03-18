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
          <h2 className="text-xl font-bold text-gray-900">{publisher.publisher_name}</h2>
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
          <p className="text-sm font-medium text-gray-500">Category</p>
          <p className="mt-1">{publisher.category || '-'}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Affiliate Type</p>
          <p className="mt-1">{publisher.affiliate_type || '-'}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Est. Monthly Visits</p>
          <p className="mt-1 flex items-center gap-1">
            <Users className="h-4 w-4 text-gray-400" />
            {formatTraffic(publisher.estimated_monthly_visits)}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Network</p>
          <p className="mt-1">
            {publisher.affiliate_network ? (
              <Badge variant="success">{publisher.affiliate_network}</Badge>
            ) : (
              <span className="text-gray-400">-</span>
            )}
          </p>
        </div>
        {publisher.historical_gmv != null && publisher.historical_gmv > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-500">Historical GMV</p>
            <p className="mt-1 flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-gray-400" />
              {formatGmv(publisher.historical_gmv)}
            </p>
          </div>
        )}
        {publisher.historical_transactions != null && publisher.historical_transactions > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-500">Transactions</p>
            <p className="mt-1">{publisher.historical_transactions.toLocaleString()}</p>
          </div>
        )}
        {publisher.historical_roi != null && (
          <div>
            <p className="text-sm font-medium text-gray-500">Historical ROI</p>
            <p className="mt-1">{(publisher.historical_roi * 100).toFixed(1)}%</p>
          </div>
        )}
        {publisher.countries && (
          <div>
            <p className="text-sm font-medium text-gray-500">Countries</p>
            <p className="mt-1 flex items-center gap-1 text-sm">
              <MapPin className="h-4 w-4 text-gray-400" />
              {publisher.countries}
            </p>
          </div>
        )}
        {publisher.headquarters && (
          <div>
            <p className="text-sm font-medium text-gray-500">Headquarters</p>
            <p className="mt-1 text-sm">{publisher.headquarters}</p>
          </div>
        )}
        {publisher.founded_year && (
          <div>
            <p className="text-sm font-medium text-gray-500">Founded</p>
            <p className="mt-1 flex items-center gap-1 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              {publisher.founded_year}
            </p>
          </div>
        )}
        {publisher.domain_authority != null && (
          <div>
            <p className="text-sm font-medium text-gray-500">Domain Authority</p>
            <p className="mt-1">{publisher.domain_authority}</p>
          </div>
        )}
        {publisher.mau != null && publisher.mau > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-500">MAU</p>
            <p className="mt-1">{formatTraffic(publisher.mau)}</p>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {publisher.contact_email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-gray-400" />
            <a href={`mailto:${publisher.contact_email}`} className="text-indigo-600 hover:underline">
              {publisher.contact_email}
            </a>
            {publisher.contact_name && <span className="text-gray-500">({publisher.contact_name})</span>}
          </div>
        )}
        {publisher.social_linkedin && (
          <div className="flex items-center gap-2 text-sm">
            <Linkedin className="h-4 w-4 text-gray-400" />
            <a href={publisher.social_linkedin} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
              LinkedIn Profile
            </a>
          </div>
        )}
      </div>

      {publisher.description && (
        <div className="mt-6">
          <p className="text-sm font-medium text-gray-500">Description</p>
          <p className="mt-1 text-sm text-gray-700">{publisher.description}</p>
        </div>
      )}

      {publisher.summary_note && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-500">Notes</p>
          <p className="mt-1 text-sm text-gray-700">{publisher.summary_note}</p>
        </div>
      )}

      {publisher.tcl_focus_areas && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-500">TCL Focus Areas</p>
          <p className="mt-1 text-sm text-gray-700">{publisher.tcl_focus_areas}</p>
        </div>
      )}
    </Card>
  );
}
