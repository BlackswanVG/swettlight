import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ship } from "lucide-react";
import type { Listing } from "@shared/schema";

interface ListingCardProps {
  listing: Listing;
  onVote?: (vote: "approve" | "reject") => void;
}

export default function ListingCard({ listing, onVote }: ListingCardProps) {
  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">{listing.title}</CardTitle>
          <Badge variant={listing.status === "approved" ? "default" : "secondary"}>
            {listing.status}
          </Badge>
        </div>
        <div className="flex items-center text-muted-foreground">
          <Ship className="mr-2 h-4 w-4" />
          {listing.vesselType}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{listing.description}</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Projected ROI</p>
            <p className="text-2xl font-bold">{listing.projectedROI}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Ownership Available</p>
            <p className="text-2xl font-bold">{listing.ownershipPercentage}%</p>
          </div>
        </div>

        {onVote && (
          <div className="flex gap-2 mt-4">
            <Button
              variant="default"
              className="w-full"
              onClick={() => onVote("approve")}
            >
              Approve
            </Button>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => onVote("reject")}
            >
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
