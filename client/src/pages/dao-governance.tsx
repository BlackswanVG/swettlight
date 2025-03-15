import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getDAOTokenBalance } from "@/lib/web3";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wallet } from "lucide-react";

export default function DAOGovernancePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchBalance() {
      if (!user?.walletAddress) {
        return;
      }

      try {
        setIsLoading(true);
        const balance = await getDAOTokenBalance(user.walletAddress);
        setTokenBalance(balance);
      } catch (error) {
        console.error('Failed to fetch token balance:', error);
        toast({
          title: "Failed to fetch token balance",
          description: "Please ensure your wallet is connected and you're on the correct network",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchBalance();
  }, [user?.walletAddress, toast]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">DAO Governance</h1>
        <p className="text-muted-foreground">
          Participate in the Marine DAO governance process and shape the future of maritime investments
        </p>
      </div>

      <div className="mt-8 grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your DAO Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!user?.walletAddress ? (
              <div className="text-center py-4">
                <Wallet className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Please connect your wallet to view your DAO status
                </p>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-sm font-medium">Connected Wallet</p>
                  <p className="text-xl font-mono">
                    {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">MDT Balance</p>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading balance...</span>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold">{tokenBalance || '0'} MDT</p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">Voting Power</p>
                  <p className="text-2xl font-bold">
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Calculating...</span>
                      </div>
                    ) : (
                      `${tokenBalance || '0'}%`
                    )}
                  </p>
                </div>
              </>
            )}
            {!user?.isKYCVerified && (
              <div className="mt-4">
                <Badge variant="destructive">KYC Required</Badge>
                <p className="mt-2 text-sm text-muted-foreground">
                  Complete KYC verification to participate in DAO governance
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Proposals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">No active proposals at the moment</p>
              {user?.isKYCVerified && (
                <Button className="mt-4">Create Proposal</Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}