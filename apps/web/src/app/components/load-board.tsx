import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { CardSkeleton } from "../../components/ui/CardSkeleton";
import { EmptyState } from "../../components/ui/EmptyState";
import { FilterBar } from "../../components/loads/FilterBar.jsx";
import {
  fetchLoadsPage,
  type LoadQueryFilters,
  type LoadSortOption,
} from "../lib/api";
import { useSearchParams } from "react-router";

const PAGE_SIZE = 25;
const EQUIPMENT_VALUES = [
  "Dry Van",
  "Reefer",
  "Flatbed",
  "Power Only",
  "Box Truck",
  "Other",
];

type StatusFilter = "all" | "available" | "booked" | "expired";
type PickupPreset = "" | "today" | "tomorrow" | "this-week" | "custom";

interface LoadBoardFilters {
  search: string;
  origin: string;
  destination: string;
  equipment: string[];
  originState: string[];
  destinationState: string[];
  minRate: string;
  maxRate: string;
  minDistance: string;
  maxDistance: string;
  status: StatusFilter;
  broker: string;
  pickupPreset: PickupPreset;
  pickupDate: string;
}

const DEFAULT_FILTERS: LoadBoardFilters = {
  search: "",
  origin: "",
  destination: "",
  equipment: [],
  originState: [],
  destinationState: [],
  minRate: "",
  maxRate: "",
  minDistance: "",
  maxDistance: "",
  status: "all",
  broker: "",
  pickupPreset: "",
  pickupDate: "",
};

