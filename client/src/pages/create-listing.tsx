import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { insertListingSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadToIPFS } from "@/lib/ipfs";
import { Loader2, Upload } from "lucide-react";
import { useState } from "react";

type ListingFormData = {
  title: string;
  description: string;
  vesselType: string;
  projectedROI: string;
  ownershipPercentage: number;
  details: Record<string, unknown>;
  whitepaper?: File;
  legalDocuments?: File;
};

export default function CreateListing() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ListingFormData>({
    resolver: zodResolver(insertListingSchema),
    defaultValues: {
      title: "",
      description: "",
      vesselType: "",
      projectedROI: "",
      ownershipPercentage: 0,
      details: {},
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ListingFormData) => {
      setIsUploading(true);
      try {
        let whitepaperCID: string | undefined;
        let legalDocumentsCID: string | undefined;

        if (data.whitepaper) {
          whitepaperCID = await uploadToIPFS(data.whitepaper);
        }

        if (data.legalDocuments) {
          legalDocumentsCID = await uploadToIPFS(data.legalDocuments);
        }

        const listingData = {
          ...data,
          whitepaperCID,
          legalDocumentsCID,
        };

        // Remove the File objects before sending to API
        delete listingData.whitepaper;
        delete listingData.legalDocuments;

        await apiRequest("POST", "/api/listings", listingData);
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      toast({
        title: "Success",
        description: "Listing created successfully",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating listing",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Create New Listing</h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => createMutation.mutate(data))}
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vesselType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vessel Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vessel type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cargo">Cargo Ship</SelectItem>
                    <SelectItem value="tanker">Tanker</SelectItem>
                    <SelectItem value="barge">Barge</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="projectedROI"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Projected ROI</FormLabel>
                <FormControl>
                  <Input {...field} type="text" placeholder="e.g. 12%" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ownershipPercentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ownership Percentage Available</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min="1"
                    max="100"
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          

          <Button
            type="submit"
            className="w-full"
            disabled={createMutation.isPending || isUploading}
          >
            {(createMutation.isPending || isUploading) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isUploading ? "Uploading Documents..." : "Creating Listing..."}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Create Listing
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}