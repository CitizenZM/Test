'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Zap } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      window.location.href = '/';
      setLoading(false);
    }, 1000);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f9fc]">
      <div className="w-full max-w-md animate-fade-in">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">AffiliateHunter</h1>
            <p className="text-[10px] font-semibold text-indigo-500 uppercase tracking-widest">AI Platform</p>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200/60 bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          <h2 className="text-lg font-bold text-slate-800 text-center mb-1">Welcome back</h2>
          <p className="text-sm text-slate-500 text-center mb-6">Sign in to your account to continue</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            <Input id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>
        <p className="mt-6 text-center text-[12px] text-slate-400">
          AI-powered affiliate recruitment platform
        </p>
      </div>
    </div>
  );
}
