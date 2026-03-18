'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { PipelineBoard } from '@/components/pipeline/pipeline-board';
import { Outreach, OutreachStatus } from '@/types';
import { Loader2 } from 'lucide-react';

export default function PipelinePage() {
  const [outreachItems, setOutreachItems] = useState<Outreach[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/outreach');
        if (res.ok) {
          setOutreachItems(await res.json());
        }
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleStatusChange(id: string, newStatus: OutreachStatus) {
    setOutreachItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );

    try {
      await fetch(`/api/outreach`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch {
      // Revert on error
    }
  }

  return (
    <>
      <Header
        title="Pipeline"
        description="Manage your affiliate recruitment pipeline"
      />

      <div className="p-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <PipelineBoard outreachItems={outreachItems} onStatusChange={handleStatusChange} />
        )}
      </div>
    </>
  );
}
