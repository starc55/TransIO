import { useMemo, useState } from "react";
import { FilterPanel } from "./filter-panel";
import { LoadCard } from "./load-card";
import { formatLoadLocation, type Load } from "../data/loads";
import { RefreshCw, Radio, SlidersHorizontal } from "lucide-react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useAppState } from "../context/app-state";
import { motion } from "motion/react";
import React from "react";
import { CardSkeleton } from "../../components/ui/CardSkeleton";
import { EmptyState } from "../../components/ui/EmptyState";

type SortOption = "rate-high" | "rate-low" | "distance" | "date";

interface LoadFilters {
  origin?: string;
  destination?: string;
  pickupDate?: string;
  trailerType?: string;
  minRate?: number;
  maxRate?: number;
  maxDistance?: number;
  maxWeight?: number;
}

function normalizeLocationQuery(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/los\s+anjeles/g, "los angeles")
    .replace(/anjeles/g, "angeles")
    .replace(/[^a-z0-9]+/g, "");
}

function matchesLocationQuery(location: Load["origin"], query: string) {
  const normalizedQuery = normalizeLocationQuery(query);

  if (!normalizedQuery) {
    return true;
  }

  return [formatLoadLocation(location), location.address]
    .map(normalizeLocationQuery)
    .filter(Boolean)
    .some(
      (value) =>
        value.includes(normalizedQuery) || normalizedQuery.includes(value)
    );
}

