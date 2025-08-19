
import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, ShoppingCart, RotateCw, Target, AlertCircle } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { ChartCard } from "@/components/ChartCard";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function ProdutosDashboard() {
  const [isReloading, setIsReloading] = useState(false);
  const { data, error, fetchDashboardData } = useDashboardData();
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // Default state with zero values
  const [kpiDataState, setKpiData] = useState({
    totalSales: 0,
    totalNetRevenue: 0,
    averageTicket: 0,
    percentages: {
      totalSales: "",
      totalNetRevenue: "",
      averageTicket: ""
    }
  });
  const [renewalEstimate, setRenewalEstimate] = useState({
    value: 0,
    percentage: ""
  });
  const [salesPerProductDataState, setSalesPerProductData] = useState([]);
  const [monthlySalesDataState, setMonthlySalesData] = useState([]);
  const [salesCountDataState, setSalesCountData] = useState([]);
  const [monthlyAverageTicketDataState, setMonthlyAverageTicketData] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("todos");
  const [availableProducts, setAvailableProducts] = useState<string[]>([]);

  // Only fetch data once on mount if not already loaded and no error
  useEffect(() => {
    if (!hasInitialized && !data.produtos && !error) {
      console.log('ProdutosDashboard: Initializing fetch...');
      setHasInitialized(true);
      fetchDashboardData('produtos');
    }
  }, [hasInitialized, data.produtos, fetchDashboardData, error]);

  // Update local state when cache data changes
  useEffect(() => {
    if (data.produtos) {
      console.log('ProdutosDashboard: Updating with fetched data');
      const produtosData = data.produtos;
      setKpiData({
        totalSales: produtosData.totalSales || 0,
        totalNetRevenue: produtosData.totalNetRevenue || 0,
        averageTicket: produtosData.averageTicket || 0,
        percentages: {
          totalSales: produtosData.percentages?.totalSales || "",
          totalNetRevenue: produtosData.percentages?.totalNetRevenue || "",
          averageTicket: produtosData.percentages?.averageTicket || ""
        }
      });
      setSalesPerProductData(produtosData.salesPerProduct || []);
      setMonthlySalesData(produtosData.monthlySales || []);
      setSalesCountData(produtosData.salesCount || []);
      setMonthlyAverageTicketData(produtosData.monthlyAverageTicket || []);
      
      // Extract available products from monthly sales data
      if (produtosData.monthlySales && produtosData.monthlySales.length > 0) {
        const products = Object.keys(produtosData.monthlySales[0]).filter(key => 
          key !== 'name' && key !== 'total' && key !== 'liquido'
        );
        setAvailableProducts(products);
      }
      
      // Set renewal estimate from produtos or comunidade data
      const renewalData = data.comunidade || data.produtos;
      setRenewalEstimate({
        value: renewalData?.renewalEstimate || renewalData?.estimativa_renovacao || 0,
        percentage: renewalData?.percentages?.renewalEstimate || renewalData?.percentages?.estimativa_renovacao || ""
      });
    }
  }, [data.produtos, data.comunidade]);

  const handleReload = async () => {
    console.log('ProdutosDashboard: Manual reload requested');
    setIsReloading(true);
    await fetchDashboardData('produtos', true);
    setTimeout(() => setIsReloading(false), 1000);
  };

  // Filter monthly sales data based on selected product
  const getFilteredMonthlySalesData = () => {
    if (selectedProduct === "todos") {
      return monthlySalesDataState;
    }
    
    // Filter to show only the selected product and total
    return monthlySalesDataState.map(item => ({
      name: item.name,
      total: item.total,
      liquido: item.liquido,
      [selectedProduct]: item[selectedProduct] || 0
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Produtos</h1>
          <p className="text-muted-foreground">Vendas e receita</p>
        </div>
        <Button 
          onClick={handleReload}
          variant="outline"
          size="sm"
          disabled={isReloading}
          className="hover:bg-white/[0.06]"
        >
          <RotateCw className={`h-4 w-4 ${isReloading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Falha ao recolher informações dos produtos. Mostrando valores padrão.</span>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard
          title="Total Faturamento"
          value={`R$ ${kpiDataState.totalSales.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          change={kpiDataState.percentages?.totalSales || undefined}
          changeType="positive"
          icon={DollarSign}
          color="success"
        />
        <KPICard
          title="Total Faturamento Líquido"
          value={`R$ ${kpiDataState.totalNetRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          change={kpiDataState.percentages?.totalNetRevenue || undefined}
          changeType="positive"
          icon={TrendingUp}
          color="primary"
        />
        <KPICard
          title="Ticket Médio"
          value={`R$ ${kpiDataState.averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          change={kpiDataState.percentages?.averageTicket || undefined}
          changeType="positive"
          icon={ShoppingCart}
          color="warning"
        />
        <KPICard
          title="Estimativa de Renovação"
          value={`R$ ${renewalEstimate.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          change={renewalEstimate.percentage || undefined}
          changeType="positive"
          icon={Target}
          color="success"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Vendas por Produto"
          type="singleBar"
          data={salesPerProductDataState}
          dataKey="grossValue"
          xAxisKey="name"
          height={350}
        />
        <ChartCard
          title="Quantidade de Vendas por Produto"
          type="coloredBar"
          data={salesCountDataState}
          dataKey="value"
          xAxisKey="name"
          height={350}
        />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Tendência de Vendas Mensais</h3>
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Selecionar produto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os produtos</SelectItem>
                {availableProducts.map((product) => (
                  <SelectItem key={product} value={product}>
                    {product}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ChartCard
            title=""
            type="multiLine"
            data={getFilteredMonthlySalesData()}
            dataKey="total"
            xAxisKey="name"
            height={350}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ChartCard
          title="Ticket Médio Mensal"
          type="multiLine"
          data={monthlyAverageTicketDataState}
          dataKey="value"
          xAxisKey="name"
          height={350}
        />
      </div>
    </div>
  );
}
