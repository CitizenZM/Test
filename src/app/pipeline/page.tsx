'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { PipelineBoard } from '@/components/pipeline/pipeline-board';
import { useToast, ToastContainer } from '@/components/ui/toast';
import { Outreach, OutreachStatus } from '@/types';
import { Loader2 } from 'lucide-react';

export default function PipelinePage() {
  const [outreachItems, setOutreachItems] = useState<Outreach[]>([]);
  const [loading, setLoading] = useState(true);
  const { toasts, toast, removeToast } = useToast();

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/outreach');
        if (res.ok) {
          setOutreachItems(await res.json());
        } else {
          toast.error('Failed to load pipeline data');
        }
      } catch {
        toast.error('Network error loading pipeline');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  async function handleStatusChange(id: string, newStatus: OutreachStatus) {
    const previousItems = [...outreachItems];
    setOutreachItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );

    try {
      const res = await fetch(`/api/outreach`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Status updated to "${newStatus}"`);
      } else {
        setOutreachItems(previousItems);
        toast.error('Failed to update status');
      }
    } catch {
      setOutreachItems(previousItems);
      toast.error('Network error updating status');
    }
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
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
