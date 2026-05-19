import { motion, AnimatePresence } from "motion/react";
import {
  MapPin,
  Weight,
  Bookmark,
  Phone,
  Mail,
  Navigation,
  ChevronDown,
  Building2,
  ArrowRight,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { formatLoadLocation, type Load } from "../data/loads";
import { cn } from "./ui/utils";
import React from "react";
import { useAppState } from "../context/app-state";
import { toast } from "sonner";
import { LoadMap } from "./load-map";

interface LoadCardProps {
  load: Load;
  isExpanded: boolean;
  onToggle: () => void;
}

export function LoadCard({ load, isExpanded, onToggle }: LoadCardProps) {
  const { savedLoadIds, bookedLoadIds, toggleSavedLoad, bookLoad } =
    useAppState();
  const isSaved = savedLoadIds.includes(load.id);
  const isBooked = bookedLoadIds.includes(load.id);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const trailerTypeColors: Record<string, string> = {
    "Dry Van": "border-border bg-muted text-foreground",
    Reefer: "border-border bg-muted text-foreground",
    Flatbed: "border-border bg-muted text-foreground",
    "Power Only": "border-border bg-muted text-foreground",
    "Box Truck": "border-border bg-muted text-foreground",
    Other: "border-border bg-muted text-foreground",
  };

  const statusColors: Record<string, string> = {
    Available:
      "border-emerald-600/25 bg-emerald-600/10 text-emerald-700 dark:text-emerald-300",
    Booked: "border-border bg-muted text-muted-foreground",
    Expired: "border-destructive/20 bg-destructive/10 text-destructive",
  };

  const handleToggleSaved = (event: React.MouseEvent) => {
    event.stopPropagation();
    const saved = toggleSavedLoad(load.id);
    toast.success(saved ? "Load saved" : "Load removed");
  };

  const handleBook = (event: React.MouseEvent) => {
    event.stopPropagation();
    const booked = bookLoad(load.id);

    if (booked) {
      toast.success("Load booked successfully");
    } else {
      toast.message("This load is already in My Loads");
    }
  };

  const perMile =
    load.distance > 0 ? (load.rate / load.distance).toFixed(2) : "0.00";
  const originLabel = formatLoadLocation(load.origin);
  const destinationLabel = formatLoadLocation(load.destination);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          "cursor-pointer overflow-hidden rounded-md border border-border bg-card shadow-sm transition-all duration-200",
          "hover:border-foreground/30 hover:bg-accent/30",
          isExpanded && "border-foreground/35 bg-card"
        )}
        onClick={onToggle}
      >
        <div className="px-2 py-1 sm:px-2.5">
          <div className="grid gap-1.5 lg:grid-cols-[126px_minmax(180px,1fr)_108px_96px_128px] lg:items-center">
            <div className="flex min-w-0 flex-wrap items-center gap-1 lg:block lg:space-y-1">
              <Badge className="rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-foreground">
                Ref {load.referenceId}
              </Badge>
              <div className="flex flex-wrap gap-1">
                <Badge
                  className={`${
                    statusColors[load.status]
                  } rounded-md px-1.5 py-0.5 text-[9px] font-semibold`}
                >
                  {load.status}
                </Badge>
                <Badge
                  className={`${
                    trailerTypeColors[load.trailerType]
                  } rounded-md px-1.5 py-0.5 text-[9px] font-semibold`}
                >
                  {load.trailerType}
                </Badge>
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <h3 className="truncate text-[13px] font-semibold text-foreground">
                  {originLabel}
                </h3>
                <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                <h3 className="truncate text-[13px] font-semibold text-foreground">
                  {destinationLabel}
                </h3>
              </div>

              <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[10px] text-muted-foreground">
                <div className="flex min-w-0 items-center gap-1.5">
                  <Building2 className="h-3 w-3 flex-shrink-0" />
                  <span className="max-w-[150px] truncate xl:max-w-[220px]">
                    {load.broker}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Navigation className="h-3 w-3" />
                  <span>{load.distance} mi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Weight className="h-3 w-3" />
                  <span>{load.weight.toLocaleString()} lbs</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] lg:space-y-0.5">
              <div>
                <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                  Pickup
                </p>
                <p className="font-medium text-foreground">
                  {formatDate(load.pickupDate)}
                </p>
                <p className="text-muted-foreground">{load.pickupTime}</p>
              </div>
            </div>

            <div className="rounded-md border border-border bg-background px-2 py-0.5 text-left lg:text-right">
              <p className="text-[9px] uppercase tracking-[0.12em] text-muted-foreground">
                Rate
              </p>
              <p className="text-sm font-semibold leading-tight text-foreground">
                ${load.rate.toLocaleString()}
              </p>
              <p className="text-[10px] text-muted-foreground">${perMile}/mi</p>
            </div>

            <div className="flex min-w-0 items-center justify-between gap-1 sm:justify-start lg:justify-end">
              <Button
                className="h-7 min-w-[54px] flex-shrink-0 rounded-md bg-primary px-2 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90"
                onClick={handleBook}
              >
                {isBooked ? "Booked" : "Book"}
              </Button>
              <div className="flex flex-shrink-0 items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleSaved}
                  className="h-7 w-7 flex-shrink-0 rounded-md hover:bg-accent hover:text-foreground"
                >
                  <Bookmark
                    className={cn(
                      "h-4 w-4",
                      isSaved && "fill-primary text-primary"
                    )}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggle();
                  }}
                  className="h-7 w-7 flex-shrink-0 rounded-md hover:bg-accent hover:text-foreground"
                  aria-expanded={isExpanded}
                >
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      isExpanded && "rotate-180"
                    )}
                  />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.24 }}
              className="overflow-hidden"
            >
              <div className="border-t border-border bg-muted/35 px-2.5 py-2.5 sm:px-3">
                <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-[minmax(0,1.35fr)_240px]">
                  <div className="space-y-2.5">
                    <div className="grid gap-2.5 sm:grid-cols-2">
                      <div>
                        <h4 className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          Pickup Location
                        </h4>
                        <p className="text-xs leading-5 text-muted-foreground">
                          {load.origin.address || originLabel}
                        </p>
                      </div>
                      <div>
                        <h4 className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          Delivery Location
                        </h4>
                        <p className="text-xs leading-5 text-muted-foreground">
                          {load.destination.address || destinationLabel}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-md border border-border bg-card p-2.5">
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
                        Load Specifications
                      </h4>
                      <div className="grid grid-cols-1 gap-1.5 text-xs sm:grid-cols-2">
                        <div>
                          <span className="text-muted-foreground">Weight:</span>
                          <span className="ml-2 text-foreground">
                            {load.weight.toLocaleString()} lbs
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Dimensions:
                          </span>
                          <span className="ml-2 text-foreground">
                            {load.dimensions}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Reference:
                          </span>
                          <span className="ml-2 text-foreground">
                            {load.referenceId}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-md border border-border bg-card p-2.5">
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
                        Broker Information
                      </h4>
                      <p className="mb-2 text-sm text-foreground">
                        {load.broker}
                      </p>
                      <div className="flex flex-wrap gap-2.5 text-xs">
                        <a
                          href={`tel:${load.contact.phone}`}
                          className="flex items-center gap-1.5 text-foreground underline-offset-4 hover:underline"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          {load.contact.phone}
                        </a>
                        <a
                          href={`mailto:${load.contact.email}`}
                          className="flex items-center gap-1.5 text-foreground underline-offset-4 hover:underline"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          {load.contact.email}
                        </a>
                      </div>
                    </div>

                    {load.notes && (
                      <div className="rounded-md border border-border bg-card p-2.5">
                        <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
                          Additional Notes
                        </h4>
                        <p className="text-xs leading-5 text-muted-foreground">
                          {load.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5">
                    <LoadMap load={load} />

                    <div className="rounded-md border border-border bg-card p-2.5">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                          Actions
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {isBooked ? "Booked" : "Available"}
                        </span>
                      </div>
                      <div className="space-y-1.5">
                        <Button
                          className="h-8 w-full rounded-md bg-primary text-xs text-primary-foreground hover:bg-primary/90"
                          onClick={handleBook}
                        >
                          {isBooked ? "Booked" : "Book Now"}
                        </Button>
                        <Button
                          variant="outline"
                          className="h-8 w-full rounded-md border-border text-xs text-foreground hover:bg-accent"
                          onClick={(event) => {
                            event.stopPropagation();
                            window.location.href = `tel:${load.contact.phone}`;
                          }}
                        >
                          <Phone className="mr-2 h-4 w-4" />
                          Call Broker
                        </Button>
                        <Button
                          variant="outline"
                          className="h-8 w-full rounded-md border-border text-xs text-foreground hover:bg-accent"
                          onClick={handleToggleSaved}
                        >
                          <Bookmark
                            className={cn(
                              "mr-2 h-4 w-4",
                              isSaved && "fill-primary"
                            )}
                          />
                          {isSaved ? "Saved" : "Save Load"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}
