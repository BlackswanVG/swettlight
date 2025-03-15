import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MaritimeLoader } from "@/components/ui/maritime-loader";
import { Ship, TrendingUp, Globe, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface NewsItem {
  id: number;
  title: string;
  description: string;
  category: "industry" | "market" | "events" | "transactions";
  date: string;
  source?: string;
}

export default function MaritimeNewsPage() {
  const { data: newsItems, isLoading } = useQuery<NewsItem[]>({
    queryKey: ["/api/news"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center space-y-4">
          <MaritimeLoader variant="waves" size="lg" />
          <p className="text-muted-foreground animate-pulse">Loading maritime news...</p>
        </div>
      </div>
    );
  }

  // Temporary mock data until backend is implemented
  const mockNews: NewsItem[] = [
    {
      id: 1,
      title: "Global Shipping Rates Show Strong Recovery",
      description: "Container shipping rates on major routes show significant improvement as global trade volumes increase.",
      category: "market",
      date: "2025-03-15",
      source: "Maritime Weekly"
    },
    {
      id: 2,
      title: "New Sustainable Vessel Technologies Emerge",
      description: "Leading shipbuilders unveil innovative designs for zero-emission cargo vessels.",
      category: "industry",
      date: "2025-03-14",
      source: "Marine Technology Review"
    },
    {
      id: 3,
      title: "Major Port Expansion Project Announced",
      description: "Singapore announces $5B investment in port automation and expansion.",
      category: "events",
      date: "2025-03-13",
      source: "Port Technology International"
    }
  ];

  const news = newsItems || mockNews;

  const getCategoryIcon = (category: NewsItem["category"]) => {
    switch (category) {
      case "industry":
        return <Ship className="h-5 w-5 text-muted-foreground" />;
      case "market":
        return <TrendingUp className="h-5 w-5 text-muted-foreground" />;
      case "events":
        return <Globe className="h-5 w-5 text-muted-foreground" />;
      case "transactions":
        return <DollarSign className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="min-h-screen bg-blue-500/25">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Maritime News & Updates</h1>
          <p className="text-muted-foreground">
            Stay informed with the latest maritime industry news and market trends
          </p>
        </div>

        <div className="grid gap-6 mt-8">
          {news.map((item) => (
            <Card key={item.id} className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(item.category)}
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                  </div>
                  <Badge variant="secondary">{item.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{item.description}</p>
                <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
                  <p>{new Date(item.date).toLocaleDateString()}</p>
                  {item.source && <p>Source: {item.source}</p>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}