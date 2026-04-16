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
import { Filter, X } from "lucide-react";

interface FilterPanelProps {
  onFilter: (filters: any) => void;
}

export function FilterPanel({ onFilter }: FilterPanelProps) {
  const [showFilters, setShowFilters] = useState(true);
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
      maxDistance: filters.maxDistance ? Number(filters.maxDistance) : undefined,
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

  return (
    <div className="border-b border-border bg-card">
      <div className="px-3 sm:px-4 md:px-6 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-foreground hover:bg-accent hover:text-accent-foreground h-8 sm:h-9 text-sm sm:text-base"
        >
          <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </Button>
      </div>

      {showFilters && (
        <div className="px-3 sm:px-4 md:px-6 pb-4 sm:pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Origin */}
            <div className="space-y-2">
              <Label htmlFor="origin" className="text-xs sm:text-sm text-foreground">Origin</Label>
              <Input
                id="origin"
                placeholder="City or State"
                value={filters.origin}
                onChange={(e) => handleFilterChange("origin", e.target.value)}
                className="bg-input-background border-border text-foreground placeholder:text-muted-foreground h-9 sm:h-10 text-sm sm:text-base"
              />
            </div>

            {/* Destination */}
            <div className="space-y-2">
              <Label htmlFor="destination" className="text-xs sm:text-sm text-foreground">Destination</Label>
              <Input
                id="destination"
                placeholder="City or State"
                value={filters.destination}
                onChange={(e) => handleFilterChange("destination", e.target.value)}
                className="bg-input-background border-border text-foreground placeholder:text-muted-foreground h-9 sm:h-10 text-sm sm:text-base"
              />
            </div>

            {/* Pickup Date */}
            <div className="space-y-2">
              <Label htmlFor="pickupDate" className="text-xs sm:text-sm text-foreground">Pickup Date</Label>
              <Input
                id="pickupDate"
                type="date"
                value={filters.pickupDate}
                onChange={(e) => handleFilterChange("pickupDate", e.target.value)}
                className="bg-input-background border-border text-foreground h-9 sm:h-10 text-sm sm:text-base"
              />
            </div>

            {/* Trailer Type */}
            <div className="space-y-2">
              <Label htmlFor="trailerType" className="text-xs sm:text-sm text-foreground">Trailer Type</Label>
              <Select value={filters.trailerType} onValueChange={(value) => handleFilterChange("trailerType", value)}>
                <SelectTrigger className="bg-input-background border-border text-foreground h-9 sm:h-10 text-sm sm:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Dry Van">Dry Van</SelectItem>
                  <SelectItem value="Reefer">Reefer</SelectItem>
                  <SelectItem value="Flatbed">Flatbed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Min Rate */}
            <div className="space-y-2">
              <Label htmlFor="minRate" className="text-xs sm:text-sm text-foreground">Min Rate ($)</Label>
              <Input
                id="minRate"
                type="number"
                placeholder="0"
                value={filters.minRate}
                onChange={(e) => handleFilterChange("minRate", e.target.value)}
                className="bg-input-background border-border text-foreground placeholder:text-muted-foreground h-9 sm:h-10 text-sm sm:text-base"
              />
            </div>

            {/* Max Rate */}
            <div className="space-y-2">
              <Label htmlFor="maxRate" className="text-xs sm:text-sm text-foreground">Max Rate ($)</Label>
              <Input
                id="maxRate"
                type="number"
                placeholder="10000"
                value={filters.maxRate}
                onChange={(e) => handleFilterChange("maxRate", e.target.value)}
                className="bg-input-background border-border text-foreground placeholder:text-muted-foreground h-9 sm:h-10 text-sm sm:text-base"
              />
            </div>

            {/* Max Distance */}
            <div className="space-y-2">
              <Label htmlFor="maxDistance" className="text-xs sm:text-sm text-foreground">Max Distance (mi)</Label>
              <Input
                id="maxDistance"
                type="number"
                placeholder="1000"
                value={filters.maxDistance}
                onChange={(e) => handleFilterChange("maxDistance", e.target.value)}
                className="bg-input-background border-border text-foreground placeholder:text-muted-foreground h-9 sm:h-10 text-sm sm:text-base"
              />
            </div>

            {/* Max Weight */}
            <div className="space-y-2">
              <Label htmlFor="maxWeight" className="text-xs sm:text-sm text-foreground">Max Weight (lbs)</Label>
              <Input
                id="maxWeight"
                type="number"
                placeholder="50000"
                value={filters.maxWeight}
                onChange={(e) => handleFilterChange("maxWeight", e.target.value)}
                className="bg-input-background border-border text-foreground placeholder:text-muted-foreground h-9 sm:h-10 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4">
            <Button onClick={applyFilters} className="bg-primary hover:bg-primary/90 text-primary-foreground h-9 sm:h-10 text-sm sm:text-base">
              Apply Filters
            </Button>
            <Button onClick={clearFilters} variant="outline" className="border-border text-foreground hover:bg-accent h-9 sm:h-10 text-sm sm:text-base">
              Clear All
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}