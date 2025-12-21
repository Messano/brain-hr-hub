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
import { useAuth, AppRole } from "@/hooks/useAuth";

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
  allowedRoles: AppRole[];
}

// Define navigation with role-based access
// super_admin has access to everything (handled in filter logic)
const navigation: NavItem[] = [
  { title: "Tableau de bord", url: "/admin", icon: BarChart3, allowedRoles: ['super_admin', 'admin', 'manager', 'rh', 'user'] },
  { title: "Clients", url: "/admin/clients", icon: Building2, allowedRoles: ['super_admin', 'admin', 'manager'] },
  { title: "Personnel", url: "/admin/personnel", icon: HardHat, allowedRoles: ['super_admin', 'admin', 'manager', 'rh'] },
  { title: "CTT", url: "/admin/contracts", icon: FileText, allowedRoles: ['super_admin', 'admin', 'manager', 'rh'] },
  { title: "Facturation", url: "/admin/invoices", icon: Receipt, allowedRoles: ['super_admin', 'admin'] },
  { title: "Recrutement", url: "/admin/recruitment", icon: Users, allowedRoles: ['super_admin', 'admin', 'manager', 'rh'] },
  { title: "Candidatures", url: "/admin/candidates", icon: UserCheck, allowedRoles: ['super_admin', 'admin', 'manager', 'rh'] },
  { title: "Missions & Contrats", url: "/admin/missions", icon: Briefcase, allowedRoles: ['super_admin', 'admin', 'manager', 'rh'] },
  { title: "Paie", url: "/admin/payroll", icon: CreditCard, allowedRoles: ['super_admin', 'admin', 'rh'] },
  { title: "Formations", url: "/admin/training", icon: BookOpen, allowedRoles: ['super_admin', 'admin', 'manager', 'rh'] },
  { title: "Planning", url: "/admin/planning", icon: Calendar, allowedRoles: ['super_admin', 'admin', 'manager', 'rh', 'user'] },
  { title: "Utilisateurs", url: "/admin/users", icon: Users, allowedRoles: ['super_admin', 'admin'] },
  { title: "Rapports & Export", url: "/admin/reports", icon: FileText, allowedRoles: ['super_admin', 'admin', 'manager', 'rh'] },
  { title: "Utilisateurs", url: "/admin/users", icon: Users, allowedRoles: ['super_admin', 'admin'] },
  { title: "Permissions", url: "/admin/permissions", icon: Shield, allowedRoles: ['super_admin', 'admin'] },
  { title: "Paramètres", url: "/admin/settings", icon: Settings, allowedRoles: ['super_admin', 'admin'] },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const { role, isSuperAdmin } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path || (path !== "/admin" && location.pathname.startsWith(path));
  };

  // Filter navigation items based on user role
  const filteredNavigation = navigation.filter((item) => {
    // Super admin always sees everything
    if (isSuperAdmin) return true;
    // Check if user's role is in the allowed roles
    return role && item.allowedRoles.includes(role);
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
