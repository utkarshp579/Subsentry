'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import * as Popover from '@radix-ui/react-popover';

interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  error?: boolean;
  disabled?: boolean;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  minDate,
  maxDate,
  error,
  disabled,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (date: Date | undefined) => {
    onChange?.(date);
    setOpen(false);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'flex h-11 w-full items-center justify-between rounded-lg border bg-[#0f0f0f] px-3 py-2 text-sm',
            'border-[#2a2a2a] text-white placeholder:text-gray-500',
            'focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50',
            'hover:border-[#3a3a3a] transition-colors',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50',
            className
          )}
        >
          <span className={cn(!value && 'text-gray-500')}>
            {value ? format(value, 'PPP') : placeholder}
          </span>
          <CalendarIcon className="h-4 w-4 text-gray-400" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={8}
          className={cn(
            'z-50 rounded-xl border border-[#2a2a2a] bg-[#0a0a0a] p-3 shadow-xl',
            'animate-in fade-in-0 zoom-in-95',
            'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95'
          )}
        >
          <DayPicker
            mode="single"
            selected={value}
            onSelect={handleSelect}
            disabled={minDate ? { before: minDate } : undefined}
            fromDate={minDate}
            toDate={maxDate}
            showOutsideDays
            classNames={{
              months: 'flex flex-col sm:flex-row gap-4',
              month: 'space-y-4',
              month_caption: 'flex justify-center pt-1 relative items-center mb-2',
              caption_label: 'text-sm font-medium text-white',
              nav: 'flex items-center gap-1',
              button_previous: cn(
                'absolute left-1 h-7 w-7 bg-transparent p-0 text-gray-400',
                'hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors',
                'flex items-center justify-center'
              ),
              button_next: cn(
                'absolute right-1 h-7 w-7 bg-transparent p-0 text-gray-400',
                'hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors',
                'flex items-center justify-center'
              ),
              month_grid: 'w-full border-collapse space-y-1',
              weekdays: 'flex',
              weekday: 'text-gray-500 rounded-md w-9 font-normal text-[0.8rem] text-center',
              week: 'flex w-full mt-2',
              day: cn(
                'h-9 w-9 text-center text-sm p-0 relative',
                'focus-within:relative focus-within:z-20'
              ),
              day_button: cn(
                'h-9 w-9 p-0 font-normal rounded-lg',
                'text-gray-300 hover:bg-[#1a1a1a] hover:text-white',
                'focus:outline-none focus:ring-2 focus:ring-blue-500/50',
                'transition-colors cursor-pointer',
                'flex items-center justify-center'
              ),
              selected: cn(
                '[&>button]:bg-blue-600 [&>button]:text-white [&>button]:hover:bg-blue-700',
                '[&>button]:font-semibold'
              ),
              today: '[&>button]:bg-[#1a1a1a] [&>button]:text-blue-400',
              outside: '[&>button]:text-gray-600 [&>button]:opacity-50',
              disabled: '[&>button]:text-gray-600 [&>button]:opacity-30 [&>button]:cursor-not-allowed [&>button]:hover:bg-transparent',
              hidden: 'invisible',
            }}
            components={{
              Chevron: ({ orientation }) =>
                orientation === 'left' ? (
                  <ChevronLeft className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                ),
            }}
          />

          {/* Quick actions */}
          <div className="mt-3 pt-3 border-t border-[#2a2a2a] flex items-center justify-between">
            <button
              type="button"
              onClick={() => handleSelect(undefined)}
              className="text-xs text-gray-400 hover:text-white transition-colors"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => handleSelect(new Date())}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Today
            </button>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
