import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Users, Package, DollarSign, Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useAuth } from "@/hooks/useAuth";
import logoImage from "/lovable-uploads/4e0b2a9a-1de9-4d20-9154-eda70d881eca.png";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  {
    title: "Comunidade",
    icon: Users,
    href: "/",
    description: "Métricas de membros"
  },
  {
    title: "Produtos",
    icon: Package,
    href: "/produtos",
    description: "Vendas e receita"
  },
  {
    title: "Financeiro",
    icon: DollarSign,
    href: "/financeiro",
    description: "Receitas e despesas"
  }
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const { fetchDashboardData } = useDashboardData();
  const { logout } = useAuth();

  // Load comunidade data on first visit
  useEffect(() => {
    fetchDashboardData('comunidade');
  }, []);

  // Load appropriate dashboard data when route changes
  useEffect(() => {
    const currentPath = location.pathname;
    
    if (currentPath === '/produtos') {
      fetchDashboardData('produtos');
    } else if (currentPath === '/financeiro') {
      fetchDashboardData('financeiro');
    }
  }, [location.pathname, fetchDashboardData]);

  return (
    <div className="min-h-screen bg-background font-inter">
      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-40 h-screen transition-all duration-300 border-r border-border bg-card",
        isCollapsed ? "w-16" : "w-64"
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center border-b border-border px-4">
            <div className={cn(
              "flex items-center gap-3 transition-all duration-300",
              isCollapsed ? "justify-center w-full" : ""
            )}>
              <img 
                src={logoImage} 
                alt="MGTInc Logo" 
                className="h-8 w-8 rounded-md"
              />
              {!isCollapsed && (
                <div>
                  <h1 className="text-lg font-bold text-foreground">MGTInc</h1>
                  <p className="text-xs text-muted-foreground">Dashboard</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {menuItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 sidebar-item",
                  "hover:bg-white/[0.06] hover:text-foreground",
                  isActive 
                    ? "bg-accent text-accent-foreground" 
                    : "text-muted-foreground hover:text-foreground",
                  isCollapsed ? "justify-center" : ""
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 flex-shrink-0 transition-all duration-300",
                  isCollapsed ? "mx-auto" : ""
                )} />
                {!isCollapsed && (
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{item.title}</span>
                    <span className="text-xs opacity-75">{item.description}</span>
                  </div>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="border-t border-border p-4 space-y-2">
            <Button
              onClick={logout}
              variant="ghost"
              size="sm"
              className={cn(
                "w-full flex items-center gap-3 hover:bg-destructive/10 hover:text-destructive transition-all duration-200",
                isCollapsed ? "justify-center px-2" : "justify-start px-3"
              )}
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm">Sair</span>}
            </Button>
            
            {/* Collapse Toggle */}
            <Button
              onClick={() => setIsCollapsed(!isCollapsed)}
              variant="ghost"
              size="sm"
              className="w-full flex items-center justify-center hover:bg-white/[0.06] transition-all duration-200"
            >
              {isCollapsed ? (
                <Menu className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "transition-all duration-300 min-h-screen",
        isCollapsed ? "ml-16" : "ml-64"
      )}>
        <div className="p-6 space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}