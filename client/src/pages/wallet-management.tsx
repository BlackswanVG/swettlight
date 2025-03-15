import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MaritimeLoader } from "@/components/ui/maritime-loader";
import { Wallet, Lock, Coins, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface WalletDetails {
  address: string;
  balance: string;
  type: "dev" | "treasury" | "dividends-received" | "dividends-distributed";
  lockPeriod?: {
    start: string;
    end: string;
  };
  assets?: Array<{
    id: number;
    name: string;
    type: string;
    percentage: number;
  }>;
}

export default function WalletManagementPage() {
  const { user } = useAuth();
  const [selectedWallet, setSelectedWallet] = useState<WalletDetails | null>(null);

  const { data: wallets, isLoading } = useQuery<WalletDetails[]>({
    queryKey: ["/api/wallets"],
  });

  // Mock data until backend is implemented
  const mockWallets: WalletDetails[] = [
    {
      address: "0x1234...5678",
      balance: "1000 ETH",
      type: "dev",
      lockPeriod: {
        start: "2025-01-01",
        end: "2026-01-01",
      },
      assets: [
        {
          id: 1,
          name: "Cargo Vessel Alpha",
          type: "cargo",
          percentage: 15,
        },
      ],
    },
    {
      address: "0x8765...4321",
      balance: "5000 ETH",
      type: "treasury",
      assets: [
        {
          id: 2,
          name: "Tanker Beta",
          type: "tanker",
          percentage: 30,
        },
      ],
    },
    {
      address: "0xabcd...efgh",
      balance: "200 ETH",
      type: "dividends-received",
      assets: [],
    },
    {
      address: "0xijkl...mnop",
      balance: "150 ETH",
      type: "dividends-distributed",
      assets: [],
    },
  ];

  const displayWallets = wallets || mockWallets;

  const getWalletIcon = (type: WalletDetails["type"]) => {
    switch (type) {
      case "dev":
        return <Building2 className="h-5 w-5" />;
      case "treasury":
        return <Wallet className="h-5 w-5" />;
      case "dividends-received":
      case "dividends-distributed":
        return <Coins className="h-5 w-5" />;
    }
  };

  const getWalletTitle = (type: WalletDetails["type"]) => {
    switch (type) {
      case "dev":
        return "Development Team Wallet";
      case "treasury":
        return "Treasury Wallet";
      case "dividends-received":
        return "Dividends Received";
      case "dividends-distributed":
        return "Dividends Distributed";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center space-y-4">
          <MaritimeLoader variant="waves" size="lg" />
          <p className="text-muted-foreground animate-pulse">Loading wallets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-500/25">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">Wallet Management</h1>
          <p className="text-muted-foreground">
            View and manage project wallets and their associated assets
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          {displayWallets.map((wallet) => (
            <Card key={wallet.address} className="bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getWalletIcon(wallet.type)}
                    <CardTitle>{getWalletTitle(wallet.type)}</CardTitle>
                  </div>
                  {wallet.lockPeriod && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Locked
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium">Address</p>
                    <p className="font-mono">{wallet.address}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Balance</p>
                    <p className="text-2xl font-bold">{wallet.balance}</p>
                  </div>
                  {wallet.lockPeriod && (
                    <div>
                      <p className="text-sm font-medium">Lock Period</p>
                      <p>
                        {new Date(wallet.lockPeriod.start).toLocaleDateString()} -{" "}
                        {new Date(wallet.lockPeriod.end).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setSelectedWallet(wallet)}
                      >
                        View Associated Assets
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Wallet Assets</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {wallet.assets?.length ? (
                          wallet.assets.map((asset) => (
                            <Card key={asset.id}>
                              <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">{asset.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {asset.type}
                                    </p>
                                  </div>
                                  <Badge>{asset.percentage}% Ownership</Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <p className="text-center text-muted-foreground">
                            No assets associated with this wallet
                          </p>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
