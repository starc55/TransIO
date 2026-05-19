import { supabase } from "../../lib/supabase";
import { type ApiLoad, type Load, mapApiLoadToLoad } from "../data/loads";

export interface AdminStats {
  totalLoads: number;
  totalUsers: number;
  activeSubscriptions: number;
}

export interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.API_BASE_URL ||
  "https://transio-t20l.onrender.com";
const LOAD_RETENTION_HOURS = 3;

export type LoadSortOption = "rate-high" | "rate-low" | "distance" | "date";

export interface LoadQueryFilters {
  search?: string;
  equipment?: string[];
  originState?: string[];
  destinationState?: string[];
  minRate?: number;
  maxRate?: number;
  minDistance?: number;
  maxDistance?: number;
  status?: string;
  broker?: string;
  pickupDateFrom?: string;
  pickupDateTo?: string;
}

export interface FetchLoadsPageParams {
  filters?: LoadQueryFilters;
  page?: number;
  pageSize?: number;
  sortBy?: LoadSortOption;
}

export interface FetchLoadsPageResult {
  loads: Load[];
  count: number;
  page: number;
  pageSize: number;
}

function getLoadExpiryCutoff() {
  return new Date(
    Date.now() - LOAD_RETENTION_HOURS * 60 * 60 * 1000
  ).toISOString();
}

function cleanList(values: string[] | undefined) {
  return Array.from(
    new Set((values || []).map((value) => value.trim()).filter(Boolean))
  );
}

function sanitizeSearchTerm(value: string | undefined) {
  return String(value || "")
    .trim()
    .replace(/[,%(){}"']/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 90);
}

function sanitizePatternTerm(value: string | undefined) {
  return sanitizeSearchTerm(value).replace(/[%*_]/g, " ").trim();
}

function toNumber(value: number | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return undefined;
  }

  return value;
}

function applyLoadFilters(query: any, filters: LoadQueryFilters = {}) {
  const search = sanitizePatternTerm(filters.search);
  const equipment = cleanList(filters.equipment);
  const originState = cleanList(filters.originState);
  const destinationState = cleanList(filters.destinationState);
  const minRate = toNumber(filters.minRate);
  const maxRate = toNumber(filters.maxRate);
  const minDistance = toNumber(filters.minDistance);
  const maxDistance = toNumber(filters.maxDistance);
  const broker = sanitizePatternTerm(filters.broker);
  const status =
    filters.status && filters.status !== "all" ? filters.status : "";

  if (search) {
    const pattern = `*${search}*`;
    query = query.or(
      [
        `origin->>city.ilike.${pattern}`,
        `origin->>state.ilike.${pattern}`,
        `origin->>address.ilike.${pattern}`,
        `destination->>city.ilike.${pattern}`,
        `destination->>state.ilike.${pattern}`,
        `destination->>address.ilike.${pattern}`,
        `broker.ilike.${pattern}`,
        `contact->>phone.ilike.${pattern}`,
        `trailer_type.ilike.${pattern}`,
      ].join(",")
    );
  }

  if (equipment.length > 0) {
    query = query.in("trailer_type", equipment);
  }

  if (originState.length > 0) {
    query = query.in("origin->>state", originState);
  }

  if (destinationState.length > 0) {
    query = query.in("destination->>state", destinationState);
  }

  if (minRate !== undefined) {
    query = query.gte("rate", minRate);
  }

  if (maxRate !== undefined) {
    query = query.lte("rate", maxRate);
  }

  if (minDistance !== undefined) {
    query = query.gte("distance", minDistance);
  }

  if (maxDistance !== undefined) {
    query = query.lte("distance", maxDistance);
  }

  if (status) {
    query = query.eq("status", status);
  }

  if (broker) {
    query = query.ilike("broker", `%${broker}%`);
  }

  if (filters.pickupDateFrom) {
    query = query.gte("pickup_date", filters.pickupDateFrom);
  }

  if (filters.pickupDateTo) {
    query = query.lte("pickup_date", filters.pickupDateTo);
  }

  return query;
}

function applyLoadSort(query: any, sortBy: LoadSortOption) {
  switch (sortBy) {
    case "rate-high":
      return query.order("rate", { ascending: false, nullsFirst: false });
    case "rate-low":
      return query.order("rate", { ascending: true, nullsFirst: false });
    case "distance":
      return query.order("distance", { ascending: true, nullsFirst: false });
    case "date":
    default:
      return query
        .order("pickup_date", { ascending: true, nullsFirst: false })
        .order("received_at", { ascending: false });
  }
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  userId?: string | null
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(userId ? { "x-user-id": userId } : {}),
    },
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || "API request failed");
  }

  return payload as T;
}

export async function fetchLoads(): Promise<Load[]> {
  if (!supabase) {
    throw new Error("Supabase env variables are missing.");
  }

  const { data, error } = await supabase
    .from("loads")
    .select("*")
    .gte("received_at", getLoadExpiryCutoff())
    .order("received_at", { ascending: false });

  if (error) {
    throw new Error("Loads could not be loaded from Supabase");
  }

  return (data as ApiLoad[]).map(mapApiLoadToLoad);
}

export async function fetchLoadsPage({
  filters = {},
  page = 1,
  pageSize = 25,
  sortBy = "date",
}: FetchLoadsPageParams = {}): Promise<FetchLoadsPageResult> {
  if (!supabase) {
    throw new Error("Supabase env variables are missing.");
  }

  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize - 1;

  let query = supabase
    .from("loads")
    .select("*", { count: "exact" })
    .gte("received_at", getLoadExpiryCutoff());

  query = applyLoadFilters(query, filters);
  query = applyLoadSort(query, sortBy);

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error("Loads could not be loaded from Supabase");
  }

  return {
    loads: (data as ApiLoad[]).map(mapApiLoadToLoad),
    count: count ?? 0,
    page: safePage,
    pageSize: safePageSize,
  };
}

export async function fetchAdminStats(userId: string) {
  const payload = await apiRequest<{ data: AdminStats }>("/stats", {}, userId);
  return payload.data;
}

export async function fetchUsers(userId: string) {
  const payload = await apiRequest<{ data: AdminUser[] }>("/users", {}, userId);
  return payload.data;
}
