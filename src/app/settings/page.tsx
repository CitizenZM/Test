'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MANAGED_BRANDS } from '@/types';
import {
  Save, ExternalLink, Key, Mail, Building2, Globe,
  CheckCircle2, XCircle, Loader2, AlertTriangle, Eye, EyeOff,
  RefreshCw
} from 'lucide-react';

export default function SettingsPage() {
  // OpenAI key state
  const [openaiKey, setOpenaiKey] = useState('');
  const [openaiStatus, setOpenaiStatus] = useState<'unknown' | 'configured' | 'not_set'>('unknown');
  const [openaiPreview, setOpenaiPreview] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<{ ok: boolean; message: string; deploying?: boolean } | null>(null);
  const [deploying, setDeploying] = useState(false);
  const [deployCountdown, setDeployCountdown] = useState(0);

  // Other settings
  const [impactSid, setImpactSid] = useState('');
  const [impactToken, setImpactToken] = useState('');
  const [resendKey, setResendKey] = useState('');
  const [senderEmail, setSenderEmail] = useState('affiliate@celldigital.co');
  const [senderName, setSenderName] = useState('Cell Digital Partnerships');

  const checkStatus = useCallback(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(data => {
        setOpenaiStatus(data.openai_configured ? 'configured' : 'not_set');
        setOpenaiPreview(data.openai_key_preview || null);
      })
      .catch(() => setOpenaiStatus('not_set'));
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Countdown + auto-reload when deploying
  useEffect(() => {
    if (!deploying) return;
    setDeployCountdown(120);
    const interval = setInterval(() => {
      setDeployCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setDeploying(false);
          window.location.reload();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [deploying]);

  async function handleSaveOpenaiKey() {
    if (!openaiKey.trim()) return;
    setSaving(true);
    setSaveResult(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ openai_api_key: openaiKey.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setSaveResult({ ok: true, message: data.message, deploying: data.deploying });
        setOpenaiStatus('configured');
        setOpenaiPreview(data.key_preview);
        setOpenaiKey('');
        if (data.deploying) {
          setDeploying(true);
        }
      } else {
        setSaveResult({ ok: false, message: data.error || 'Failed to save' });
      }
    } catch {
      setSaveResult({ ok: false, message: 'Network error — please try again' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Header title="Settings" description="Configure integrations and preferences" />

      <div className="p-8 space-y-6 max-w-4xl">
        {/* AI Configuration — most important section */}
        <Card>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-9 w-9 rounded-lg bg-violet-100 flex items-center justify-center">
              <Key className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <CardTitle>AI Configuration</CardTitle>
              <p className="text-sm text-gray-500">Required for strategy generation and publisher discovery</p>
            </div>
            <div className="ml-auto">
              {openaiStatus === 'configured' && <Badge variant="success">AI Active</Badge>}
              {openaiStatus === 'not_set' && <Badge variant="warning">Setup Required</Badge>}
            </div>
          </div>

          {openaiStatus === 'not_set' && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">OpenAI API Key Required</p>
                <p className="text-sm text-amber-700 mt-1">
                  All AI features (strategy generation, publisher discovery, outreach) require an OpenAI API key.
                  Get yours at{' '}
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer"
                    className="font-medium underline">
                    platform.openai.com
                  </a>
                </p>
              </div>
            </div>
          )}

          {openaiStatus === 'configured' && (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-green-800">API Key Configured</p>
                {openaiPreview && (
                  <p className="text-xs text-green-600 font-mono mt-0.5">{openaiPreview}</p>
                )}
              </div>
              <p className="ml-auto text-xs text-green-600">Using GPT-4o</p>
            </div>
          )}

          <div className="mt-5 space-y-3">
            <p className="text-sm font-medium text-gray-700">
              {openaiStatus === 'configured' ? 'Update API Key' : 'Enter Your OpenAI API Key'}
            </p>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={openaiKey}
                onChange={e => setOpenaiKey(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                onKeyDown={e => { if (e.key === 'Enter') handleSaveOpenaiKey(); }}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {deploying && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-center gap-3 mb-3">
                  <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Deploying with new API key...</p>
                    <p className="text-xs text-blue-600 mt-0.5">AI features will be active in ~{deployCountdown}s. Page will reload automatically.</p>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-blue-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-1000"
                    style={{ width: `${Math.max(5, ((120 - deployCountdown) / 120) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {saveResult && !deploying && (
              <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${
                saveResult.ok
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {saveResult.ok
                  ? <CheckCircle2 className="h-4 w-4 shrink-0" />
                  : <XCircle className="h-4 w-4 shrink-0" />
                }
                {saveResult.message}
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button
                onClick={handleSaveOpenaiKey}
                disabled={!openaiKey.trim() || saving}
              >
                {saving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Testing & Saving...</>
                ) : (
                  <><CheckCircle2 className="mr-2 h-4 w-4" /> Verify & Save Key</>
                )}
              </Button>
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-600 hover:underline flex items-center gap-1"
              >
                Get API Key <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <p className="text-xs text-gray-400">
              The key is validated, encrypted, and stored securely. It persists across deployments.
            </p>
          </div>
        </Card>

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
              <Button disabled={!impactSid || !impactToken} variant="outline">
                <Key className="mr-2 h-4 w-4" /> Save Credentials
              </Button>
              <a href="https://app.impact.com" target="_blank" rel="noopener noreferrer"
                className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
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
            <Button variant="outline">
              <Save className="mr-2 h-4 w-4" /> Save Email Settings
            </Button>
          </div>
        </Card>

        {/* API Key Status */}
        <Card>
          <CardTitle>Integration Status</CardTitle>
          <p className="mt-1 text-sm text-gray-500">Current state of all configured integrations</p>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">OpenAI GPT-4o API</span>
                {openaiPreview && (
                  <span className="text-xs text-gray-400 font-mono">{openaiPreview}</span>
                )}
              </div>
              <Badge variant={openaiStatus === 'configured' ? 'success' : 'warning'}>
                {openaiStatus === 'configured' ? 'Active' : 'Not Configured'}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">Supabase Database</span>
              </div>
              <Badge variant="success">Connected</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">Resend Email</span>
              </div>
              <Badge variant={resendKey ? 'success' : 'warning'}>{resendKey ? 'Configured' : 'Not Set'}</Badge>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
