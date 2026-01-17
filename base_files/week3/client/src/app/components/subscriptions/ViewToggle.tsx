'use client';

import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
}

export default function ViewToggle({ view, onViewChange }: ViewToggleProps) {
  return (
    <div className="flex items-center bg-[#0f0f0f] rounded-lg border border-[#2a2a2a] p-1">
      <button
        onClick={() => onViewChange('grid')}
        className={cn(
          'p-2 rounded-md transition-colors',
          view === 'grid'
            ? 'bg-[#1a1a1a] text-white'
            : 'text-gray-400 hover:text-white'
        )}
        title="Grid view"
      >
        <LayoutGrid className="w-4 h-4" />
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={cn(
          'p-2 rounded-md transition-colors',
          view === 'list'
            ? 'bg-[#1a1a1a] text-white'
            : 'text-gray-400 hover:text-white'
        )}
        title="List view"
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
}
