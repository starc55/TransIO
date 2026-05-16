import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  fetchAdminStats,
  fetchUsers,
  type AdminStats,
  type AdminUser,
} from "../lib/api";
import { formatRoleLabel, useAppState } from "../context/app-state";
import { BarChart3, RefreshCw, ShieldCheck, Users, Boxes } from "lucide-react";
import React from "react";

type AdminView = "overview" | "users" | "stats";

interface AdminProps {
  view?: AdminView;
}

export function Admin({ view = "overview" }: AdminProps) {
  const {
    isAdmin,
    profileLoading,
    currentUserId,
    allLoads,
    isLoadingLoads,
    loadsError,
    refreshLoads,
  } = useAppState();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAdminData = async () => {
    if (!currentUserId) {
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const [statsResponse, usersResponse] = await Promise.all([
        fetchAdminStats(currentUserId),
        fetchUsers(currentUserId),
      ]);

      setStats(statsResponse);
      setUsers(usersResponse);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Admin data could not be loaded"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin || !currentUserId) {
      return;
    }

    loadAdminData();
  }, [currentUserId, isAdmin]);

  if (profileLoading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background p-6 text-sm text-muted-foreground">
        Loading admin profile...
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  const statCards = [
    {
      label: "Total Loads",
      value: stats?.totalLoads ?? 0,
      icon: Boxes,
    },
    {
      label: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
    },
    {
      label: "Active Subscriptions",
      value: stats?.activeSubscriptions ?? 0,
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8 space-y-6 bg-background">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="mb-2 text-foreground text-2xl sm:text-3xl font-semibold">
            Admin Panel
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Backend stats, users, and latest DAT extension loads in one place.
          </p>
        </div>

        <Button
          variant="outline"
          className="rounded-md border-border text-foreground hover:bg-accent cursor-pointer"
          onClick={() => {
            refreshLoads();
            loadAdminData();
          }}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {(error || loadsError) && (
        <Card className="p-4 border-destructive/30 bg-destructive/5">
          <p className="text-sm text-destructive">{error || loadsError}</p>
        </Card>
      )}

      {(view === "overview" || view === "stats") && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statCards.map((item) => (
            <Card key={item.label} className="rounded-lg p-5 bg-card border-border">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <h2 className="mt-2 text-3xl font-bold text-foreground">
                    {isLoading ? "..." : item.value.toLocaleString()}
                  </h2>
                </div>
                <div className="p-3 rounded-md bg-muted">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div
        className={
          view === "overview"
            ? "grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6"
            : "grid grid-cols-1 gap-6"
        }
      >
        {(view === "overview" || view === "users") && (
        <Card className="rounded-lg p-5 sm:p-6 bg-card border-border">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Users</h3>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 && !isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="py-6 text-center text-muted-foreground"
                  >
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-foreground">
                      {user.full_name || "Unnamed user"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell className="text-foreground">
                      {formatRoleLabel(user.role)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString("en-US")}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
        )}

        {(view === "overview" || view === "stats") && (
        <Card className="rounded-lg p-5 sm:p-6 bg-card border-border">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              Latest Collector Loads
            </h3>
          </div>

          <div className="space-y-3">
            {allLoads.slice(0, 6).map((load) => (
              <div
                key={load.id}
                className="rounded-md border border-border bg-background p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {load.origin.city}, {load.origin.state} to{" "}
                      {load.destination.city}, {load.destination.state}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {load.referenceId} | {load.source} | {load.trailerType}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">
                      ${load.rate.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(load.receivedAt).toLocaleString("en-US")}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {allLoads.length === 0 && !isLoadingLoads && (
              <p className="text-sm text-muted-foreground">
                Collector loads will appear here after `/ingest` writes data.
              </p>
            )}
          </div>
        </Card>
        )}
      </div>
    </div>
  );
}
