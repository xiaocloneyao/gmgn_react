import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CopyTrade from "./pages/CopyTrade";
import Rank from "./pages/Rank";
import Trending from "./pages/Trending";
import TrenchDetail from "./pages/TrenchDetail";
import Monitor from "./pages/Monitor";
import MonitorDetail from "./pages/MonitorDetail";
import Track from "./pages/Track";
import Portfolio from "./pages/Portfolio";
import RankDetail from "./pages/RankDetail";
import CopyTradeDetail from "./pages/CopyTradeDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <HashRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/rank" element={<Rank />} />
          <Route path="/rank/:address" element={<RankDetail />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/copytrade" element={<CopyTrade />} />
          <Route path="/copytrade/:id" element={<CopyTradeDetail />} />
          <Route path="/trenches/:name" element={<TrenchDetail />} />
          <Route path="/monitor" element={<Monitor />} />
          <Route path="/monitor/detail" element={<MonitorDetail />} />
          <Route path="/track" element={<Track />} />
          <Route path="/portfolio" element={<Portfolio />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
