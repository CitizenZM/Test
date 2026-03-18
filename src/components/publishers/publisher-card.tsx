import { Publisher, normalizePublisher } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScoreBadge } from './score-badge';
import { formatNumber } from '@/lib/utils';
import { Globe, Mail, Linkedin, Users, DollarSign } from 'lucide-react';

interface PublisherCardProps {
  publisher: Publisher;
}

export function PublisherCard({ publisher: rawPub }: PublisherCardProps) {
  const publisher = normalizePublisher(rawPub);

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{publisher.name}</h2>
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
        <div className="flex gap-3">
          {publisher.publisher_score ? <ScoreBadge score={publisher.publisher_score} label="Overall" /> : null}
          {publisher.affiliate_fit_score ? <ScoreBadge score={publisher.affiliate_fit_score} label="Fit" /> : null}
          {publisher.traffic_score ? <ScoreBadge score={publisher.traffic_score} label="Traffic" /> : null}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Category</p>
          <p className="mt-1">{publisher.category || '-'}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Content Type</p>
          <p className="mt-1">{publisher.content_type || '-'}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Est. Traffic</p>
          <p className="mt-1 flex items-center gap-1">
            <Users className="h-4 w-4 text-gray-400" />
            {publisher.traffic_estimate ? formatNumber(publisher.traffic_estimate) + '/mo' : '-'}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Network</p>
          <p className="mt-1">
            {publisher.affiliate_network ? (
              <Badge variant="success">{publisher.affiliate_network}</Badge>
            ) : (
              <Badge variant="default">Unknown</Badge>
            )}
          </p>
        </div>
        {publisher.tier_priority && (
          <div>
            <p className="text-sm font-medium text-gray-500">Priority</p>
            <p className="mt-1"><Badge variant="info">{publisher.tier_priority}</Badge></p>
          </div>
        )}
        {publisher.historical_gmv && (
          <div>
            <p className="text-sm font-medium text-gray-500">Historical GMV</p>
            <p className="mt-1 flex items-center gap-1">
              <DollarSign className="h-4 w-4 text-gray-400" />
              {formatNumber(publisher.historical_gmv)}
            </p>
          </div>
        )}
        {publisher.countries && (
          <div>
            <p className="text-sm font-medium text-gray-500">Countries</p>
            <p className="mt-1 text-sm">{publisher.countries}</p>
          </div>
        )}
        {publisher.onboarding_priority && (
          <div>
            <p className="text-sm font-medium text-gray-500">Onboarding</p>
            <p className="mt-1"><Badge variant="purple">{publisher.onboarding_priority}</Badge></p>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {publisher.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-gray-400" />
            <a href={`mailto:${publisher.email}`} className="text-indigo-600 hover:underline">
              {publisher.email}
            </a>
          </div>
        )}
        {publisher.linkedin && (
          <div className="flex items-center gap-2 text-sm">
            <Linkedin className="h-4 w-4 text-gray-400" />
            <a href={publisher.linkedin} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
              LinkedIn Profile
            </a>
          </div>
        )}
      </div>

      {publisher.notes && (
        <div className="mt-6">
          <p className="text-sm font-medium text-gray-500">Notes</p>
          <p className="mt-1 text-sm text-gray-700">{publisher.notes}</p>
        </div>
      )}
    </Card>
  );
}
