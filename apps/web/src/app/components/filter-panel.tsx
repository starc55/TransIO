import { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Filter } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React from "react";

interface FilterPanelProps {
  onFilter: (filters: any) => void;
}

export function FilterPanel({ onFilter }: FilterPanelProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    origin: "",
    destination: "",
    pickupDate: "",
    trailerType: "all",
    minRate: "",
    maxRate: "",
    maxDistance: "",
    maxWeight: "",
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
  };

  const applyFilters = () => {
    onFilter({
      ...filters,
      minRate: filters.minRate ? Number(filters.minRate) : undefined,
      maxRate: filters.maxRate ? Number(filters.maxRate) : undefined,
      maxDistance: filters.maxDistance
        ? Number(filters.maxDistance)
        : undefined,
      maxWeight: filters.maxWeight ? Number(filters.maxWeight) : undefined,
    });
  };

  const clearFilters = () => {
    const emptyFilters = {
      origin: "",
      destination: "",
      pickupDate: "",
      trailerType: "all",
      minRate: "",
      maxRate: "",
      maxDistance: "",
      maxWeight: "",
    };
    setFilters(emptyFilters);
    onFilter({});
  };

  const activeFilterCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "trailerType") {
      return value !== "all";
    }

    return String(value).trim() !== "";
  }).length;

  return (
    <div className="border-b border-border bg-card/85">
      <div className="px-3 py-2 sm:px-4 md:px-5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex h-8 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm text-foreground hover:bg-accent hover:text-foreground"
        >
          <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {showFilters ? "Hide Filters" : "Show Filters"}
          {activeFilterCount > 0 && (
            <span className="rounded-md bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 sm:px-4 md:px-5">
              <div className="rounded-lg border border-border bg-card p-3 shadow-sm">
                <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                  <p className="text-sm font-semibold text-foreground">
                    Filters
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Origin, destination, date, trailer, and rate
                  </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="origin" className="text-xs sm:text-sm text-foreground">
                      Origin
                    </Label>
                    <Input
                      id="origin"
                      placeholder="City or State"
                      value={filters.origin}
                      onChange={(e) => handleFilterChange("origin", e.target.value)}
                      className="h-9 rounded-md border-border bg-input-background text-sm text-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="destination"
                      className="text-xs sm:text-sm text-foreground"
                    >
                      Destination
                    </Label>
                    <Input
                      id="destination"
                      placeholder="City or State"
                      value={filters.destination}
                      onChange={(e) =>
                        handleFilterChange("destination", e.target.value)
                      }
                      className="h-9 rounded-md border-border bg-input-background text-sm text-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="pickupDate"
                      className="text-xs sm:text-sm text-foreground"
                    >
                      Pickup Date
                    </Label>
                    <Input
                      id="pickupDate"
                      type="date"
                      value={filters.pickupDate}
                      onChange={(e) =>
                        handleFilterChange("pickupDate", e.target.value)
                      }
                      className="h-9 rounded-md border-border bg-input-background text-sm text-foreground"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="trailerType"
                      className="text-xs sm:text-sm text-foreground"
                    >
                      Trailer Type
                    </Label>
                    <Select
                      value={filters.trailerType}
                      onValueChange={(value) =>
                        handleFilterChange("trailerType", value)
                      }
                    >
                      <SelectTrigger className="h-9 rounded-md border-border bg-input-background text-sm text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="border-border bg-popover">
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Dry Van">Dry Van</SelectItem>
                        <SelectItem value="Reefer">Reefer</SelectItem>
                        <SelectItem value="Flatbed">Flatbed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="minRate" className="text-xs sm:text-sm text-foreground">
                      Min Rate ($)
                    </Label>
                    <Input
                      id="minRate"
                      type="number"
                      placeholder="0"
                      value={filters.minRate}
                      onChange={(e) => handleFilterChange("minRate", e.target.value)}
                      className="h-9 rounded-md border-border bg-input-background text-sm text-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="maxRate" className="text-xs sm:text-sm text-foreground">
                      Max Rate ($)
                    </Label>
                    <Input
                      id="maxRate"
                      type="number"
                      placeholder="10000"
                      value={filters.maxRate}
                      onChange={(e) => handleFilterChange("maxRate", e.target.value)}
                      className="h-9 rounded-md border-border bg-input-background text-sm text-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="maxDistance"
                      className="text-xs sm:text-sm text-foreground"
                    >
                      Max Distance (mi)
                    </Label>
                    <Input
                      id="maxDistance"
                      type="number"
                      placeholder="1000"
                      value={filters.maxDistance}
                      onChange={(e) =>
                        handleFilterChange("maxDistance", e.target.value)
                      }
                      className="h-9 rounded-md border-border bg-input-background text-sm text-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="maxWeight"
                      className="text-xs sm:text-sm text-foreground"
                    >
                      Max Weight (lbs)
                    </Label>
                    <Input
                      id="maxWeight"
                      type="number"
                      placeholder="50000"
                      value={filters.maxWeight}
                      onChange={(e) =>
                        handleFilterChange("maxWeight", e.target.value)
                      }
                      className="h-9 rounded-md border-border bg-input-background text-sm text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                </div>

                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <Button
                    onClick={applyFilters}
                    className="h-9 rounded-md bg-primary text-sm text-primary-foreground hover:bg-primary/90"
                  >
                    Apply Filters
                  </Button>
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="h-9 rounded-md border-border text-sm text-foreground hover:bg-accent"
                  >
                    Clear All
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
