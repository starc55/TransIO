import React from "react";
import { ExternalLink, MapPinned, Route } from "lucide-react";
import { type Load } from "../data/loads";
import { Button } from "./ui/button";

interface LoadMapProps {
  load: Load;
}

function formatMapLocation(location: Load["origin"]) {
  const address =
    location.address && location.address !== "Unknown address"
      ? location.address
      : "";

  return [address, location.city, location.state]
    .filter(Boolean)
    .join(", ");
}

function buildMapsRoute(load: Load) {
  const origin = formatMapLocation(load.origin);
  const destination = formatMapLocation(load.destination);

  return {
    origin,
    destination,
    embedUrl: `https://maps.google.com/maps?f=d&source=s_d&saddr=${encodeURIComponent(
      origin
    )}&daddr=${encodeURIComponent(destination)}&hl=en&z=6&output=embed`,
    directionsUrl: `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(
      origin
    )}&destination=${encodeURIComponent(destination)}&travelmode=driving`,
  };
}

export function LoadMap({ load }: LoadMapProps) {
  const route = buildMapsRoute(load);

  return (
    <div
      className="overflow-hidden rounded-lg border border-border bg-card"
      onClick={(event) => event.stopPropagation()}
    >
      <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2.5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <MapPinned className="h-4 w-4 text-primary" />
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
              Route Map
            </p>
          </div>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {load.origin.city}, {load.origin.state} to {load.destination.city},{" "}
            {load.destination.state}
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8 shrink-0 rounded-md border-border bg-background px-2 text-xs text-foreground hover:bg-accent"
        >
          <a
            href={route.directionsUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Open route in Google Maps"
          >
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
            Open
          </a>
        </Button>
      </div>

      <div className="relative aspect-[4/3] min-h-[230px] bg-muted">
        <iframe
          title={`Route map from ${route.origin} to ${route.destination}`}
          src={route.embedUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>

      <div className="grid grid-cols-2 divide-x divide-border border-t border-border">
        <div className="min-w-0 px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <Route className="h-3 w-3" />
            Pickup
          </div>
          <p className="mt-1 truncate text-xs text-foreground">
            {route.origin}
          </p>
        </div>
        <div className="min-w-0 px-3 py-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <Route className="h-3 w-3" />
            Delivery
          </div>
          <p className="mt-1 truncate text-xs text-foreground">
            {route.destination}
          </p>
        </div>
      </div>
    </div>
  );
}
