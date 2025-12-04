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
  FileText,
  Brain,
  Building2,
} from "lucide-react";

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

const navigation = [
  { title: "Tableau de bord", url: "/admin", icon: BarChart3 },
  { title: "Clients", url: "/admin/clients", icon: Building2 },
  { title: "Recrutement", url: "/admin/recruitment", icon: Users },
  { title: "Candidatures", url: "/admin/candidates", icon: UserCheck },
  { title: "Missions & Contrats", url: "/admin/missions", icon: Briefcase },
  { title: "Paie", url: "/admin/payroll", icon: CreditCard },
  { title: "Formations", url: "/admin/training", icon: BookOpen },
  { title: "Planning", url: "/admin/planning", icon: Calendar },
  { title: "Utilisateurs", url: "/admin/users", icon: Users },
  { title: "Rapports & Export", url: "/admin/reports", icon: FileText },
  { title: "Paramètres", url: "/admin/settings", icon: Settings },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path || (path !== "/admin" && location.pathname.startsWith(path));
  };

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
              {navigation.map((item) => (
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