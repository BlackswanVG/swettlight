import { useQuery, useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import ListingCard from "@/components/listings/listing-card";
import type { Listing } from "@shared/schema";

export default function HomePage() {
  const { user } = useAuth();

  const { data: listings, isLoading } = useQuery<Listing[]>({
    queryKey: ["/api/listings"],
  });

  const voteMutation = useMutation({
    mutationFn: async ({
      listingId,
      vote,
    }: {
      listingId: number;
      vote: "approve" | "reject";
    }) => {
      await apiRequest("POST", `/api/listings/${listingId}/vote`, { vote });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Marine Asset Marketplace</h1>
        <p className="text-muted-foreground">
          Browse and invest in maritime vessels through fractional ownership
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {listings?.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            onVote={
              user.isKYCVerified
                ? (vote) =>
                    voteMutation.mutate({
                      listingId: listing.id,
                      vote,
                    })
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}
