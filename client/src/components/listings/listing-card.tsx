import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Ship } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Listing } from "@shared/schema";
import { useState } from "react";

interface ListingCardProps {
  listing: Listing;
  onVote?: (vote: "approve" | "reject") => void;
}

export default function ListingCard({ listing, onVote }: ListingCardProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Function to handle IPFS and DID URLs
  const getImageUrl = (url: string | undefined) => {
    if (!url) return undefined;

    // If it's a DID key or IPFS URL, use the local image as fallback
    if (url.startsWith('did:key:') || url.includes('ipfs')) {
      return '/attached_assets/oystr.png';
    }

    return url;
  };

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
        {listing.imageUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            )}
            <img 
              src={getImageUrl(listing.imageUrl)}
              alt={listing.title}
              className={`h-full w-full object-cover transition-opacity duration-300 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={() => setImageLoading(false)}
              onError={(e) => {
                setImageLoading(false);
                setImageError(true);
                const target = e.target as HTMLImageElement;
                target.src = '/attached_assets/oystr.png';
              }}
            />
          </div>
        )}

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

        <div className="border-t pt-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Token Supply</p>
              <p className="text-lg">{listing.tokenSupply?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Token Price</p>
              <p className="text-lg">${listing.tokenPrice}</p>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-sm font-medium">Vessel Identifiers</p>
            {listing.vesselIdentifiers && (
              <div className="text-sm font-mono mt-1 space-y-1">
                {Object.entries(listing.vesselIdentifiers).map(([key, value]) => (
                  <p key={key}>{key}: {value}</p>
                ))}
              </div>
            )}
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