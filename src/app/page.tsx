'use client';

import dynamic from 'next/dynamic';

const GameCanvas = dynamic(() => import('@/components/GameCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen bg-slate-900">
      <div className="text-center">
        <div className="text-4xl font-bold text-amber-400 mb-4 animate-pulse">
          PIXEL OFFICE
        </div>
        <div className="text-gray-400">Loading game...</div>
        <div className="mt-4 w-48 h-2 bg-slate-700 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full animate-loading" />
        </div>
      </div>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <GameCanvas />
        <div className="mt-4 text-center space-y-2">
          <div className="flex justify-center gap-6 text-sm text-gray-500">
            <span>Arrow Keys / WASD - Move</span>
            <span>E - Interact</span>
            <span>ESC - Cancel</span>
          </div>
          <p className="text-xs text-gray-600">
            Pixel Office v1.0 - A fun office game for kids!
          </p>
        </div>
      </div>
    </main>
  );
}
