import { motion, AnimatePresence } from "motion/react";
import {
  MapPin,
  Weight,
  Bookmark,
  Phone,
  Mail,
  Navigation,
  ChevronDown,
  CircleDot,
  Building2,
  ArrowRight,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card } from "./ui/card";
import { type Load } from "../data/loads";
import { cn } from "./ui/utils";
import React from "react";
import { useAppState } from "../context/app-state";
import { toast } from "sonner";

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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          "cursor-pointer overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all duration-200",
          "hover:border-foreground/30 hover:bg-accent/35 hover:shadow-md",
          isExpanded && "border-foreground/35 bg-card shadow-md"
        )}
        onClick={onToggle}
      >
        <div className="px-2.5 py-1.5 sm:px-3">
          <div className="grid gap-2 lg:grid-cols-[150px_minmax(220px,1fr)_142px_110px_132px] lg:items-center">
            <div className="flex min-w-0 flex-wrap items-center gap-1.5 lg:block lg:space-y-1.5">
              <Badge className="rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-foreground">
                Ref {load.referenceId}
              </Badge>
              <div className="flex flex-wrap gap-1.5">
                <Badge
                  className={`${
                    statusColors[load.status]
                  } rounded-md px-1.5 py-0.5 text-[10px] font-semibold`}
                >
                  {load.status}
                </Badge>
                <Badge
                  className={`${
                    trailerTypeColors[load.trailerType]
                  } rounded-md px-1.5 py-0.5 text-[10px] font-semibold`}
                >
                  {load.trailerType}
                </Badge>
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <h3 className="truncate text-sm font-semibold text-foreground">
                  {load.origin.city}, {load.origin.state}
                </h3>
                <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                <h3 className="truncate text-sm font-semibold text-foreground">
                  {load.destination.city}, {load.destination.state}
                </h3>
              </div>

              <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                <div className="flex min-w-0 items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="max-w-[180px] truncate xl:max-w-[240px]">
                    {load.broker}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Navigation className="h-3.5 w-3.5" />
                  <span>{load.distance} mi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Weight className="h-3.5 w-3.5" />
                  <span>{load.weight.toLocaleString()} lbs</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs lg:block lg:space-y-1">
              <div>
                <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  Pickup
                </p>
                <p className="font-medium text-foreground">
                  {formatDate(load.pickupDate)}
                </p>
                <p className="text-muted-foreground">{load.pickupTime}</p>
              </div>
              <div className="lg:hidden">
                <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                  Source
                </p>
                <p className="truncate font-medium text-foreground">
                  {load.source}
                </p>
              </div>
            </div>

            <div className="rounded-md border border-border bg-background px-2 py-1 text-left lg:text-right">
              <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                Rate
              </p>
              <p className="text-base font-semibold leading-tight text-foreground">
                ${load.rate.toLocaleString()}
              </p>
              <p className="text-[11px] text-muted-foreground">${perMile}/mi</p>
            </div>

            <div className="flex min-w-0 items-center justify-between gap-1 sm:justify-start lg:justify-end">
              <Button
                className="h-8 min-w-[64px] flex-shrink-0 rounded-md bg-primary px-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                onClick={handleBook}
              >
                {isBooked ? "Booked" : "Book"}
              </Button>
              <div className="flex flex-shrink-0 items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleToggleSaved}
                  className="h-8 w-8 flex-shrink-0 rounded-md hover:bg-accent hover:text-foreground"
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
                  className="h-8 w-8 flex-shrink-0 rounded-md hover:bg-accent hover:text-foreground"
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

          {load.tags.length > 0 && (
            <div className="mt-2 hidden flex-wrap gap-1.5 border-t border-border/70 pt-2 lg:flex">
              {load.tags.slice(0, 4).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="rounded-md border-border bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
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
              <div className="border-t border-border bg-muted/35 px-3 py-3 sm:px-4">
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.35fr)_280px]">
                  <div className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <h4 className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          Pickup Location
                        </h4>
                        <p className="text-xs leading-5 text-muted-foreground">
                          {load.origin.address}
                        </p>
                      </div>
                      <div>
                        <h4 className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          Delivery Location
                        </h4>
                        <p className="text-xs leading-5 text-muted-foreground">
                          {load.destination.address}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-3">
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
                        Load Specifications
                      </h4>
                      <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
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
                        <div>
                          <span className="text-muted-foreground">Source:</span>
                          <span className="ml-2 text-foreground">
                            {load.source}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-3">
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
                        Broker Information
                      </h4>
                      <p className="mb-2 text-sm text-foreground">
                        {load.broker}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs">
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
                      <div className="rounded-lg border border-border bg-card p-3">
                        <h4 className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-foreground">
                          Additional Notes
                        </h4>
                        <p className="text-xs leading-5 text-muted-foreground">
                          {load.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-lg border border-border bg-card p-4">
                      <div className="text-center">
                        <CircleDot className="mx-auto mb-2 h-6 w-6 text-foreground" />
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          Lane Snapshot
                        </p>
                        <p className="mt-2 text-sm font-medium text-foreground">
                          {load.origin.city} to {load.destination.city}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {load.distance} miles | {load.trailerType}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border bg-card p-3">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                          Actions
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {isBooked ? "Booked" : "Available"}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <Button
                          className="h-9 w-full rounded-md bg-primary text-sm text-primary-foreground hover:bg-primary/90"
                          onClick={handleBook}
                        >
                          {isBooked ? "Booked" : "Book Now"}
                        </Button>
                        <Button
                          variant="outline"
                          className="h-9 w-full rounded-md border-border text-sm text-foreground hover:bg-accent"
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
                          className="h-9 w-full rounded-md border-border text-sm text-foreground hover:bg-accent"
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
