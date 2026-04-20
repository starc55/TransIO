import { Package, Calendar, MapPin } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { useAppState } from "../context/app-state";
import React from "react";

export function MyLoads() {
  const { bookedLoads } = useAppState();

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8 space-y-6 bg-background">
      <div>
        <h1 className="mb-2 text-foreground text-2xl sm:text-3xl">My Loads</h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Track and manage your booked loads
        </p>
      </div>

      <div className="grid gap-4 max-w-4xl">
        {bookedLoads.length === 0 ? (
          <Card className="p-8 sm:p-10 bg-card border-border">
            <p className="text-muted-foreground">
              No booked loads yet. Click “Book Now” on the Load Board page
              to add them here.
            </p>
          </Card>
        ) : (
          bookedLoads.map((load, index) => (
            <Card
              key={load.id}
              className="p-4 sm:p-6 bg-card border-border hover:border-primary/50 transition-all"
            >
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                <div className="flex-1 space-y-3 w-full">
                  <div className="flex flex-wrap items-center gap-2">
                    <Package className="h-5 w-5 text-primary flex-shrink-0" />
                    <h3 className="text-foreground text-base sm:text-lg">
                      Load #{load.id}
                    </h3>
                    <Badge
                      className={
                        index === 0
                          ? "bg-primary/10 text-primary border-primary/20"
                          : "bg-green-500/10 text-green-400 border-green-500/20"
                      }
                    >
                      {index === 0 ? "In Transit" : "Confirmed"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">
                      {load.origin.city}, {load.origin.state} →{" "}
                      {load.destination.city}, {load.destination.state}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span>
                      Pickup:{" "}
                      {new Date(load.pickupDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                  <div className="text-xl sm:text-2xl font-bold text-primary">
                    ${load.rate.toLocaleString()}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
