import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))"
];

interface ChartCardProps {
  title: string;
  type: "bar" | "pie" | "line" | "stackedBar" | "multiLine" | "singleBar" | "coloredBar" | "coloredSingleBar" | "coloredSingleLine" | "coloredSingleBar2" | "coloredSingleLine2";
  data: any[];
  dataKey?: string;
  secondaryDataKey?: string;
  xAxisKey?: string;
  height?: number;
}

const CustomTooltip = ({ active, payload, label, data }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-card p-3 shadow-lg backdrop-blur-sm">
        <p className="text-sm font-medium text-foreground mb-1">{label}</p>
        {payload.map((entry: any, index: number) => {
          // For single bar charts, show net value in tooltip
          if (entry.dataKey === 'grossValue' && data) {
            const item = data.find((d: any) => d.name === label);
            return (
              <div key={index}>
                <p className="text-sm font-medium" style={{ color: entry.color }}>
                  Bruto: R$ {typeof entry.value === 'number' ? entry.value.toLocaleString('pt-BR') : entry.value}
                </p>
                {item?.netValue && (
                  <p className="text-sm font-medium text-muted-foreground">
                    Líquido: R$ {item.netValue.toLocaleString('pt-BR')}
                  </p>
                )}
              </div>
            );
          }
          
          // For monthly sales, show both total (bruto) and liquido when available
          if (entry.dataKey === 'total' && data) {
            const item = data.find((d: any) => d.name === label);
            return (
              <div key={index}>
                <p className="text-sm font-medium" style={{ color: entry.color }}>
                  Bruto: R$ {typeof entry.value === 'number' ? entry.value.toLocaleString('pt-BR') : entry.value}
                </p>
                {item?.liquido && (
                  <p className="text-sm font-medium text-muted-foreground">
                    Líquido: R$ {item.liquido.toLocaleString('pt-BR')}
                  </p>
                )}
              </div>
            );
          }
          
          return (
            <p key={index} className="text-sm font-medium" style={{ color: entry.color }}>
              {entry.name || entry.dataKey}: {typeof entry.value === 'number' ? entry.value.toLocaleString('pt-BR') : entry.value}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

export function ChartCard({ 
  title, 
  type, 
  data, 
  dataKey = "value", 
  secondaryDataKey,
  xAxisKey = "name",
  height = 300 
}: ChartCardProps) {
  
  // Helper function to get color based on data key
  const getLineColor = (key: string) => {
    if (key.includes('receita') || key.includes('faturamento')) {
      return "hsl(var(--success))"; // Verde para receita
    }
    if (key.includes('despesa') || key.includes('despesas')) {
      return "hsl(var(--destructive))"; // Vermelho para despesas
    }
    if (key.includes('lucro')) {
      return "hsl(var(--chart-1))"; // Teal para lucro
    }
    return "hsl(var(--chart-1))"; // Default
  };

  const getBarColor = (key: string) => {
    if (key.includes('receita') || key.includes('faturamento')) {
      return "hsl(var(--success))"; // Verde para receita
    }
    if (key.includes('despesa') || key.includes('despesas')) {
      return "hsl(var(--destructive))"; // Vermelho para despesas
    }
    return "hsl(var(--chart-1))"; // Default
  };
  const renderChart = () => {
    switch (type) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey={xAxisKey} 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey={dataKey} 
                fill="hsl(var(--chart-1))"
                radius={[4, 4, 0, 0]}
                className="transition-all duration-200 hover:opacity-80 cursor-pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case "singleBar":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey={xAxisKey} 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip data={data} />} />
              <Bar 
                dataKey={dataKey} 
                radius={[4, 4, 0, 0]}
                className="transition-all duration-200 hover:opacity-80 cursor-pointer"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case "coloredBar":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey={xAxisKey} 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey={dataKey} 
                radius={[4, 4, 0, 0]}
                className="transition-all duration-200 hover:opacity-80 cursor-pointer"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey={dataKey}
              >
                {data.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={CHART_COLORS[index % CHART_COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey={xAxisKey} 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke={getLineColor(dataKey)}
                strokeWidth={3}
                dot={{ fill: getLineColor(dataKey), strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: getLineColor(dataKey) }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "multiLine":
        const productLines = data.length > 0 ? Object.keys(data[0]).filter(key => key !== 'name' && key !== 'total' && key !== 'liquido') : [];
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey={xAxisKey} 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip data={data} />} />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="hsl(var(--primary))"
                strokeWidth={4}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, fill: "hsl(var(--primary))" }}
              />
              {productLines.map((product, index) => (
                <Line 
                  key={product}
                  type="monotone" 
                  dataKey={product} 
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS[index % CHART_COLORS.length], strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 5, fill: CHART_COLORS[index % CHART_COLORS.length] }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case "stackedBar":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey={xAxisKey} 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey={dataKey} 
                fill={getBarColor(dataKey)}
                radius={[0, 0, 0, 0]}
                className="transition-all duration-200 hover:opacity-80 cursor-pointer"
              />
              {secondaryDataKey && (
                <Bar 
                  dataKey={secondaryDataKey} 
                  fill={getBarColor(secondaryDataKey)}
                  radius={[4, 4, 0, 0]}
                  className="transition-all duration-200 hover:opacity-80 cursor-pointer"
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        );

      case "coloredSingleBar":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey={xAxisKey} 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey={dataKey} 
                fill="hsl(var(--chart-1))"
                radius={[4, 4, 0, 0]}
                className="transition-all duration-200 hover:opacity-80 cursor-pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case "coloredSingleBar2":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey={xAxisKey} 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip data={data} />} />
              <Bar 
                dataKey={dataKey} 
                fill="hsl(var(--destructive))"
                radius={[4, 4, 0, 0]}
                className="transition-all duration-200 hover:opacity-80 cursor-pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case "coloredSingleLine":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey={xAxisKey} 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip data={data} />} />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke="hsl(var(--success))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--success))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "hsl(var(--success))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "coloredSingleLine2":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey={xAxisKey} 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip data={data} />} />
              <Line 
                type="monotone" 
                dataKey={dataKey} 
                stroke="hsl(var(--warning))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--warning))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "hsl(var(--warning))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="hover-overlay transition-all duration-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {renderChart()}
        {type === "pie" && data.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-3">
            {data.map((item, index) => (
              <div key={index} className="flex items-center gap-2 hover-overlay p-2 rounded-md transition-all duration-200">
                <div 
                  className="h-3 w-3 rounded-full shadow-sm"
                  style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                />
                <span className="text-sm text-muted-foreground font-medium">
                  {item[xAxisKey]}: {typeof item[dataKey] === 'number' ? item[dataKey].toLocaleString('pt-BR') : item[dataKey]}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}