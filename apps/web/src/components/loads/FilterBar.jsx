import React, { useMemo } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "../../app/components/ui/button";
import { Input } from "../../app/components/ui/input";
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
import { LocationSuggestFilter } from "./LocationSuggestFilter";
import { SearchSuggestInput } from "./SearchSuggestInput";
import { cn } from "../../app/components/ui/utils";

const EQUIPMENT_OPTIONS = [
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
  count += filters.origin?.trim() ? 1 : 0;
  count += filters.destination?.trim() ? 1 : 0;
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

function tabSummary(tab) {
  const filters = tab.filters || {};

  if (filters.origin || filters.destination) {
    return [filters.origin || "Any", filters.destination || "Any"].join(" -> ");
  }

  if (filters.search?.trim()) {
    return filters.search.trim();
  }

  if (filters.equipment?.length) {
    return filters.equipment.join(", ");
  }

  return "All loads";
}

export function FilterBar({
  filters,
  filterTabs = [],
  activeFilterTabId,
  onSelectFilterTab,
  onAddFilterTab,
  onCloseFilterTab,
  onChange,
  onRemove,
  onClear,
  brokerOptions = [],
  locationOptions = [],
  isLoading = false,
  resultCount = 0,
}) {
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

  return (
    <div className="sticky top-0 z-30 border-b border-border bg-card/95 shadow-sm backdrop-blur-xl">
      <datalist id={brokerListId}>
        {uniqueBrokerOptions.map((broker) => (
          <option key={broker} value={broker} />
        ))}
      </datalist>

      <div className="flex flex-col gap-2 px-3 py-2 sm:px-4 md:px-5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {filterTabs.map((tab) => {
            const active = tab.id === activeFilterTabId;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectFilterTab(tab.id)}
                className={cn(
                  "group flex h-9 min-w-[154px] max-w-[250px] items-center gap-2 rounded-md border px-2.5 text-left text-xs transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-accent"
                )}
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">
                    {tab.label}
                  </span>
                  <span
                    className={cn(
                      "block truncate text-[10px]",
                      active
                        ? "text-primary-foreground/75"
                        : "text-muted-foreground"
                    )}
                  >
                    {tabSummary(tab)}
                  </span>
                </span>
                {filterTabs.length > 1 && (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                      event.stopPropagation();
                      onCloseFilterTab(tab.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        event.stopPropagation();
                        onCloseFilterTab(tab.id);
                      }
                    }}
                    className={cn(
                      "rounded-sm p-0.5",
                      active
                        ? "text-primary-foreground/80 hover:bg-primary-foreground/15"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                    aria-label={`Close ${tab.label}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </span>
                )}
              </button>
            );
          })}

          <Button
            type="button"
            variant="outline"
            onClick={onAddFilterTab}
            className="h-9 min-w-max rounded-md border-dashed border-border bg-background px-3 text-xs text-foreground hover:bg-accent"
            title="New filter tab"
          >
            <Plus className="h-3.5 w-3.5" />
            New filter
          </Button>
        </div>

        <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
          <SearchSuggestInput
            value={filters.search}
            onChange={(search) => onChange({ search })}
            locationOptions={locationOptions}
            brokerOptions={uniqueBrokerOptions}
            className="w-full xl:w-[360px] xl:shrink-0"
          />

          <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto pb-1">
            <LocationSuggestFilter
              label="Origin"
              query={filters.origin}
              states={filters.originState}
              stateOptions={STATE_OPTIONS}
              locationOptions={locationOptions}
              onQueryChange={(origin) => onChange({ origin })}
              onStatesChange={(originState) => onChange({ originState })}
              className="w-[220px] max-w-[72vw] border-border bg-background"
            />
            <LocationSuggestFilter
              label="Destination"
              query={filters.destination}
              states={filters.destinationState}
              stateOptions={STATE_OPTIONS}
              locationOptions={locationOptions}
              onQueryChange={(destination) => onChange({ destination })}
              onStatesChange={(destinationState) =>
                onChange({ destinationState })
              }
              className="w-[250px] max-w-[76vw] border-border bg-background"
            />
            <MultiSelectFilter
              label="Equipment"
              values={filters.equipment}
              options={EQUIPMENT_OPTIONS}
              onChange={(equipment) => onChange({ equipment })}
              className="w-[170px] max-w-[70vw]"
            />
            <RangeFilter
              label="Rate"
              minValue={filters.minRate}
              maxValue={filters.maxRate}
              minPlaceholder="1500"
              maxPlaceholder="5000"
              prefix="$"
              onChange={({ min, max }) =>
                onChange({ minRate: min, maxRate: max })
              }
              className="w-[150px] max-w-[66vw]"
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
              className="w-[170px] max-w-[70vw]"
            />
            <Select
              value={filters.status || "all"}
              onValueChange={(status) => onChange({ status })}
            >
              <SelectTrigger className="h-9 min-w-[138px] rounded-md border-border bg-background text-xs text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover">
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Input
              list={brokerListId}
              value={filters.broker}
              onChange={(event) => onChange({ broker: event.target.value })}
              placeholder="Broker"
              className="h-9 w-[180px] max-w-[70vw] shrink-0 rounded-md border-border bg-background text-xs text-foreground placeholder:text-muted-foreground"
            />
            <DateFilter
              preset={filters.pickupPreset}
              date={filters.pickupDate}
              onChange={onChange}
            />
          </div>

          <div className="flex shrink-0 items-center justify-between gap-2 xl:justify-end">
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
              Clear current
            </Button>
          </div>
        </div>
      </div>

      <FilterChips filters={filters} onRemove={onRemove} onClear={onClear} />
    </div>
  );
}
