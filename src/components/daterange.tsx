'use client';

import * as React from 'react';
import { addDays, format, parse } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import InputField from '@/components/ui/InputField';

export function DatePickerWithRange({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2022, 0, 20),
    to: addDays(new Date(2022, 0, 20), 20),
  });
  const [manualFrom, setManualFrom] = React.useState<string>('');
  const [manualTo, setManualTo] = React.useState<string>('');

  const handleManualDateChange = (type: 'from' | 'to', value: string) => {
    if (type === 'from') {
      setManualFrom(value);
      if (value) {
        const parsedDate = parse(value, 'yyyy-MM-dd', new Date());
        setDate(prev => ({ from: parsedDate, to: prev?.to || parsedDate }));
      }
    } else {
      setManualTo(value);
      if (value) {
        const parsedDate = parse(value, 'yyyy-MM-dd', new Date());
        setDate(prev => ({ from: prev?.from || parsedDate, to: parsedDate }));
      }
    }
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={'outline'}
            className={cn('w-[300px] bg-white justify-start text-left font-normal', !date && 'text-muted-foreground')}
          >
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                </>
              ) : (
                format(date.from, 'LLL dd, y')
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="start">
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">From</label>
                <InputField
                  type="date"
                  label="From"
                  value={manualFrom}
                  onChange={(e) => handleManualDateChange('from', e.target.value)}
                  className="w-[150px]"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium">To</label>
                <InputField
                  type="date"
                  label="To"
                  value={manualTo}
                  onChange={(e) => handleManualDateChange('to', e.target.value)}
                  className="w-[150px]"
                />
              </div>
            </div>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
