import React, { useMemo, useState } from "react";
import { Filter, Search, X } from "lucide-react";
import { Button } from "../../app/components/ui/button";
import { Input } from "../../app/components/ui/input";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../app/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../app/components/ui/select";
import { MultiSelectFilter } from "./MultiSelectFilter";
import { RangeFilter } from "./RangeFilter";
import { FilterChips } from "./FilterChips";
import { DateFilter } from "./DateFilter";

export const EQUIPMENT_OPTIONS = [
  "Dry Van",
  "Reefer",
  "Flatbed",
  "Power Only",
  "Box Truck",
  "Other",
];

const STATE_OPTIONS = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
];

function activeFilterCount(filters) {
  let count = 0;

  count += filters.search?.trim() ? 1 : 0;
  count += filters.equipment?.length || 0;
  count += filters.originState?.length || 0;
  count += filters.destinationState?.length || 0;
  count += filters.minRate || filters.maxRate ? 1 : 0;
  count += filters.minDistance || filters.maxDistance ? 1 : 0;
  count += filters.status && filters.status !== "all" ? 1 : 0;
  count += filters.broker?.trim() ? 1 : 0;
  count += filters.pickupPreset ? 1 : 0;

  return count;
}

export function FilterBar({
  filters,
  onChange,
  onRemove,
  onClear,
  brokerOptions = [],
  isLoading = false,
  resultCount = 0,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const count = activeFilterCount(filters);
  const brokerListId = "load-broker-filter-options";
  const uniqueBrokerOptions = useMemo(
    () =>
      Array.from(
        new Set(brokerOptions.map((item) => item.trim()).filter(Boolean))
      )
        .sort((a, b) => a.localeCompare(b))
        .slice(0, 80),
    [brokerOptions]
  );

  const renderControls = () => (
    <>
      <MultiSelectFilter
        label="Equipment"
        values={filters.equipment}
        options={EQUIPMENT_OPTIONS}
        onChange={(equipment) => onChange({ equipment })}
        className="w-full md:w-[150px]"
      />
      <MultiSelectFilter
        label="Origin"
        values={filters.originState}
        options={STATE_OPTIONS}
        onChange={(originState) => onChange({ originState })}
        placeholder="States"
        searchable
        className="w-full md:w-[132px]"
      />
      <MultiSelectFilter
        label="Destination"
        values={filters.destinationState}
        options={STATE_OPTIONS}
        onChange={(destinationState) => onChange({ destinationState })}
        placeholder="States"
        searchable
        className="w-full md:w-[154px]"
      />
      <RangeFilter
        label="Rate"
        minValue={filters.minRate}
        maxValue={filters.maxRate}
        minPlaceholder="1500"
        maxPlaceholder="5000"
        prefix="$"
        onChange={({ min, max }) => onChange({ minRate: min, maxRate: max })}
        className="w-full md:w-[132px]"
      />
      <RangeFilter
        label="Distance"
        minValue={filters.minDistance}
        maxValue={filters.maxDistance}
        minPlaceholder="100"
        maxPlaceholder="1200"
        suffix=" mi"
        onChange={({ min, max }) =>
          onChange({ minDistance: min, maxDistance: max })
        }
        className="w-full md:w-[154px]"
      />
      <Select
        value={filters.status || "all"}
        onValueChange={(status) => onChange({ status })}
      >
        <SelectTrigger className="h-9 w-full rounded-md border-border bg-background text-xs text-foreground md:w-[126px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border-border bg-popover">
          <SelectItem value="all">All status</SelectItem>
          <SelectItem value="available">Available</SelectItem>
          <SelectItem value="booked">Booked</SelectItem>
          <SelectItem value="expired">Expired</SelectItem>
        </SelectContent>
      </Select>
      <div className="relative w-full md:w-[170px]">
        <Input
          list={brokerListId}
          value={filters.broker}
          onChange={(event) => onChange({ broker: event.target.value })}
          placeholder="Broker"
          className="h-9 rounded-md border-border bg-background text-xs text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <DateFilter
        preset={filters.pickupPreset}
        date={filters.pickupDate}
        onChange={onChange}
      />
    </>
  );

  return (
    <div className="sticky top-0 z-30 border-b border-border bg-card/95 shadow-sm backdrop-blur-xl">
      <datalist id={brokerListId}>
        {uniqueBrokerOptions.map((broker) => (
          <option key={broker} value={broker} />
        ))}
      </datalist>

      <div className="px-3 py-2 sm:px-4 md:px-5">
        <div className="hidden items-center gap-2 md:flex">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="load-board-filter-search"
              value={filters.search}
              onChange={(event) => onChange({ search: event.target.value })}
              placeholder="Origin, destination, broker, phone, equipment"
              className="h-9 rounded-md border-border bg-background pl-8 text-xs text-foreground placeholder:text-muted-foreground"
            />
          </div>
          {renderControls()}
          <div className="flex shrink-0 items-center gap-2">
            <div className="rounded-md border border-border bg-background px-2.5 py-1 text-right">
              <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                Results
              </p>
              <p className="text-xs font-semibold text-foreground">
                {isLoading ? "Updating" : resultCount.toLocaleString()}
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClear}
              disabled={count === 0}
              className="h-9 rounded-md px-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40"
            >
              Clear
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.search}
              onChange={(event) => onChange({ search: event.target.value })}
              placeholder="Search loads"
              className="h-9 rounded-md border-border bg-background pl-8 text-xs text-foreground"
            />
          </div>
          <Drawer
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            direction="bottom"
          >
            <DrawerTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-md border-border bg-background px-3 text-xs text-foreground"
              >
                <Filter className="h-3.5 w-3.5" />
                Filters
                {count > 0 && (
                  <span className="rounded-sm bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                    {count}
                  </span>
                )}
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[88vh] overflow-hidden rounded-t-lg border-border bg-card">
              <DrawerHeader className="border-b border-border p-3 text-left">
                <div className="flex items-center justify-between gap-2">
                  <DrawerTitle className="text-sm">Load filters</DrawerTitle>
                  <DrawerClose asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-md"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </DrawerClose>
                </div>
              </DrawerHeader>
              <div className="grid max-h-[62vh] grid-cols-1 gap-2 overflow-auto px-3 py-3">
                {renderControls()}
              </div>
              <DrawerFooter className="border-t border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    {isLoading
                      ? "Updating"
                      : `${resultCount.toLocaleString()} results`}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClear}
                      disabled={count === 0}
                      className="h-8 rounded-md border-border px-3 text-xs"
                    >
                      Clear
                    </Button>
                    <DrawerClose asChild>
                      <Button
                        type="button"
                        className="h-8 rounded-md px-3 text-xs"
                      >
                        Done
                      </Button>
                    </DrawerClose>
                  </div>
                </div>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      <FilterChips filters={filters} onRemove={onRemove} onClear={onClear} />
    </div>
  );
}
