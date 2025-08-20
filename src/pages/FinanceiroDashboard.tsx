
import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, TrendingDown, Wallet, RotateCw, AlertCircle } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { ChartCard } from "@/components/ChartCard";
import { TimelineFilter, type FilterType } from "@/components/TimelineFilter";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDashboardData } from "@/hooks/useDashboardData";

// Helper function to convert string values to numbers and handle null/empty values
const parseValue = (value: any): number => {
  if (value === null || value === undefined || value === "" || value === "null") {
    return 0;
  }
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  if (typeof value === "number") {
    return isNaN(value) ? 0 : value;
  }
  return 0;
};

// Data structure based on webhook response
interface FinanceData {
  resumo: {
    receita_total: number;
    receita_liquida: number;
    gastos_totais: number;
    balanco_final: number;
    comparativo_mes: {
      receita_total: string;
      receita_liquida: string;
      gastos_totais: string;
      balanco_final: string;
    };
  };
  despesas_por_categoria: Array<{
    categoria: string;
    valor: number;
  }>;
  balanco_semanal: Array<{
    semana: string;
    receita: number;
    despesa: number;
  }>;
  linha_do_tempo: Array<{
    mes: string;
    receita: number;
    despesa: number;
    lucro: number;
  }>;
}

// Initial data with zeros
const initialData: FinanceData = {
  resumo: {
    receita_total: 0,
    receita_liquida: 0,
    gastos_totais: 0,
    balanco_final: 0,
    comparativo_mes: {
      receita_total: "",
      receita_liquida: "",
      gastos_totais: "",
      balanco_final: ""
    }
  },
  despesas_por_categoria: [],
  balanco_semanal: [],
  linha_do_tempo: []
};

