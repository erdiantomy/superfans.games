import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";

import Landing       from "@/pages/Landing";
import SessionPage   from "@/pages/SessionPage";
import AdminPage     from "@/pages/AdminPage";
import HostDashboard from "@/pages/HostDashboard";
import RankPage      from "@/pages/RankPage";
import AuthScreen    from "@/pages/AuthScreen";
import Index         from "@/pages/Index";
import NotFound      from "@/pages/NotFound";

import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/"                element={<Landing />} />
            <Route path="/rank"            element={<RankPage />} />
            <Route path="/session/:code"   element={<SessionPage />} />
            <Route path="/match/:code"     element={<SessionPage />} />
            <Route path="/admin"           element={<AdminPage />} />
            <Route path="/host"            element={<HostDashboard />} />
            <Route path="/auth"            element={<AuthScreen />} />
            <Route path="/fanprize"        element={<Index />} />
            <Route path="*"               element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster richColors position="top-center" />
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
