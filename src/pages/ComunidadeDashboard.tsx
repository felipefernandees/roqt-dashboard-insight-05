import { useEffect, useState } from "react";
import { Users, UserX, TrendingUp, RotateCw, AlertCircle } from "lucide-react";
import { KPICard } from "@/components/KPICard";
import { ChartCard } from "@/components/ChartCard";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function ComunidadeDashboard() {
  const [isReloading, setIsReloading] = useState(false);
  const { data, error, fetchDashboardData } = useDashboardData();
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const [kpiData, setKpiData] = useState({
    activeMembers: 0,
    renewedMembers: 0,
    expiredMembers: 0,
    renewalRate: 0,
    peopleToRenew: 0,
    newSubscriptions: 0,
    percentages: {
      activeMembers: "",
      renewedMembers: "",
      expiredMembers: "",
      renewalRate: "",
      peopleToRenew: "",
      newSubscriptions: ""
    }
  });

  const [monthlyMembersData, setMonthlyMembersData] = useState([]);
  const [activeMembersByMonth, setActiveMembersByMonth] = useState([]);
  const [expiredMembersByMonth, setExpiredMembersByMonth] = useState([]);
  const [renewedMembersByMonth, setRenewedMembersByMonth] = useState([]);

  // Fetch data only once on mount if not already loaded
  useEffect(() => {
    if (!data.comunidade && !hasAttemptedFetch && !error) {
      setHasAttemptedFetch(true);
      fetchDashboardData('comunidade');
    }
  }, [data.comunidade, fetchDashboardData, hasAttemptedFetch, error]);

  // Update local state when cache data changes
  useEffect(() => {
    if (data.comunidade) {
      const comunidadeData = data.comunidade;
      setKpiData({
        activeMembers: comunidadeData.activeMembers || 0,
        renewedMembers: comunidadeData.renewedMembers || 0,
        expiredMembers: comunidadeData.expiredMembers || 0,
        renewalRate: comunidadeData.renewalRate || 0,
        peopleToRenew: comunidadeData.peopleToRenew || 0,
        newSubscriptions: comunidadeData.newSubscriptions || 0,
        percentages: {
          activeMembers: comunidadeData.percentages?.activeMembers || "",
          renewedMembers: comunidadeData.percentages?.renewedMembers || "",
          expiredMembers: comunidadeData.percentages?.expiredMembers || "",
          renewalRate: comunidadeData.percentages?.renewalRate || "",
          peopleToRenew: comunidadeData.percentages?.peopleToRenew || "",
          newSubscriptions: comunidadeData.percentages?.newSubscriptions || ""
        }
      });
      setMonthlyMembersData(comunidadeData.newSubscriptionsByMonth || []);
      setActiveMembersByMonth(comunidadeData.activeMembersByMonth || []);
      setExpiredMembersByMonth(comunidadeData.expiredMembersByMonth || []);
      setRenewedMembersByMonth(comunidadeData.renewedMembersByMonth || []);
    }
  }, [data.comunidade]);

  const handleReload = async () => {
    setIsReloading(true);
    setHasAttemptedFetch(true);
    await fetchDashboardData('comunidade', true);
    setTimeout(() => setIsReloading(false), 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard Comunidade</h1>
          <p className="text-muted-foreground">Métricas de membros e estimativas de renovação</p>
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
            <span>{error}</span>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard
          title="Membros Ativos"
          value={kpiData.activeMembers}
          change={kpiData.percentages.activeMembers || undefined}
          changeType="positive"
          icon={Users}
          color="success"
        />
        <KPICard
          title="Membros Renovados"
          value={kpiData.renewedMembers}
          change={kpiData.percentages.renewedMembers || undefined}
          changeType="positive"
          icon={Users}
          color="success"
        />
        <KPICard
          title="Membros Expirados"
          value={kpiData.expiredMembers}
          change={kpiData.percentages.expiredMembers || undefined}
          changeType="negative"
          icon={UserX}
          color="danger"
        />
        <KPICard
          title="Taxa de Renovação"
          value={`${kpiData.renewalRate}%`}
          change={kpiData.percentages.renewalRate || undefined}
          changeType="positive"
          icon={TrendingUp}
          color="primary"
        />
        <KPICard
          title="Pessoas para renovar esse mês"
          value={kpiData.peopleToRenew}
          change={kpiData.percentages.peopleToRenew || undefined}
          changeType="positive"
          icon={RotateCw}
          color="warning"
        />
        <KPICard
          title="Novas Assinaturas"
          value={kpiData.newSubscriptions}
          change={kpiData.percentages.newSubscriptions || undefined}
          changeType="positive"
          icon={TrendingUp}
          color="success"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Novas assinaturas por mês"
          type="coloredSingleBar"
          data={monthlyMembersData}
          dataKey="value"
          xAxisKey="name"
          height={350}
        />
        <ChartCard
          title="Membros ativos por mês"
          type="coloredSingleLine"
          data={activeMembersByMonth}
          dataKey="value"
          xAxisKey="name"
          height={350}
        />
        <ChartCard
          title="Membros renovados por mês"
          type="coloredSingleLine2"
          data={renewedMembersByMonth}
          dataKey="value"
          xAxisKey="name"
          height={350}
        />
        <ChartCard
          title="Membros expirados por mês"
          type="coloredSingleBar2"
          data={expiredMembersByMonth}
          dataKey="value"
          xAxisKey="name"
          height={350}
        />
      </div>
    </div>
  );
}