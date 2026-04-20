import { motion, AnimatePresence } from "motion/react";
import {
  MapPin,
  TrendingUp,
  Calendar,
  Weight,
  Bookmark,
  Phone,
  Mail,
  Navigation,
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
    "Dry Van": "bg-primary/10 text-primary border-primary/20",
    Reefer: "bg-accent/60 text-accent-foreground border-border",
    Flatbed: "bg-muted text-muted-foreground border-border",
  };

  const statusColors: Record<string, string> = {
    Available: "bg-green-500/10 text-green-400 border-green-500/20",
    Booked: "bg-muted text-muted-foreground border-border",
    Expired: "bg-destructive/10 text-destructive border-destructive/20",
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Card
        className={cn(
          "overflow-hidden transition-all duration-200 cursor-pointer bg-card border-border",
          "hover:shadow-lg hover:border-primary/50 hover:bg-primary/5",
          isExpanded && "shadow-lg border-primary bg-card"
        )}
        onClick={onToggle}
      >
        <div className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex-1 min-w-0 w-full sm:w-auto">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="truncate text-foreground text-base sm:text-lg">
                    {load.origin.city}, {load.origin.state}
                  </h3>
                  <TrendingUp className="h-4 w-4 text-primary flex-shrink-0" />
                  <h3 className="truncate text-foreground text-base sm:text-lg">
                    {load.destination.city}, {load.destination.state}
                  </h3>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-2 text-xs sm:text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-1.5">
                  <Navigation className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>{load.distance} mi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">
                    {formatDate(load.pickupDate)} • {load.pickupTime}
                  </span>
                  <span className="sm:hidden">
                    {formatDate(load.pickupDate)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Weight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span>{load.weight.toLocaleString()} lbs</span>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  className={`${
                    trailerTypeColors[load.trailerType]
                  } text-xs sm:text-sm`}
                >
                  {load.trailerType}
                </Badge>
                <Badge
                  className={`${statusColors[load.status]} text-xs sm:text-sm`}
                >
                  {load.status}
                </Badge>
                {load.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="border-primary/30 text-primary text-xs sm:text-sm"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end gap-3 w-full sm:w-auto justify-between sm:justify-start flex-shrink-0">
              <div className="text-left sm:text-right">
                <div className="text-xl sm:text-2xl font-semibold text-primary">
                  ${load.rate.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  ${(load.rate / load.distance).toFixed(2)}/mi
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleSaved}
                className="hover:bg-primary/10 hover:text-primary h-8 w-8 sm:h-9 sm:w-9 cursor-pointer"
              >
                <Bookmark
                  className={cn(
                    "h-3.5 w-3.5 sm:h-4 sm:w-4",
                    isSaved && "fill-primary text-primary"
                  )}
                />
              </Button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="border-t border-border px-4 sm:px-5 py-4 sm:py-5 bg-accent/10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="mb-1 flex items-center gap-2 text-foreground text-sm sm:text-base">
                          <MapPin className="h-4 w-4 text-green-500" />
                          Pickup Location
                        </h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {load.origin.address}
                        </p>
                      </div>
                      <div>
                        <h4 className="mb-1 flex items-center gap-2 text-foreground text-sm sm:text-base">
                          <MapPin className="h-4 w-4 text-red-500" />
                          Delivery Location
                        </h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {load.destination.address}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-2 text-foreground text-sm sm:text-base">
                        Load Specifications
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
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
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-2 text-foreground text-sm sm:text-base">
                        Broker Information
                      </h4>
                      <p className="text-xs sm:text-sm mb-2 text-foreground">
                        {load.broker}
                      </p>
                      <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
                        <a
                          href={`tel:${load.contact.phone}`}
                          className="flex items-center gap-1.5 text-primary hover:underline"
                        >
                          <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          {load.contact.phone}
                        </a>
                        <a
                          href={`mailto:${load.contact.email}`}
                          className="flex items-center gap-1.5 text-primary hover:underline"
                        >
                          <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          {load.contact.email}
                        </a>
                      </div>
                    </div>

                    {load.notes && (
                      <div>
                        <h4 className="mb-2 text-foreground text-sm sm:text-base">
                          Additional Notes
                        </h4>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {load.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="aspect-square rounded-lg bg-muted/30 flex items-center justify-center border border-border">
                      <div className="text-center p-4">
                        <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          Map Preview
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {load.origin.city} → {load.destination.city}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-9 sm:h-10 text-sm sm:text-base cursor-pointer"
                        onClick={handleBook}
                      >
                        {isBooked ? "Booked" : "Book Now"}
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-border text-foreground hover:bg-primary/10 h-9 sm:h-10 text-sm sm:text-base cursor-pointer"
                        onClick={(event) => {
                          event.stopPropagation();
                          window.location.href = `tel:${load.contact.phone}`;
                        }}
                      >
                        <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                        Call Broker
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full border-border text-foreground hover:bg-primary/10 h-9 sm:h-10 text-sm sm:text-base cursor-pointer"
                        onClick={handleToggleSaved}
                      >
                        <Bookmark
                          className={cn(
                            "h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2",
                            isSaved && "fill-primary"
                          )}
                        />
                        {isSaved ? "Saved" : "Save Load"}
                      </Button>
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
