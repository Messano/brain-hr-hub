import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  variant?: "default" | "success" | "warning" | "destructive";
}

export function KPICard({ title, value, change, icon: Icon, variant = "default" }: KPICardProps) {
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

  return (
    <Card className={cn("transition-all hover:shadow-md", variantStyles[variant])}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={cn("h-4 w-4", iconStyles[variant])} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className="text-xs text-muted-foreground">
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}