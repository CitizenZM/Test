'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MANAGED_BRANDS } from '@/types';
import { Save, ExternalLink, Key, Mail, Building2, Globe } from 'lucide-react';

export default function SettingsPage() {
  const [impactSid, setImpactSid] = useState('');
  const [impactToken, setImpactToken] = useState('');
  const [resendKey, setResendKey] = useState('');
  const [senderEmail, setSenderEmail] = useState('affiliate@celldigital.co');
  const [senderName, setSenderName] = useState('Cell Digital Partnerships');
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <Header title="Settings" description="Configure integrations and preferences" />

      <div className="p-8 space-y-6 max-w-4xl">
        {/* Managed Brands */}
        <Card>
          <CardTitle>Managed Brands</CardTitle>
          <p className="mt-1 text-sm text-gray-500">Brands under Cell Digital agency management</p>
          <div className="mt-4 space-y-3">
            {MANAGED_BRANDS.map((brand) => (
              <div key={brand.id} className="flex items-center justify-between rounded-lg border border-gray-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: brand.color + '20' }}>
                    <Building2 className="h-4 w-4" style={{ color: brand.color }} />
                  </div>
                  <div>
                    <p className="font-medium">{brand.name}</p>
                    <p className="text-xs text-gray-500">{brand.category}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a href={`https://${brand.domain}`} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline flex items-center gap-1">
                    <Globe className="h-3 w-3" /> {brand.domain}
                  </a>
                  <Badge variant="success">Active</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Impact.com Integration */}
        <Card>
          <div className="flex items-center gap-2">
            <CardTitle>Impact.com Integration</CardTitle>
            <Badge variant="info">Partner Platform</Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500">Connect to your Impact.com account to sync partners and track performance</p>
          <div className="mt-4 space-y-4">
            <Input
              id="impact-sid"
              label="Account SID"
              value={impactSid}
              onChange={(e) => setImpactSid(e.target.value)}
              placeholder="IRxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              type="password"
            />
            <Input
              id="impact-token"
              label="Auth Token"
              value={impactToken}
              onChange={(e) => setImpactToken(e.target.value)}
              placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              type="password"
            />
            <div className="flex items-center gap-3">
              <Button onClick={handleSave} disabled={!impactSid || !impactToken}>
                <Key className="mr-2 h-4 w-4" /> Save Credentials
              </Button>
              <a
                href="https://app.impact.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
              >
                Open Impact.com <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </Card>

        {/* Email Configuration */}
        <Card>
          <div className="flex items-center gap-2">
            <CardTitle>Email Configuration</CardTitle>
            <Badge variant="purple">Resend</Badge>
          </div>
          <p className="mt-1 text-sm text-gray-500">Configure email sending for outreach campaigns</p>
          <div className="mt-4 space-y-4">
            <Input
              id="resend-key"
              label="Resend API Key"
              value={resendKey}
              onChange={(e) => setResendKey(e.target.value)}
              placeholder="re_xxxxxxxxxxxx"
              type="password"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="sender-email"
                label="Sender Email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
              />
              <Input
                id="sender-name"
                label="Sender Name"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
              />
            </div>
            <Button onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" /> Save Email Settings
            </Button>
          </div>
        </Card>

        {/* API Keys */}
        <Card>
          <CardTitle>API Keys</CardTitle>
          <p className="mt-1 text-sm text-gray-500">Manage API keys for AI and integrations</p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">Anthropic API Key</span>
              </div>
              <Badge variant="success">Configured</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">Supabase Service Key</span>
              </div>
              <Badge variant="success">Configured</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">Resend API Key</span>
              </div>
              <Badge variant={resendKey ? 'success' : 'warning'}>{resendKey ? 'Configured' : 'Not Set'}</Badge>
            </div>
          </div>
        </Card>

        {saved && (
          <div className="fixed bottom-4 right-4 rounded-lg bg-green-50 border border-green-200 p-4 shadow-lg">
            <p className="text-sm text-green-700 font-medium">Settings saved successfully</p>
          </div>
        )}
      </div>
    </>
  );
}
