import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layouts/AppLayout";
import Home from "./pages/Home";
import PublicJobOffers from "./pages/PublicJobOffers";
import JobOfferDetail from "./pages/JobOfferDetail";
import Dashboard from "./pages/Dashboard";
import Recruitment from "./pages/Recruitment";
import NewJobOffer from "./pages/NewJobOffer";
import Candidates from "./pages/Candidates";
import Missions from "./pages/Missions";
import Payroll from "./pages/Payroll";
import Training from "./pages/Training";
import Planning from "./pages/Planning";
import Users from "./pages/Users";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Clients from "./pages/Clients";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/offres" element={<PublicJobOffers />} />
          <Route path="/offres/:id" element={<JobOfferDetail />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="recruitment" element={<Recruitment />} />
            <Route path="recruitment/new" element={<NewJobOffer />} />
            <Route path="candidates" element={<Candidates />} />
            <Route path="missions" element={<Missions />} />
            <Route path="payroll" element={<Payroll />} />
            <Route path="training" element={<Training />} />
            <Route path="planning" element={<Planning />} />
            <Route path="users" element={<Users />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="clients" element={<Clients />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
