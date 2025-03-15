import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { queryClient } from "./lib/queryClient";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import CreateListing from "@/pages/create-listing";
import DAOGovernance from "@/pages/dao-governance";
import MaritimeNews from "@/pages/maritime-news";
import WalletManagement from "@/pages/wallet-management";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "./lib/protected-route";
import Navbar from "./components/layout/navbar";

function Router() {
  return (
    <>
      <Navbar />
      <Switch>
        <ProtectedRoute path="/" component={HomePage} />
        <ProtectedRoute path="/dao" component={DAOGovernance} />
        <ProtectedRoute path="/news" component={MaritimeNews} />
        <ProtectedRoute path="/wallets" component={WalletManagement} />
        <ProtectedRoute path="/create-listing" component={CreateListing} />
        <Route path="/auth" component={AuthPage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;