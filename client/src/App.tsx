import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Equipment from "@/pages/equipment";
import MyBookings from "@/pages/my-bookings";
import AppHeader from "@/components/app-header";
import TabNavigation from "@/components/tab-navigation";
import { useState } from "react";

function Router() {
  // This state tracks which tab is currently active
  const [activeTab, setActiveTab] = useState<"equipment" | "myBookings">("equipment");

  return (
    <div>
      <AppHeader />
      
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Switch>
          <Route path="/">
            {activeTab === "equipment" ? <Equipment /> : <MyBookings />}
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>
      
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}

export default App;
