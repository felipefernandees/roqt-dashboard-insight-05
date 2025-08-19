import { RotateCw } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center space-y-4">
        <RotateCw className="h-12 w-12 text-primary animate-spin" />
        <p className="text-lg font-medium text-foreground">Carregando informações...</p>
      </div>
    </div>
  );
}