"use client";

import * as React from "react";
import { format, parseISO, isValid } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  checkIn?: string;
  checkOut?: string;
  onSelectRange: (checkIn: string, checkOut: string) => void;
  className?: string;
  placeholder?: string;
}

export function DateRangePicker({
  checkIn,
  checkOut,
  onSelectRange,
  className,
  placeholder = "Select Check-in & Check-out",
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const initialRange = React.useMemo<DateRange | undefined>(() => {
    let from: Date | undefined = undefined;
    let to: Date | undefined = undefined;

    if (checkIn) {
      const parsedFrom = parseISO(checkIn);
      if (isValid(parsedFrom)) from = parsedFrom;
    }
    if (checkOut) {
      const parsedTo = parseISO(checkOut);
      if (isValid(parsedTo)) to = parsedTo;
    }

    if (from || to) {
      return { from, to };
    }
    return undefined;
  }, [checkIn, checkOut]);

  const [tempDate, setTempDate] = React.useState<DateRange | undefined>(initialRange);

  // Sync temp state when popover opens or initialRange changes
  React.useEffect(() => {
    setTempDate(initialRange);
  }, [initialRange, isOpen]);

  const handleDaySelect = (selectedRange: DateRange | undefined) => {
    setTempDate(selectedRange);
  };

  const handleConfirm = () => {
    if (tempDate?.from) {
      const fromStr = format(tempDate.from, "yyyy-MM-dd");
      const toStr = tempDate.to ? format(tempDate.to, "yyyy-MM-dd") : "";
      onSelectRange(fromStr, toStr);
    } else {
      onSelectRange("", "");
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setTempDate(undefined);
    onSelectRange("", "");
  };

  const headerText = React.useMemo(() => {
    if (!tempDate?.from) {
      return "Select check-in date";
    }
    if (!tempDate.to || tempDate.from.getTime() === tempDate.to.getTime()) {
      return `Check-in: ${format(tempDate.from, "MMM dd, yyyy")} — Select check-out date`;
    }
    return `Selected: ${format(tempDate.from, "MMM dd, yyyy")} - ${format(tempDate.to, "MMM dd, yyyy")}`;
  }, [tempDate]);

  const buttonDisplayText = React.useMemo(() => {
    if (checkIn) {
      const parsedFrom = parseISO(checkIn);
      if (isValid(parsedFrom)) {
        if (checkOut) {
          const parsedTo = parseISO(checkOut);
          if (isValid(parsedTo)) {
            return `${format(parsedFrom, "MMM dd, yyyy")} - ${format(parsedTo, "MMM dd, yyyy")}`;
          }
        }
        return `${format(parsedFrom, "MMM dd, yyyy")}`;
      }
    }
    return placeholder;
  }, [checkIn, checkOut, placeholder]);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-medium h-12 bg-muted border-0 hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-[#1b5cac] cursor-pointer text-slate-800 rounded-md",
              (!checkIn && !checkOut) && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2.5 h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate">{buttonDisplayText}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-50 shadow-2xl border border-slate-200 rounded-2xl bg-white" align="start">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 rounded-t-2xl">
            <span className="text-sm font-bold text-slate-800 tracking-tight">
              {headerText}
            </span>
            {tempDate?.from && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs text-[#1b5cac] hover:underline cursor-pointer font-semibold"
              >
                Clear
              </button>
            )}
          </div>

          {/* Calendar */}
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={tempDate?.from || new Date()}
            selected={tempDate}
            onSelect={handleDaySelect}
            numberOfMonths={2}
            disabled={{ before: new Date() }}
            className="p-3"
          />

          {/* Footer with Okay button */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-2 rounded-b-2xl">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="px-4 h-9 border-slate-300 text-slate-700 font-semibold rounded-md"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirm}
              className="px-6 h-9 bg-[#1b5cac] hover:bg-[#154988] text-white font-bold rounded-md shadow-sm cursor-pointer"
            >
              Okay
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