function splitParam(value: string | null) {
  return (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseStateParam(value: string | null) {
  return splitParam(value)
    .map((item) => item.toUpperCase())
    .filter((item) => /^[A-Z]{2}$/.test(item));
}

function parseEquipmentParam(value: string | null) {
  const allowed = new Set(EQUIPMENT_VALUES);
  return splitParam(value).filter((item) => allowed.has(item));
}

function parseStatus(value: string | null): StatusFilter {
  if (value === "available" || value === "booked" || value === "expired") {
    return value;
  }

  return "all";
}

function parsePickupPreset(value: string | null): PickupPreset {
  if (
    value === "today" ||
    value === "tomorrow" ||
    value === "this-week" ||
    value === "custom"
  ) {
    return value;
  }

  return "";
}

function parseLoadFilters(
  params: URLSearchParams,
  fallbackSearch: string
): LoadBoardFilters {
  return {
    search: params.get("q") || fallbackSearch || "",
    origin: params.get("origin") || "",
    destination: params.get("destination") || "",
    equipment: parseEquipmentParam(params.get("equipment")),
    originState: parseStateParam(params.get("originState")),
    destinationState: parseStateParam(params.get("destinationState")),
    minRate: params.get("minRate") || "",
    maxRate: params.get("maxRate") || "",
    minDistance: params.get("minDistance") || "",
    maxDistance: params.get("maxDistance") || "",
    status: parseStatus(params.get("status")),
    broker: params.get("broker") || "",
    pickupPreset: parsePickupPreset(params.get("pickup")),
    pickupDate: params.get("pickupDate") || "",
  };
}

function cleanNumericInput(value: unknown) {
  const text = String(value ?? "").trim();

  if (!text) {
    return "";
  }

  const number = Number(text);
  return Number.isFinite(number) && number >= 0 ? text : "";
}

function sanitizeFilters(filters: LoadBoardFilters): LoadBoardFilters {
  return {
    ...DEFAULT_FILTERS,
    ...filters,
    origin: String(filters.origin || "").slice(0, 90),
    destination: String(filters.destination || "").slice(0, 90),
    equipment: Array.from(new Set(filters.equipment || [])).filter((item) =>
      EQUIPMENT_VALUES.includes(item)
    ),
    originState: Array.from(new Set(filters.originState || [])).filter((item) =>
      /^[A-Z]{2}$/.test(item)
    ),
    destinationState: Array.from(
      new Set(filters.destinationState || [])
    ).filter((item) => /^[A-Z]{2}$/.test(item)),
    minRate: cleanNumericInput(filters.minRate),
    maxRate: cleanNumericInput(filters.maxRate),
    minDistance: cleanNumericInput(filters.minDistance),
    maxDistance: cleanNumericInput(filters.maxDistance),
    status: parseStatus(filters.status),
    pickupPreset: parsePickupPreset(filters.pickupPreset),
  };
}

function buildSearchParams(filters: LoadBoardFilters) {
  const params = new URLSearchParams();

  if (filters.search.trim()) {
    params.set("q", filters.search.trim());
  }

  if (filters.origin.trim()) {
    params.set("origin", filters.origin.trim());
  }

  if (filters.destination.trim()) {
    params.set("destination", filters.destination.trim());
  }

  if (filters.equipment.length > 0) {
    params.set("equipment", filters.equipment.join(","));
  }

  if (filters.originState.length > 0) {
    params.set("originState", filters.originState.join(","));
  }

  if (filters.destinationState.length > 0) {
    params.set("destinationState", filters.destinationState.join(","));
  }

  if (filters.minRate) {
    params.set("minRate", filters.minRate);
  }

  if (filters.maxRate) {
    params.set("maxRate", filters.maxRate);
  }

  if (filters.minDistance) {
    params.set("minDistance", filters.minDistance);
  }

  if (filters.maxDistance) {
    params.set("maxDistance", filters.maxDistance);
  }

  if (filters.status !== "all") {
    params.set("status", filters.status);
  }

  if (filters.broker.trim()) {
    params.set("broker", filters.broker.trim());
  }

  if (filters.pickupPreset) {
    params.set("pickup", filters.pickupPreset);
  }

  if (filters.pickupPreset === "custom" && filters.pickupDate) {
    params.set("pickupDate", filters.pickupDate);
  }

  return params;
}

function toLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function pickupRange(filters: LoadBoardFilters) {
  const today = new Date();

  if (filters.pickupPreset === "today") {
    const date = toLocalDate(today);
    return { from: date, to: date };
  }

  if (filters.pickupPreset === "tomorrow") {
    const date = toLocalDate(addDays(today, 1));
    return { from: date, to: date };
  }

  if (filters.pickupPreset === "this-week") {
    const daysUntilSunday = (7 - today.getDay()) % 7;
    return {
      from: toLocalDate(today),
      to: toLocalDate(addDays(today, daysUntilSunday)),
    };
  }

  if (filters.pickupPreset === "custom" && filters.pickupDate) {
    return { from: filters.pickupDate, to: filters.pickupDate };
  }

  return { from: undefined, to: undefined };
}

function numberFilter(value: string) {
  if (!value) {
    return undefined;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function useDebouncedValue<T>(value: T, delay: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timeoutId);
  }, [delay, value]);

  return debounced;
}

function hasActiveFilters(filters: LoadBoardFilters) {
  return (
    filters.search.trim() ||
    filters.origin.trim() ||
    filters.destination.trim() ||
    filters.equipment.length > 0 ||
    filters.originState.length > 0 ||
    filters.destinationState.length > 0 ||
    filters.minRate ||
    filters.maxRate ||
    filters.minDistance ||
    filters.maxDistance ||
    filters.status !== "all" ||
    filters.broker.trim() ||
    filters.pickupPreset
  );
}

export function LoadBoard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    allLoads: contextLoads,
    searchQuery,
    setSearchQuery,
    refreshLoads,
    isLoadingLoads,
    loadsError,
  } = useAppState();
  const [expandedLoadId, setExpandedLoadId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<LoadSortOption>("date");
  const [nextPage, setNextPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<LoadBoardFilters>(() =>
    parseLoadFilters(searchParams, searchQuery)
  );
  const filterSearchRef = useRef(filters.search);
  const [loads, setLoads] = useState<Load[]>([]);
  const [totalLoads, setTotalLoads] = useState(0);
  const [isBoardLoading, setIsBoardLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [boardError, setBoardError] = useState("");
  const requestIdRef = useRef(0);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const loadMoreTargetRef = useRef<HTMLDivElement | null>(null);
  const initialUrlSearchRef = useRef(searchParams.get("q") || "");
  const skipInitialUrlSearchSyncRef = useRef(initialUrlSearchRef.current || "");
  const debouncedSearch = useDebouncedValue(filters.search, 350);

  useEffect(() => {
    filterSearchRef.current = filters.search;
  }, [filters.search]);

  useEffect(() => {
    if (initialUrlSearchRef.current) {
      setSearchQuery(initialUrlSearchRef.current);
    }
  }, [setSearchQuery]);

  useEffect(() => {
    if (skipInitialUrlSearchSyncRef.current) {
      if (searchQuery === skipInitialUrlSearchSyncRef.current) {
        skipInitialUrlSearchSyncRef.current = "";
      }

      return;
    }

    if (filterSearchRef.current === searchQuery) {
      return;
    }

    filterSearchRef.current = searchQuery;
    setFilters((current) => ({ ...current, search: searchQuery }));
    setNextPage(1);
  }, [searchQuery]);

  useEffect(() => {
    const nextParams = buildSearchParams(filters);

    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [filters, searchParams, setSearchParams]);

  const supabaseFilters = useMemo<LoadQueryFilters>(() => {
    const range = pickupRange(filters);

    return {
      search: debouncedSearch,
      origin: filters.origin,
      destination: filters.destination,
      equipment: filters.equipment,
      originState: filters.originState,
      destinationState: filters.destinationState,
      minRate: numberFilter(filters.minRate),
      maxRate: numberFilter(filters.maxRate),
      minDistance: numberFilter(filters.minDistance),
      maxDistance: numberFilter(filters.maxDistance),
      status: filters.status,
      broker: filters.broker,
      pickupDateFrom: range.from,
      pickupDateTo: range.to,
    };
  }, [debouncedSearch, filters]);

  const brokerOptions = useMemo(() => {
    const options = new Set<string>();

    [...contextLoads, ...loads].forEach((load) => {
      if (load.broker) {
        options.add(load.broker);
      }
    });

    return Array.from(options);
  }, [contextLoads, loads]);

  const locationOptions = useMemo(() => {
    const options = new Set<string>();

    [...contextLoads, ...loads].forEach((load) => {
      const origin = formatLoadLocation(load.origin);
      const destination = formatLoadLocation(load.destination);

      if (origin) {
        options.add(origin);
      }

      if (destination) {
        options.add(destination);
      }
    });

    return Array.from(options);
  }, [contextLoads, loads]);

  const filtersActive = Boolean(hasActiveFilters(filters));
  const visibleError = boardError || (!loads.length ? loadsError : "");

  const loadBoardPage = useCallback(
    async (page: number, mode: "reset" | "append") => {
      const requestId = requestIdRef.current + 1;
      requestIdRef.current = requestId;

      try {
        if (mode === "reset") {
          setIsBoardLoading(true);
        } else {
          setIsLoadingMore(true);
        }

        setBoardError("");

        const result = await fetchLoadsPage({
          filters: supabaseFilters,
          page,
          pageSize: PAGE_SIZE,
          sortBy,
        });

        if (requestId !== requestIdRef.current) {
          return;
        }

        setLoads((current) => {
          if (mode === "reset") {
            return result.loads;
          }

          const existing = new Set(current.map((load) => load.id));
          return [
            ...current,
            ...result.loads.filter((load) => !existing.has(load.id)),
          ];
        });
        setTotalLoads(result.count);
        setHasMore(page * PAGE_SIZE < result.count && result.loads.length > 0);
        setNextPage(page + 1);
      } catch (error) {
        if (requestId === requestIdRef.current) {
          setBoardError(
            error instanceof Error
              ? error.message
              : "Loads could not be loaded from Supabase"
          );
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setIsBoardLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [sortBy, supabaseFilters]
  );

  useEffect(() => {
    setLoads([]);
    setTotalLoads(0);
    setHasMore(true);
    setNextPage(1);
    loadBoardPage(1, "reset");
  }, [loadBoardPage]);

  const loadMore = useCallback(() => {
    if (!hasMore || isBoardLoading || isLoadingMore) {
      return;
    }

    loadBoardPage(nextPage, "append");
  }, [hasMore, isBoardLoading, isLoadingMore, loadBoardPage, nextPage]);

  useEffect(() => {
    const root = scrollContainerRef.current;
    const target = loadMoreTargetRef.current;

    if (!root || !target) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMore();
        }
      },
      { root, rootMargin: "220px", threshold: 0.01 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [loadMore]);

  const updateFilters = useCallback(
    (patch: Partial<LoadBoardFilters>) => {
      setNextPage(1);
      setFilters((current) => sanitizeFilters({ ...current, ...patch }));

      if (Object.prototype.hasOwnProperty.call(patch, "search")) {
        setSearchQuery(String(patch.search || ""));
      }
    },
    [setSearchQuery]
  );

  const clearFilters = useCallback(() => {
    setNextPage(1);
    setFilters(DEFAULT_FILTERS);
    setSearchQuery("");
  }, [setSearchQuery]);

  const removeFilter = useCallback(
    (key: string, value?: string) => {
      if (key === "search") {
        updateFilters({ search: "" });
        return;
      }

      setNextPage(1);
      setFilters((current) => {
        switch (key) {
          case "origin":
            return { ...current, origin: "", originState: [] };
          case "destination":
            return { ...current, destination: "", destinationState: [] };
          case "equipment":
            return {
              ...current,
              equipment: current.equipment.filter((item) => item !== value),
            };
          case "originState":
            return {
              ...current,
              originState: current.originState.filter((item) => item !== value),
            };
          case "destinationState":
            return {
              ...current,
              destinationState: current.destinationState.filter(
                (item) => item !== value
              ),
            };
          case "rate":
            return { ...current, minRate: "", maxRate: "" };
          case "distance":
            return { ...current, minDistance: "", maxDistance: "" };
          case "status":
            return { ...current, status: "all" };
          case "broker":
            return { ...current, broker: "" };
          case "pickup":
            return { ...current, pickupPreset: "", pickupDate: "" };
          default:
            return current;
        }
      });
    },
    [updateFilters]
  );

  const handleRefresh = useCallback(async () => {
    setNextPage(1);
    await Promise.all([loadBoardPage(1, "reset"), refreshLoads()]);
  }, [loadBoardPage, refreshLoads]);

  const emptyTitle =
    filters.search.trim() || filtersActive
      ? "No matching loads"
      : "No loads available";
  const emptyDescription =
    filters.search.trim() || filtersActive
      ? "No freight loads match the current search or filters. Adjust the lane, broker, equipment, or rate filters and try again."
      : "Loads will appear here once freight data is available.";
  const showInitialSkeleton = isBoardLoading && loads.length === 0;

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
                  {totalLoads.toLocaleString()} matches
                </p>
              </div>
              <div className="rounded-md border border-border bg-background px-2.5 py-1.5">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  <SlidersHorizontal className="h-3 w-3 text-primary" />
                  Search
                </div>
                <p className="max-w-40 truncate text-sm font-semibold text-foreground">
                  {filters.search.trim() || "No query"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="h-9 rounded-md border-border bg-background text-foreground hover:border-foreground/30 hover:bg-accent"
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${
                  isBoardLoading || isLoadingLoads ? "animate-spin" : ""
                }`}
              />
              {isBoardLoading || isLoadingLoads
                ? "Refreshing..."
                : "Refresh Loads"}
            </Button>
            <Select
              value={sortBy}
              onValueChange={(value: LoadSortOption) => {
                setNextPage(1);
                setSortBy(value);
              }}
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

      <FilterBar
        filters={filters}
        onChange={updateFilters}
        onRemove={removeFilter}
        onClear={clearFilters}
        brokerOptions={brokerOptions}
        locationOptions={locationOptions}
        isLoading={isBoardLoading}
        resultCount={totalLoads}
      />

      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-auto bg-background p-2 sm:p-2.5 md:p-3"
      >
        <motion.div layout className="mx-auto max-w-7xl space-y-1.5">
          {visibleError && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-center">
              <p className="text-sm text-destructive">{visibleError}</p>
            </div>
          )}

          {showInitialSkeleton ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <CardSkeleton key={index} rows={2} />
              ))}
            </div>
          ) : loads.length === 0 ? (
            <EmptyState
              title={emptyTitle}
              description={emptyDescription}
              actionLabel="Refresh loads"
              onAction={handleRefresh}
              icon={Radio}
            />
          ) : (
            <>
              <div className="hidden rounded-md border border-border bg-muted px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground lg:grid lg:grid-cols-[126px_minmax(180px,1fr)_108px_96px_128px]">
                <span>Reference</span>
                <span>Lane / Broker</span>
                <span>Pickup</span>
                <span className="text-right">Rate</span>
                <span className="text-right">Action</span>
              </div>
              <div className={isBoardLoading ? "opacity-70" : ""}>
                {loads.map((load) => (
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
              </div>
              <div
                ref={loadMoreTargetRef}
                className="flex min-h-10 items-center justify-center rounded-md border border-border bg-card px-2.5 py-2 text-xs text-muted-foreground"
              >
                {isLoadingMore
                  ? "Loading more loads..."
                  : hasMore
                  ? `Showing ${loads.length.toLocaleString()} of ${totalLoads.toLocaleString()}`
                  : `All ${totalLoads.toLocaleString()} matching loads loaded`}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
