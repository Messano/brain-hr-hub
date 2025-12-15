import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  description?: string;
  icon: LucideIcon | ReactNode;
  variant?: "default" | "success" | "warning" | "destructive";
}

export function KPICard({ title, value, change, description, icon, variant = "default" }: KPICardProps) {
  const variantStyles = {
    default: "border-border",
    success: "border-success bg-success/5",
    warning: "border-warning bg-warning/5",
    destructive: "border-destructive bg-destructive/5",
  };

  const iconStyles = {
    default: "text-primary",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
  };

  const renderIcon = () => {
    // If it's already a rendered React element, just apply styling wrapper
    if (React.isValidElement(icon)) {
      return <span className={cn("h-4 w-4", iconStyles[variant])}>{icon}</span>;
    }
    // If it's a Lucide icon component (function or ForwardRef)
    if (typeof icon === "function" || (typeof icon === "object" && icon !== null && "$$typeof" in icon)) {
      const Icon = icon as LucideIcon;
      return <Icon className={cn("h-4 w-4", iconStyles[variant])} />;
    }
    // Fallback
    return null;
  };

  return (
    <Card className={cn("transition-all hover:shadow-md", variantStyles[variant])}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {renderIcon()}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className="text-xs text-muted-foreground">
            {change}
          </p>
        )}
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}