export function LoadBoard() {
  const [expandedLoadId, setExpandedLoadId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [activeFilters, setActiveFilters] = useState<LoadFilters>({});
  const { allLoads, searchQuery, refreshLoads, isLoadingLoads, loadsError } =
    useAppState();

  const sortLoads = (loads: Load[], sortOption: SortOption) => {
    const sorted = [...loads];

    switch (sortOption) {
      case "rate-high":
        return sorted.sort((a, b) => b.rate - a.rate);
      case "rate-low":
        return sorted.sort((a, b) => a.rate - b.rate);
      case "distance":
        return sorted.sort((a, b) => a.distance - b.distance);
      case "date":
        return sorted.sort(
          (a, b) =>
            new Date(a.pickupDate).getTime() - new Date(b.pickupDate).getTime()
        );
      default:
        return sorted;
    }
  };

  const handleFilter = (filters: LoadFilters) => {
    setActiveFilters(filters);
  };

  const locationOptions = useMemo(() => {
    const options = new Map<string, string>();

    allLoads.forEach((load) => {
      [load.origin, load.destination].forEach((location) => {
        const label = formatLoadLocation(location);

        if (label) {
          options.set(label.toLowerCase(), label);
        }
      });
    });

    return Array.from(options.values()).sort((a, b) => a.localeCompare(b));
  }, [allLoads]);

  const sortedLoads = useMemo(() => {
    let filtered = [...allLoads];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((load) =>
        [
          load.referenceId,
          formatLoadLocation(load.origin),
          formatLoadLocation(load.destination),
          load.broker,
          ...load.tags,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)
      );
    }

    if (activeFilters.origin) {
      filtered = filtered.filter(
        (load) => matchesLocationQuery(load.origin, activeFilters.origin!)
      );
    }

    if (activeFilters.destination) {
      filtered = filtered.filter(
        (load) =>
          matchesLocationQuery(load.destination, activeFilters.destination!)
      );
    }

    if (activeFilters.pickupDate) {
      filtered = filtered.filter(
        (load) => load.pickupDate === activeFilters.pickupDate
      );
    }

    if (activeFilters.trailerType && activeFilters.trailerType !== "all") {
      filtered = filtered.filter(
        (load) => load.trailerType === activeFilters.trailerType
      );
    }

    if (activeFilters.minRate) {
      filtered = filtered.filter((load) => load.rate >= activeFilters.minRate!);
    }

    if (activeFilters.maxRate) {
      filtered = filtered.filter((load) => load.rate <= activeFilters.maxRate!);
    }

    if (activeFilters.maxDistance) {
      filtered = filtered.filter(
        (load) => load.distance <= activeFilters.maxDistance!
      );
    }

    if (activeFilters.maxWeight) {
      filtered = filtered.filter(
        (load) => load.weight <= activeFilters.maxWeight!
      );
    }

    return sortLoads(filtered, sortBy);
  }, [activeFilters, allLoads, searchQuery, sortBy]);
  const hasActiveFilters = Object.values(activeFilters).some(Boolean);
  const isInitialLoading = isLoadingLoads && allLoads.length === 0;
  const emptyTitle =
    searchQuery.trim() || hasActiveFilters
      ? "No matching loads"
      : "No loads available";
  const emptyDescription =
    searchQuery.trim() || hasActiveFilters
      ? "No freight loads match the current search or filters. Adjust the lane, broker, equipment, or rate filters and try again."
      : "Loads will appear here once freight data is available.";

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="border-b border-border bg-card/95 px-3 py-2.5 backdrop-blur-xl sm:px-4 md:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <h1 className="text-lg font-semibold text-foreground sm:text-xl">
                Load Board
              </h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Live lanes, broker rates, and pickup windows
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="rounded-md border border-border bg-background px-2.5 py-1.5">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  <Radio className="h-3 w-3 text-emerald-600 dark:text-emerald-300" />
                  Live
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {sortedLoads.length} visible
                </p>
              </div>
              <div className="rounded-md border border-border bg-background px-2.5 py-1.5">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  <SlidersHorizontal className="h-3 w-3 text-primary" />
                  Search
                </div>
                <p className="max-w-40 truncate text-sm font-semibold text-foreground">
                  {searchQuery.trim() || "No query"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => refreshLoads()}
              className="h-9 rounded-md border-border bg-background text-foreground hover:border-foreground/30 hover:bg-accent"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {isLoadingLoads ? "Refreshing..." : "Refresh Loads"}
            </Button>
            <Select
              value={sortBy}
              onValueChange={(value: SortOption) => setSortBy(value)}
            >
              <SelectTrigger className="h-9 w-full rounded-md border-border bg-background text-foreground sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-border bg-popover">
                <SelectItem value="date">Pickup Date</SelectItem>
                <SelectItem value="rate-high">Rate: High to Low</SelectItem>
                <SelectItem value="rate-low">Rate: Low to High</SelectItem>
                <SelectItem value="distance">Distance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <FilterPanel onFilter={handleFilter} locationOptions={locationOptions} />

      <div className="flex-1 overflow-auto bg-background p-2 sm:p-2.5 md:p-3">
        <motion.div layout className="mx-auto max-w-7xl space-y-1.5">
          {loadsError && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-center">
              <p className="text-sm text-destructive">{loadsError}</p>
            </div>
          )}

          {isInitialLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <CardSkeleton key={index} rows={2} />
              ))}
            </div>
          ) : sortedLoads.length === 0 ? (
            <EmptyState
              title={emptyTitle}
              description={emptyDescription}
              actionLabel="Refresh loads"
              onAction={() => refreshLoads()}
              icon={Radio}
            />
          ) : (
            <>
              <div className="hidden rounded-md border border-border bg-muted px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground lg:grid lg:grid-cols-[126px_minmax(190px,1fr)_108px_88px_104px]">
                <span>Reference</span>
                <span>Lane / Broker</span>
                <span>Pickup</span>
                <span className="text-right">Rate</span>
                <span className="text-right">Action</span>
              </div>
              {sortedLoads.map((load) => (
                <LoadCard
                  key={load.id}
                  load={load}
                  isExpanded={expandedLoadId === load.id}
                  onToggle={() =>
                    setExpandedLoadId(
                      expandedLoadId === load.id ? null : load.id
                    )
                  }
                />
              ))}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
