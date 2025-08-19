import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardProvider, useDashboardData } from "@/hooks/useDashboardData";
import { LoadingScreen } from "@/components/LoadingScreen";
import { LoginScreen } from "@/components/LoginScreen";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import ComunidadeDashboard from "./pages/ComunidadeDashboard";
import ProdutosDashboard from "./pages/ProdutosDashboard";
import FinanceiroDashboard from "./pages/FinanceiroDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { isLoading } = useDashboardData();
  const { isAuthenticated, login } = useAuth();

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={login} />;
  }
  
  return (
    <>
      {isLoading && <LoadingScreen />}
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<ComunidadeDashboard />} />
          <Route path="/produtos" element={<ProdutosDashboard />} />
          <Route path="/financeiro" element={<FinanceiroDashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </DashboardLayout>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <DashboardProvider>
            <AppContent />
          </DashboardProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
