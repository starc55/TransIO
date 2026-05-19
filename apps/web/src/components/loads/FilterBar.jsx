import React, { useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "../../app/components/ui/button";
import { Input } from "../../app/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../app/components/ui/popover";
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

const FILTER_DEFS = [
  { key: "origin", label: "Origin" },
  { key: "destination", label: "Destination" },
  { key: "equipment", label: "Equipment" },
  { key: "rate", label: "Rate" },
  { key: "distance", label: "Distance" },
  { key: "status", label: "Status" },
  { key: "broker", label: "Broker" },
  { key: "pickup", label: "Pickup" },
];

const DEFAULT_VISIBLE_FILTERS = ["origin", "destination", "equipment"];

function activeFilterCount(filters) {
  let count = 0;

  count += filters.search?.trim() ? 1 : 0;
  count += filters.origin?.trim() ? 1 : 0;
  count += filters.destination?.trim() ? 1 : 0;
  count += filters.equipment?.length || 0;
  count += filters.originState?.length || 0;
  count += filters.destinationState?.length || 0;
  count += (filters.minRate || filters.maxRate) ? 1 : 0;
  count += (filters.minDistance || filters.maxDistance) ? 1 : 0;
  count += filters.status && filters.status !== "all" ? 1 : 0;
  count += filters.broker?.trim() ? 1 : 0;
  count += filters.pickupPreset ? 1 : 0;

  return count;
}

function activeKeysFromValues(filters) {
  const keys = [];

  if (filters.origin?.trim() || filters.originState?.length) {
    keys.push("origin");
  }

  if (filters.destination?.trim() || filters.destinationState?.length) {
    keys.push("destination");
  }

  if (filters.equipment?.length) {
    keys.push("equipment");
  }

  if (filters.minRate || filters.maxRate) {
    keys.push("rate");
  }

  if (filters.minDistance || filters.maxDistance) {
    keys.push("distance");
  }

  if (filters.status && filters.status !== "all") {
    keys.push("status");
  }

  if (filters.broker?.trim()) {
    keys.push("broker");
  }

  if (filters.pickupPreset) {
    keys.push("pickup");
  }

  return keys;
}

function mergeKeys(current, next) {
  const allowed = new Set(FILTER_DEFS.map((filter) => filter.key));
  const merged = [...current, ...next].filter((key) => allowed.has(key));
  return Array.from(new Set(merged));
}

function FilterTab({ children, onClose, className }) {
  return (
    <div
      className={cn(
        "flex h-9 min-w-max items-center rounded-md border border-border bg-background shadow-sm",
        className
      )}
    >
      <div className="min-w-0">{children}</div>
      <button
        type="button"
        onClick={onClose}
        className="mr-1 rounded-sm p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        aria-label="Remove filter"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function FilterBar({
  filters,
  onChange,
  onRemove,
  onClear,
  brokerOptions = [],
  locationOptions = [],
  isLoading = false,
  resultCount = 0,
}) {
  const [visibleFilters, setVisibleFilters] = useState(() =>
    mergeKeys(DEFAULT_VISIBLE_FILTERS, activeKeysFromValues(filters))
  );
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
  const availableFilters = FILTER_DEFS.filter(
    (filter) => !visibleFilters.includes(filter.key)
  );

  useEffect(() => {
    setVisibleFilters((current) =>
      mergeKeys(current, activeKeysFromValues(filters))
    );
  }, [filters]);

  const addFilter = (key) => {
    setVisibleFilters((current) => mergeKeys(current, [key]));
  };

  const removeVisibleFilter = (key) => {
    setVisibleFilters((current) => current.filter((item) => item !== key));
    onRemove(key);
  };

  const clearAllFilters = () => {
    setVisibleFilters(DEFAULT_VISIBLE_FILTERS);
    onClear();
  };

  const renderFilterControl = (key) => {
    switch (key) {
      case "origin":
        return (
          <FilterTab key={key} onClose={() => removeVisibleFilter(key)}>
            <LocationSuggestFilter
              label="Origin"
              query={filters.origin}
              states={filters.originState}
              stateOptions={STATE_OPTIONS}
              locationOptions={locationOptions}
              onQueryChange={(origin) => onChange({ origin })}
              onStatesChange={(originState) => onChange({ originState })}
              className="w-[220px] max-w-[72vw]"
            />
          </FilterTab>
        );
      case "destination":
        return (
          <FilterTab key={key} onClose={() => removeVisibleFilter(key)}>
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
              className="w-[250px] max-w-[76vw]"
            />
          </FilterTab>
        );
      case "equipment":
        return (
          <FilterTab key={key} onClose={() => removeVisibleFilter(key)}>
            <MultiSelectFilter
              label="Equipment"
              values={filters.equipment}
              options={EQUIPMENT_OPTIONS}
              onChange={(equipment) => onChange({ equipment })}
              className="w-[170px] max-w-[70vw] border-0 bg-transparent"
            />
          </FilterTab>
        );
      case "rate":
        return (
          <FilterTab key={key} onClose={() => removeVisibleFilter(key)}>
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
              className="w-[150px] max-w-[66vw] border-0 bg-transparent"
            />
          </FilterTab>
        );
      case "distance":
        return (
          <FilterTab key={key} onClose={() => removeVisibleFilter(key)}>
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
              className="w-[170px] max-w-[70vw] border-0 bg-transparent"
            />
          </FilterTab>
        );
      case "status":
        return (
          <FilterTab key={key} onClose={() => removeVisibleFilter(key)}>
            <Select
              value={filters.status || "all"}
              onValueChange={(status) => onChange({ status })}
            >
              <SelectTrigger className="h-9 w-[138px] border-0 bg-transparent text-xs text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover">
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="booked">Booked</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </FilterTab>
        );
      case "broker":
        return (
          <FilterTab key={key} onClose={() => removeVisibleFilter(key)}>
            <Input
              list={brokerListId}
              value={filters.broker}
              onChange={(event) => onChange({ broker: event.target.value })}
              placeholder="Broker"
              className="h-9 w-[180px] max-w-[70vw] border-0 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
            />
          </FilterTab>
        );
      case "pickup":
        return (
          <FilterTab key={key} onClose={() => removeVisibleFilter(key)}>
            <DateFilter
              preset={filters.pickupPreset}
              date={filters.pickupDate}
              onChange={onChange}
            />
          </FilterTab>
        );
      default:
        return null;
    }
  };

  return (
    <div className="sticky top-0 z-30 border-b border-border bg-card/95 shadow-sm backdrop-blur-xl">
      <datalist id={brokerListId}>
        {uniqueBrokerOptions.map((broker) => (
          <option key={broker} value={broker} />
        ))}
      </datalist>

      <div className="flex flex-col gap-2 px-3 py-2 sm:px-4 md:px-5">
        <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
          <SearchSuggestInput
            value={filters.search}
            onChange={(search) => onChange({ search })}
            locationOptions={locationOptions}
            brokerOptions={uniqueBrokerOptions}
            className="w-full xl:w-[360px] xl:shrink-0"
          />

          <div className="flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto pb-1">
            {visibleFilters.map(renderFilterControl)}

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-9 min-w-max rounded-md border-dashed border-border bg-background px-3 text-xs text-foreground hover:bg-accent"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add filter
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-52 rounded-md border-border bg-popover p-1.5 shadow-xl"
              >
                {availableFilters.length === 0 ? (
                  <div className="px-2 py-3 text-center text-xs text-muted-foreground">
                    All filters added
                  </div>
                ) : (
                  availableFilters.map((filter) => (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() => addFilter(filter.key)}
                      className="flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-xs text-foreground hover:bg-accent"
                    >
                      {filter.label}
                      <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>
                  ))
                )}
              </PopoverContent>
            </Popover>
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
              onClick={clearAllFilters}
              disabled={count === 0}
              className="h-9 rounded-md px-2 text-xs text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40"
            >
              Clear all
            </Button>
          </div>
        </div>
      </div>

      <FilterChips
        filters={filters}
        onRemove={onRemove}
        onClear={clearAllFilters}
      />
    </div>
  );
}
