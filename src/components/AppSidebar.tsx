import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  Users,
  UserCheck,
  Briefcase,
  CreditCard,
  BookOpen,
  Calendar,
  Settings,
  Shield,
  FileText,
  Brain,
  Building2,
  HardHat,
  Receipt,
  LucideIcon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  module: string | null; // null = always visible for authenticated users
}

// Define navigation with module mapping for permission checks
const navigation: NavItem[] = [
  { title: "Tableau de bord", url: "/admin", icon: BarChart3, module: "dashboard" },
  { title: "Clients", url: "/admin/clients", icon: Building2, module: "clients" },
  { title: "Personnel", url: "/admin/personnel", icon: HardHat, module: "personnel" },
  { title: "CTT", url: "/admin/contracts", icon: FileText, module: "contracts" },
  { title: "Facturation", url: "/admin/invoices", icon: Receipt, module: "invoices" },
  { title: "Recrutement", url: "/admin/recruitment", icon: Users, module: "recruitment" },
  { title: "Candidatures", url: "/admin/candidates", icon: UserCheck, module: "candidates" },
  { title: "Missions & Contrats", url: "/admin/missions", icon: Briefcase, module: "missions" },
  { title: "Paie", url: "/admin/payroll", icon: CreditCard, module: "payroll" },
  { title: "Formations", url: "/admin/training", icon: BookOpen, module: "training" },
  { title: "Planning", url: "/admin/planning", icon: Calendar, module: "planning" },
  { title: "Rapports & Export", url: "/admin/reports", icon: FileText, module: "reports" },
  { title: "Utilisateurs", url: "/admin/users", icon: Users, module: "users" },
  { title: "Permissions", url: "/admin/permissions", icon: Shield, module: "permissions" },
  { title: "Paramètres", url: "/admin/settings", icon: Settings, module: "settings" },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const { isSuperAdmin } = useAuth();
  const { canView, isLoading } = usePermissions();

  const isActive = (path: string) => {
    return location.pathname === path || (path !== "/admin" && location.pathname.startsWith(path));
  };

  // Filter navigation items based on permissions
  const filteredNavigation = navigation.filter((item) => {
    // Super admin always sees everything
    if (isSuperAdmin) return true;
    // If loading permissions, hide items temporarily
    if (isLoading) return false;
    // Check view permission for the module
    return item.module ? canView(item.module) : true;
  });

  return (
    <Sidebar className={open ? "w-64" : "w-16"} collapsible="icon">
      <SidebarContent>
        {/* Logo Section */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            {open && (
              <div>
                <h1 className="font-bold text-lg text-foreground">BrainCRM</h1>
                <p className="text-xs text-muted-foreground">Gestion RH</p>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavigation.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    className={
                      isActive(item.url)
                        ? "bg-primary/10 text-primary font-medium border-r-2 border-primary"
                        : "hover:bg-muted"
                    }
                  >
                    <NavLink to={item.url} end={item.url === "/admin"}>
                      <item.icon className="w-4 h-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
