import { Bookmark } from "lucide-react";
import { Card } from "./ui/card";

export function SavedLoads() {
  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8 space-y-6 bg-background">
      <div>
        <h1 className="mb-2 text-foreground text-2xl sm:text-3xl">Saved Loads</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Access your bookmarked loads</p>
      </div>

      <Card className="p-8 sm:p-12 text-center bg-card border-border">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Bookmark className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
          </div>
          <h3 className="mb-2 text-foreground text-lg sm:text-xl">No Saved Loads</h3>
          <p className="text-sm sm:text-base text-muted-foreground">
            You haven't saved any loads yet. Click the bookmark icon on any load card to save it for later.
          </p>
        </div>
      </Card>
    </div>
  );
}