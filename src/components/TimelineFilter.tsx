import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type FilterType = "lucro" | "faturamento" | "despesas";

interface TimelineFilterProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export function TimelineFilter({ activeFilter, onFilterChange }: TimelineFilterProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-sm text-muted-foreground mr-2">Filtrar por:</span>
      <div className="flex rounded-lg border border-border bg-muted/20 p-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFilterChange("lucro")}
          className={cn(
            "h-8 px-3 text-xs transition-all duration-200",
            activeFilter === "lucro"
              ? "bg-muted text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-white/[0.05]"
          )}
        >
          Lucro
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFilterChange("faturamento")}
          className={cn(
            "h-8 px-3 text-xs transition-all duration-200",
            activeFilter === "faturamento"
              ? "bg-muted text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-white/[0.05]"
          )}
        >
          Faturamento
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFilterChange("despesas")}
          className={cn(
            "h-8 px-3 text-xs transition-all duration-200",
            activeFilter === "despesas"
              ? "bg-muted text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-white/[0.05]"
          )}
        >
          Despesas
        </Button>
      </div>
    </div>
  );
}