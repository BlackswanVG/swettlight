import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { insertListingSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2, UploadCloud } from "lucide-react";

interface UploadedFile {
  type: string;
  name: string;
  ipfsUrl: string;
}

export default function CreateListing() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm({
    resolver: zodResolver(insertListingSchema),
    defaultValues: {
      details: {},
    },
  });

  const handleFileUpload = async (type: string, file: File) => {
    try {
      setIsUploading(true);
      // Create FormData for the file
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      // Upload to your backend which will handle IPFS storage
      const response = await fetch('/api/upload-ipfs', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const { ipfsUrl } = await response.json();

      setUploadedFiles(prev => [...prev, {
        type,
        name: file.name,
        ipfsUrl
      }]);

      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been uploaded to IPFS`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      // Include uploaded files in the listing data
      const listingData = {
        ...data,
        documents: uploadedFiles,
      };
      await apiRequest("POST", "/api/listings", listingData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      toast({
        title: "Success",
        description: "Listing created successfully",
      });
      setLocation("/");
    },
  });

  return (
    <div className="min-h-screen bg-red-700/25">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-8">
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

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="documents">
                  <AccordionTrigger>Upload Documents to IPFS</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        {["vessel-image", "financial-report", "inspection-report", "technical-specs"].map((type) => (
                          <div key={type} className="space-y-2">
                            <label
                              htmlFor={`upload-${type}`}
                              className="block text-sm font-medium text-gray-700"
                            >
                              {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                            </label>
                            <div className="relative">
                              <input
                                id={`upload-${type}`}
                                type="file"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(type, file);
                                }}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={() => document.getElementById(`upload-${type}`)?.click()}
                                disabled={isUploading}
                              >
                                {isUploading ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <UploadCloud className="mr-2 h-4 w-4" />
                                )}
                                Upload
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {uploadedFiles.length > 0 && (
                        <div className="mt-4">
                          <h3 className="text-sm font-medium mb-2">Uploaded Files:</h3>
                          <div className="space-y-2">
                            {uploadedFiles.map((file, index) => (
                              <div
                                key={index}
                                className="text-sm bg-gray-50 p-2 rounded-md flex justify-between items-center"
                              >
                                <span>{file.name}</span>
                                <a
                                  href={file.ipfsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  View on IPFS
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

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
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Listing"
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}