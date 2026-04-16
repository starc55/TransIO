import { useState } from "react";
import { FilterPanel } from "./filter-panel";
import { LoadCard } from "./load-card";
import { mockLoads, type Load } from "../data/loads";
import { ArrowUpDown } from "lucide-react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

type SortOption = "rate-high" | "rate-low" | "distance" | "date";

export function LoadBoard() {
  const [expandedLoadId, setExpandedLoadId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("date");
  const [filteredLoads, setFilteredLoads] = useState<Load[]>(mockLoads);

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
        return sorted.sort((a, b) => 
          new Date(a.pickupDate).getTime() - new Date(b.pickupDate).getTime()
        );
      default:
        return sorted;
    }
  };

  const handleFilter = (filters: any) => {
    let filtered = [...mockLoads];

    if (filters.origin) {
      filtered = filtered.filter(load => 
        load.origin.city.toLowerCase().includes(filters.origin.toLowerCase()) ||
        load.origin.state.toLowerCase().includes(filters.origin.toLowerCase())
      );
    }

    if (filters.destination) {
      filtered = filtered.filter(load => 
        load.destination.city.toLowerCase().includes(filters.destination.toLowerCase()) ||
        load.destination.state.toLowerCase().includes(filters.destination.toLowerCase())
      );
    }

    if (filters.trailerType && filters.trailerType !== "all") {
      filtered = filtered.filter(load => load.trailerType === filters.trailerType);
    }

    if (filters.minRate) {
      filtered = filtered.filter(load => load.rate >= filters.minRate);
    }

    if (filters.maxRate) {
      filtered = filtered.filter(load => load.rate <= filters.maxRate);
    }

    if (filters.maxDistance) {
      filtered = filtered.filter(load => load.distance <= filters.maxDistance);
    }

    if (filters.maxWeight) {
      filtered = filtered.filter(load => load.weight <= filters.maxWeight);
    }

    setFilteredLoads(sortLoads(filtered, sortBy));
  };

  const sortedLoads = sortLoads(filteredLoads, sortBy);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="mb-1 text-xl sm:text-2xl text-foreground">Load Board</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {sortedLoads.length} available loads
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">Sort by:</span>
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-40 h-9 sm:h-10 bg-card border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="date">Pickup Date</SelectItem>
                <SelectItem value="rate-high">Rate: High to Low</SelectItem>
                <SelectItem value="rate-low">Rate: Low to High</SelectItem>
                <SelectItem value="distance">Distance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <FilterPanel onFilter={handleFilter} />

      {/* Load List */}
      <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 bg-background">
        <div className="max-w-5xl mx-auto space-y-3 sm:space-y-4">
          {sortedLoads.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <p className="text-muted-foreground">No loads match your filters</p>
            </div>
          ) : (
            sortedLoads.map((load) => (
              <LoadCard
                key={load.id}
                load={load}
                isExpanded={expandedLoadId === load.id}
                onToggle={() => setExpandedLoadId(expandedLoadId === load.id ? null : load.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}