export default function FinanceiroDashboard() {
  const [isReloading, setIsReloading] = useState(false);
  const { data, error, fetchDashboardData } = useDashboardData();
  const [hasInitialized, setHasInitialized] = useState(false);
  const [financeData, setFinanceData] = useState<FinanceData>(initialData);
  const [timelineFilter, setTimelineFilter] = useState<FilterType>("lucro");

  // Only fetch data once on mount if not already loaded and no error
  useEffect(() => {
    if (!hasInitialized && !data.financeiro && !error) {
      console.log('FinanceiroDashboard: Initializing fetch...');
      setHasInitialized(true);
      fetchDashboardData('financeiro');
    }
  }, [hasInitialized, data.financeiro, fetchDashboardData, error]);

  // Update local state when cache data changes
  useEffect(() => {
    if (data.financeiro) {
      console.log('FinanceiroDashboard: Updating with fetched data');
      const financeiroData = data.financeiro;
      
      // Transform the response to match our expected format using parseValue helper
      const transformedData: FinanceData = {
        resumo: {
          receita_total: parseValue(financeiroData.resumo?.receita_total || financeiroData.totalRevenue || financeiroData.receita_total),
          receita_liquida: parseValue(financeiroData.resumo?.receita_liquida || financeiroData.totalNetRevenue || financeiroData.receita_liquida),
          gastos_totais: parseValue(financeiroData.resumo?.gastos_totais || financeiroData.totalExpenses || financeiroData.gastos_totais),
          balanco_final: parseValue(financeiroData.resumo?.balanco_final || financeiroData.netBalance || financeiroData.balanco_final),
          comparativo_mes: financeiroData.resumo?.comparativo_mes || financeiroData.comparativo_mes || {
            receita_total: "",
            receita_liquida: "",
            gastos_totais: "",
            balanco_final: ""
          }
        },
        despesas_por_categoria: financeiroData.despesas_por_categoria?.map((item: any) => ({
          categoria: item.categoria || item.name || "Categoria",
          valor: parseValue(item.valor || item.value)
        })) || financeiroData.expensesCategory?.map((item: any) => ({
          categoria: item.name || item.categoria || "Categoria",
          valor: parseValue(item.value || item.valor)
        })) || [],
        balanco_semanal: financeiroData.balanco_semanal?.map((item: any) => ({
          semana: item.semana || item.name || "Semana",
          receita: parseValue(item.receita),
          despesa: parseValue(item.despesa || item.despesas)
        })) || financeiroData.weeklyRevenueExpenses?.map((item: any) => ({
          semana: item.name || item.semana || "Semana",
          receita: parseValue(item.receita),
          despesa: parseValue(item.despesas || item.despesa)
        })) || [],
        linha_do_tempo: financeiroData.linha_do_tempo?.map((item: any) => ({
          mes: item.mes || item.name || "Mês",
          receita: parseValue(item.receita),
          despesa: parseValue(item.despesa || item.despesas),
          lucro: parseValue(item.lucro)
        })) || []
      };
      
      setFinanceData(transformedData);
    }
  }, [data.financeiro]);

  const handleReload = async () => {
    console.log('FinanceiroDashboard: Manual reload requested');
    setIsReloading(true);
    await fetchDashboardData('financeiro', true);
    setTimeout(() => setIsReloading(false), 1000);
  };

  // Helper function to determine change type
  const getChangeType = (change: string): "positive" | "negative" | "neutral" => {
    if (change.startsWith('+')) return "positive";
    if (change.startsWith('-')) return "negative";
    return "neutral";
  };

  // Filter timeline data based on selected filter
  const getFilteredTimelineData = () => {
    switch (timelineFilter) {
      case "faturamento":
        return financeData.linha_do_tempo.map(item => ({
          mes: item.mes,
          receita: item.receita
        }));
      case "despesas":
        return financeData.linha_do_tempo.map(item => ({
          mes: item.mes,
          despesa: item.despesa
        }));
      case "lucro":
      default:
        return financeData.linha_do_tempo.map(item => ({
          mes: item.mes,
          lucro: item.lucro
        }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Financeiro</h1>
          <p className="text-muted-foreground">Receitas, gastos e balanço financeiro</p>
        </div>
        <Button 
          onClick={handleReload}
          variant="outline"
          size="sm"
          disabled={isReloading}
          className="hover:bg-white/[0.05]"
        >
          <RotateCw className={`h-4 w-4 ${isReloading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Falha ao recolher informações financeiras. Mostrando valores padrão.</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleReload()}
              className="ml-4 hover:bg-white/[0.06]"
            >
              Tentar Novamente
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Receita Total"
          value={`R$ ${financeData.resumo.receita_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          change={financeData.resumo.comparativo_mes.receita_total || undefined}
          changeType={getChangeType(financeData.resumo.comparativo_mes.receita_total)}
          icon={DollarSign}
          color="primary"
        />
        <KPICard
          title="Receita Líquida"
          value={`R$ ${financeData.resumo.receita_liquida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          change={financeData.resumo.comparativo_mes.receita_liquida || undefined}
          changeType={getChangeType(financeData.resumo.comparativo_mes.receita_liquida)}
          icon={TrendingUp}
          color="success"
        />
        <KPICard
          title="Total de Gastos"
          value={`R$ ${financeData.resumo.gastos_totais.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          change={financeData.resumo.comparativo_mes.gastos_totais || undefined}
          changeType={getChangeType(financeData.resumo.comparativo_mes.gastos_totais)}
          icon={TrendingDown}
          color="danger"
        />
        <KPICard
          title="Balanço Final"
          value={`R$ ${financeData.resumo.balanco_final.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          change={financeData.resumo.comparativo_mes.balanco_final || undefined}
          changeType={getChangeType(financeData.resumo.comparativo_mes.balanco_final)}
          icon={Wallet}
          color="primary"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Despesas por Categoria"
          type="bar"
          data={financeData.despesas_por_categoria.map(item => ({ name: item.categoria, value: item.valor }))}
          dataKey="value"
          xAxisKey="name"
          height={350}
        />
        <ChartCard
          title="Balanço Semanal"
          type="stackedBar"
          data={financeData.balanco_semanal.map(item => ({ name: item.semana, receita: item.receita, despesa: item.despesa }))}
          dataKey="receita"
          secondaryDataKey="despesa"
          xAxisKey="name"
          height={350}
        />
      </div>

      {/* Timeline Chart with Filter */}
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Linha do Tempo Financeira</h3>
            <TimelineFilter 
              activeFilter={timelineFilter} 
              onFilterChange={setTimelineFilter} 
            />
          </div>
          <ChartCard
            title=""
            type="line"
            data={getFilteredTimelineData()}
            dataKey={timelineFilter === "despesas" ? "despesa" : timelineFilter === "faturamento" ? "receita" : "lucro"}
            xAxisKey="mes"
            height={350}
          />
        </div>
      </div>
    </div>
  );
}
