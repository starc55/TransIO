import { Package, Calendar, MapPin, TrendingUp } from "lucide-react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";

export function MyLoads() {
  const myLoads = [
    {
      id: "L001",
      origin: "Los Angeles, CA",
      destination: "Phoenix, AZ",
      pickupDate: "2026-04-08",
      status: "In Transit",
      rate: 1250
    },
    {
      id: "L005",
      origin: "Denver, CO",
      destination: "Salt Lake City, UT",
      pickupDate: "2026-04-10",
      status: "Confirmed",
      rate: 1600
    }
  ];

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8 space-y-6 bg-background">
      <div>
        <h1 className="mb-2 text-foreground text-2xl sm:text-3xl">My Loads</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Track and manage your booked loads</p>
      </div>

      <div className="grid gap-4 max-w-4xl">
        {myLoads.map((load) => (
          <Card key={load.id} className="p-4 sm:p-6 bg-card border-border hover:border-primary/50 transition-all">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
              <div className="flex-1 space-y-3 w-full">
                <div className="flex flex-wrap items-center gap-2">
                  <Package className="h-5 w-5 text-primary flex-shrink-0" />
                  <h3 className="text-foreground text-base sm:text-lg">Load #{load.id}</h3>
                  <Badge className={
                    load.status === "In Transit" 
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-green-500/10 text-green-400 border-green-500/20"
                  }>
                    {load.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{load.origin} → {load.destination}</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>Pickup: {new Date(load.pickupDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
              <div className="text-left sm:text-right w-full sm:w-auto">
                <div className="text-xl sm:text-2xl font-bold text-primary">${load.rate.toLocaleString()}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}