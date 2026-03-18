'use client';

import { Outreach, PIPELINE_STAGES, OutreachStatus } from '@/types';
import { PipelineCard } from './pipeline-card';
import { cn } from '@/lib/utils';

interface PipelineBoardProps {
  outreachItems: Outreach[];
  onStatusChange: (id: string, newStatus: OutreachStatus) => void;
}

export function PipelineBoard({ outreachItems, onStatusChange }: PipelineBoardProps) {
  function handleDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.setData('text/plain', id);
  }

  function handleDrop(e: React.DragEvent, status: OutreachStatus) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    onStatusChange(id, status);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {PIPELINE_STAGES.map((stage) => {
        const items = outreachItems.filter((o) => o.status === stage.key);
        return (
          <div
            key={stage.key}
            className="flex-shrink-0 w-72"
            onDrop={(e) => handleDrop(e, stage.key)}
            onDragOver={handleDragOver}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={cn('h-2.5 w-2.5 rounded-full', stage.color)} />
              <h3 className="text-sm font-semibold text-gray-700">{stage.label}</h3>
              <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                {items.length}
              </span>
            </div>
            <div className="space-y-2 rounded-lg bg-gray-50 p-2 min-h-[200px]">
              {items.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id)}
                >
                  <PipelineCard outreach={item} />
                </div>
              ))}
              {items.length === 0 && (
                <p className="text-center text-xs text-gray-400 py-8">Drop here</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
