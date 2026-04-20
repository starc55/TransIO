import { useMemo, useRef, useState } from "react";
import { FilterPanel } from "./filter-panel";
import { LoadCard } from "./load-card";
import { type Load } from "../data/loads";
import { Upload } from "lucide-react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useAppState } from "../context/app-state";
import { parseDatFile } from "../utils/load-import";
import { toast } from "sonner";
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { allLoads, searchQuery, importLoads } = useAppState();

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
          load.id,
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

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const content = await file.text();
      const parsedLoads = parseDatFile(content);
      const importedCount = importLoads(parsedLoads);

      if (importedCount > 0) {
        toast.success(`${importedCount} ta load import qilindi`);
      } else {
        toast.message("Yangi load topilmadi yoki ular allaqachon mavjud");
      }
    } catch {
      toast.error("DAT faylni o'qib bo'lmadi");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b border-border bg-card px-3 sm:px-4 md:px-6 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="mb-1 text-xl sm:text-2xl text-foreground">
              Load Board
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {sortedLoads.length} available loads
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              ref={fileInputRef}
              type="file"
              accept=".dat,.DAT,.json"
              className="hidden"
              onChange={handleImportFile}
            />
            <Button
              variant="outline"
              onClick={handleImportClick}
              className="border-border text-foreground hover:bg-primary/10 hover:border-primary/50 cursor-pointer"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import DAT
            </Button>
            <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
              Sort by:
            </span>
            <Select
              value={sortBy}
              onValueChange={(value: SortOption) => setSortBy(value)}
            >
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

      <FilterPanel onFilter={handleFilter} />

      <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-6 bg-background">
        <motion.div layout className="max-w-5xl mx-auto space-y-3 sm:space-y-4">
          {sortedLoads.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-lg">
              <p className="text-muted-foreground">
                No loads match your filters
              </p>
            </div>
          ) : (
            sortedLoads.map((load) => (
              <LoadCard
                key={load.id}
                load={load}
                isExpanded={expandedLoadId === load.id}
                onToggle={() =>
                  setExpandedLoadId(expandedLoadId === load.id ? null : load.id)
                }
              />
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}
