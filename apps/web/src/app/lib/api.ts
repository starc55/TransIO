
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

function getLoadExpiryCutoff() {
  return new Date(Date.now() - LOAD_RETENTION_HOURS * 60 * 60 * 1000).toISOString();
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

export async function fetchAdminStats(userId: string) {
  const payload = await apiRequest<{ data: AdminStats }>("/stats", {}, userId);
  return payload.data;
}

export async function fetchUsers(userId: string) {
  const payload = await apiRequest<{ data: AdminUser[] }>("/users", {}, userId);
  return payload.data;
}
