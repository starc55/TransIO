import { Bookmark } from "lucide-react";
import { Card } from "./ui/card";
import { useAppState } from "../context/app-state";
import { LoadCard } from "./load-card";
import { useState } from "react";
import React from "react";

export function SavedLoads() {
  const [expandedLoadId, setExpandedLoadId] = useState<string | null>(null);
  const { savedLoads, searchQuery } = useAppState();

  const visibleLoads = savedLoads.filter((load) =>
    [
      load.id,
      load.origin.city,
      load.destination.city,
      load.broker,
      ...load.tags,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-full space-y-6 bg-background p-4 sm:p-6 lg:p-8">
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-6">
        <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
          Saved Loads
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Access your bookmarked loads
        </p>
        <div className="mt-4 inline-flex rounded-md border border-border bg-muted px-3 py-1.5 text-xs font-medium text-foreground">
          {visibleLoads.length} saved loads
        </div>
      </div>

      {visibleLoads.length === 0 ? (
        <Card className="rounded-lg border border-border bg-card p-8 text-center sm:p-12">
          <div className="mx-auto max-w-md">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg border border-border bg-muted sm:h-20 sm:w-20">
              <Bookmark className="h-8 w-8 text-primary sm:h-10 sm:w-10" />
            </div>
            <h3 className="mb-2 text-lg text-foreground sm:text-xl">
              No Saved Loads
            </h3>
            <p className="text-sm text-muted-foreground sm:text-base">
              You haven't saved any loads yet. Click the bookmark icon on any
              load card to save it for later.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {visibleLoads.map((load) => (
            <LoadCard
              key={load.id}
              load={load}
              isExpanded={expandedLoadId === load.id}
              onToggle={() =>
                setExpandedLoadId(expandedLoadId === load.id ? null : load.id)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
