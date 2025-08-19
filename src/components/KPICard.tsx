import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  color?: "success" | "warning" | "danger" | "primary";
}

export function KPICard({ 
  title, 
  value, 
  change, 
  changeType = "neutral", 
  icon: Icon,
  color = "primary" 
}: KPICardProps) {
  const colorClasses = {
    success: "text-success border-success/20 bg-success/5",
    warning: "text-warning border-warning/20 bg-warning/5",
    danger: "text-danger border-danger/20 bg-danger/5",
    primary: "text-primary border-primary/20 bg-primary/5"
  };

  // Automatically determine color based on + or - prefix
  const getChangeColor = (changeText: string) => {
    if (changeText.startsWith('+')) return "text-success";
    if (changeText.startsWith('-')) return "text-danger";
    return "text-muted-foreground";
  };

  return (
    <Card className="hover-overlay cursor-pointer group transition-all duration-200 hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {title}
            </p>
            <p className="text-3xl font-bold text-foreground mb-1">
              {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
            </p>
            {change && (
              <p className={cn("text-sm font-medium", getChangeColor(change))}>
                {change}
              </p>
            )}
          </div>
          <div className={cn(
            "h-12 w-12 rounded-lg border flex items-center justify-center transition-all duration-200 group-hover:scale-110",
            colorClasses[color]
          )}>
            <Icon className="h-6 w-6 transition-transform duration-200" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}