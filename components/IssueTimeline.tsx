import { TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react";
import { useState } from "react";

interface TimelineDataPoint {
  date: string;
  totalIssues: number;
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
  debt: number;
}

interface IssueTimelineProps {
  data: TimelineDataPoint[];
  title?: string;
  description?: string;
  showDebt?: boolean;
}

const calculateTrend = (data: TimelineDataPoint[]) => {
  if (data.length < 2) return { direction: "stable" as const, percentage: 0 };
  
  const first = data[0].totalIssues;
  const last = data[data.length - 1].totalIssues;
  
  if (first === 0) return { direction: "stable" as const, percentage: 0 };
  
  const percentage = Math.round(((last - first) / first) * 100);
  
  if (percentage > 5) return { direction: "up" as const, percentage };
  if (percentage < -5) return { direction: "down" as const, percentage: Math.abs(percentage) };
  return { direction: "stable" as const, percentage: 0 };
};

export function IssueTimeline({ 
  data, 
  title = "Issue Trend Over Time",
  description,
  showDebt = true 
}: IssueTimelineProps) {
  const [chartType, setChartType] = useState<"issues" | "debt">("issues");
  
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <div className="text-center py-8 text-gray-500">
          <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p>No historical data available yet</p>
          <p className="text-sm mt-1">Data will appear as you perform more scans</p>
        </div>
      </div>
    );
  }
  
  const trend = calculateTrend(data);
  const maxValue = Math.max(...data.map(d => chartType === "issues" ? d.totalIssues : d.debt));
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
        </div>
        <div className="flex items-center space-x-4">
          {/* Trend indicator */}
          <div className="flex items-center space-x-2">
            {trend.direction === "down" ? (
              <div className="flex items-center space-x-1 text-green-600">
                <TrendingDown className="h-5 w-5" />
                <span className="text-sm font-medium">-{trend.percentage}%</span>
              </div>
            ) : trend.direction === "up" ? (
              <div className="flex items-center space-x-1 text-red-600">
                <TrendingUp className="h-5 w-5" />
                <span className="text-sm font-medium">+{trend.percentage}%</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1 text-gray-600">
                <Minus className="h-5 w-5" />
                <span className="text-sm font-medium">Stable</span>
              </div>
            )}
          </div>
          
          {/* Chart type toggle */}
          {showDebt && (
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setChartType("issues")}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  chartType === "issues"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Issues
              </button>
              <button
                onClick={() => setChartType("debt")}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  chartType === "debt"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Debt
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Chart */}
      <div className="mt-6">
        <div className="flex items-end justify-between h-64 space-x-1">
          {data.map((point, index) => {
            const value = chartType === "issues" ? point.totalIssues : point.debt;
            const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
            
            // Calculate stacked bar heights for issues view
            const criticalHeight = maxValue > 0 ? (point.critical / maxValue) * 100 : 0;
            const seriousHeight = maxValue > 0 ? (point.serious / maxValue) * 100 : 0;
            const moderateHeight = maxValue > 0 ? (point.moderate / maxValue) * 100 : 0;
            const minorHeight = maxValue > 0 ? (point.minor / maxValue) * 100 : 0;
            
            return (
              <div key={point.date} className="flex-1 flex flex-col items-center group relative">
                {chartType === "issues" ? (
                  // Stacked bar for issues
                  <div className="w-full flex flex-col-reverse" style={{ height: "100%" }}>
                    <div
                      className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                      style={{ height: `${minorHeight}%` }}
                    />
                    <div
                      className="w-full bg-yellow-500 transition-all hover:bg-yellow-600"
                      style={{ height: `${moderateHeight}%` }}
                    />
                    <div
                      className="w-full bg-orange-500 transition-all hover:bg-orange-600"
                      style={{ height: `${seriousHeight}%` }}
                    />
                    <div
                      className="w-full bg-red-500 rounded-t transition-all hover:bg-red-600"
                      style={{ height: `${criticalHeight}%` }}
                    />
                  </div>
                ) : (
                  // Single bar for debt
                  <div
                    className="w-full bg-gradient-to-t from-red-500 to-orange-400 rounded-t transition-all hover:from-red-600 hover:to-orange-500"
                    style={{ height: `${height}%` }}
                  />
                )}
                
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-3 py-2 whitespace-nowrap z-10 shadow-lg">
                  <div className="font-semibold mb-1">{new Date(point.date).toLocaleDateString()}</div>
                  {chartType === "issues" ? (
                    <>
                      <div className="text-gray-300">Total: {point.totalIssues}</div>
                      <div className="flex items-center space-x-1 text-red-300">
                        <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                        <span>Critical: {point.critical}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-orange-300">
                        <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                        <span>Serious: {point.serious}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-yellow-300">
                        <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                        <span>Moderate: {point.moderate}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-blue-300">
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                        <span>Minor: {point.minor}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-300">Debt Score: {point.debt}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* X-axis labels */}
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>{data[0] && new Date(data[0].date).toLocaleDateString()}</span>
          {data.length > 2 && (
            <span>{data[Math.floor(data.length / 2)] && new Date(data[Math.floor(data.length / 2)].date).toLocaleDateString()}</span>
          )}
          <span>Today</span>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-6 flex items-center justify-center flex-wrap gap-4 text-sm">
        {chartType === "issues" ? (
          <>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-red-500 rounded"></div>
              <span className="text-gray-600">Critical</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-orange-500 rounded"></div>
              <span className="text-gray-600">Serious</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-yellow-500 rounded"></div>
              <span className="text-gray-600">Moderate</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-3 w-3 bg-blue-500 rounded"></div>
              <span className="text-gray-600">Minor</span>
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="h-3 w-8 bg-gradient-to-r from-red-500 to-orange-400 rounded"></div>
            <span className="text-gray-600">Accessibility Debt (weighted by severity)</span>
          </div>
        )}
      </div>
    </div>
  );
}
