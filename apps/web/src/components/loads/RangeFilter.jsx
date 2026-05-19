import React from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "../../app/components/ui/button";
import { Input } from "../../app/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../app/components/ui/popover";
import { cn } from "../../app/components/ui/utils";

function formatRangeValue(value, prefix, suffix) {
  if (value === "" || value === undefined || value === null) {
    return "";
  }

  return `${prefix}${Number(value).toLocaleString()}${suffix}`;
}

export function RangeFilter({
  label,
  minValue = "",
  maxValue = "",
  onChange,
  minPlaceholder = "Min",
  maxPlaceholder = "Max",
  prefix = "",
  suffix = "",
  className,
}) {
  const hasValue = minValue !== "" || maxValue !== "";
  const summary = hasValue
    ? `${formatRangeValue(minValue, prefix, suffix) || "Any"} - ${
        formatRangeValue(maxValue, prefix, suffix) || "Any"
      }`
    : "Any";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-9 min-w-0 justify-between rounded-md border-border bg-background px-2.5 text-xs text-foreground hover:bg-accent",
            className
          )}
        >
          <span className="min-w-0 truncate text-left">
            <span className="mr-1 text-muted-foreground">{label}</span>
            {summary}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-64 rounded-md border-border bg-popover p-3 shadow-xl"
      >
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Min
            </label>
            <Input
              type="number"
              min="0"
              value={minValue}
              placeholder={minPlaceholder}
              onChange={(event) =>
                onChange({ min: event.target.value, max: maxValue })
              }
              className="h-8 rounded-md border-border bg-background text-xs"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Max
            </label>
            <Input
              type="number"
              min="0"
              value={maxValue}
              placeholder={maxPlaceholder}
              onChange={(event) =>
                onChange({ min: minValue, max: event.target.value })
              }
              className="h-8 rounded-md border-border bg-background text-xs"
            />
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange({ min: "", max: "" })}
          className="mt-2 h-8 w-full rounded-md text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          Clear range
        </Button>
      </PopoverContent>
    </Popover>
  );
}
