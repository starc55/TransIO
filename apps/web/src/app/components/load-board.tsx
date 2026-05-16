import { useMemo, useState } from "react";
import { FilterPanel } from "./filter-panel";
import { LoadCard } from "./load-card";
import { type Load } from "../data/loads";
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

  const sortedLoads = useMemo(() => {
    let filtered = [...allLoads];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((load) =>
        [
          load.referenceId,
          load.origin.city,
          load.origin.state,
          load.destination.city,
          load.destination.state,
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
        (load) =>
          load.origin.city
            .toLowerCase()
            .includes(activeFilters.origin!.toLowerCase()) ||
          load.origin.state
            .toLowerCase()
            .includes(activeFilters.origin!.toLowerCase())
      );
    }

    if (activeFilters.destination) {
      filtered = filtered.filter(
        (load) =>
          load.destination.city
            .toLowerCase()
            .includes(activeFilters.destination!.toLowerCase()) ||
          load.destination.state
            .toLowerCase()
            .includes(activeFilters.destination!.toLowerCase())
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
                Live DAT lanes, broker rates, and pickup windows
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

      <FilterPanel onFilter={handleFilter} />

      <div className="flex-1 overflow-auto bg-background p-2.5 sm:p-3 md:p-4">
        <motion.div layout className="mx-auto max-w-7xl space-y-2">
          {loadsError && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-center">
              <p className="text-sm text-destructive">{loadsError}</p>
            </div>
          )}

          {sortedLoads.length === 0 ? (
            <div className="rounded-lg border border-border bg-card px-6 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                {isLoadingLoads
                  ? "Collector loads are loading..."
                  : "No DAT loads match your filters"}
              </p>
            </div>
          ) : (
            <>
              <div className="hidden rounded-md border border-border bg-muted px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground lg:grid lg:grid-cols-[150px_minmax(220px,1fr)_142px_110px_132px]">
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
