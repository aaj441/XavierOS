import { AlertCircle, Award, BarChart3, Filter } from "lucide-react";
import { useState } from "react";

interface ViolationStats {
  bySeverity: {
    critical: number;
    serious: number;
    moderate: number;
    minor: number;
  };
  byWcagLevel: {
    A: number;
    AA: number;
    AAA: number;
  };
  byType: Array<{
    code: string;
    description: string;
    count: number;
    severity: string;
  }>;
  total: number;
}

interface ViolationBreakdownProps {
  stats: ViolationStats;
  isLoading?: boolean;
}

export function ViolationBreakdown({ stats, isLoading }: ViolationBreakdownProps) {
  const [activeView, setActiveView] = useState<"severity" | "wcag" | "type">("severity");

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Loading violation breakdown...</p>
        </div>
      </div>
    );
  }

  if (stats.total === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <Award className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Perfect Score!</h3>
        <p className="text-gray-600">No accessibility violations detected</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Violation Breakdown</h3>
            <p className="text-sm text-gray-600">{stats.total} total issues found</p>
          </div>
        </div>

        {/* View toggle */}
        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveView("severity")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeView === "severity"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            By Severity
          </button>
          <button
            onClick={() => setActiveView("wcag")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeView === "wcag"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            By WCAG
          </button>
          <button
            onClick={() => setActiveView("type")}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeView === "type"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            By Type
          </button>
        </div>
      </div>

      {/* Severity View */}
      {activeView === "severity" && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Critical</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-red-600">
                  {stats.bySeverity.critical}
                </span>
                <span className="text-xs text-gray-500">
                  ({stats.total > 0 ? Math.round((stats.bySeverity.critical / stats.total) * 100) : 0}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-red-600 h-3 rounded-full transition-all"
                style={{
                  width: `${stats.total > 0 ? (stats.bySeverity.critical / stats.total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Serious</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-orange-600">
                  {stats.bySeverity.serious}
                </span>
                <span className="text-xs text-gray-500">
                  ({stats.total > 0 ? Math.round((stats.bySeverity.serious / stats.total) * 100) : 0}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-orange-600 h-3 rounded-full transition-all"
                style={{
                  width: `${stats.total > 0 ? (stats.bySeverity.serious / stats.total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Moderate</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-yellow-600">
                  {stats.bySeverity.moderate}
                </span>
                <span className="text-xs text-gray-500">
                  ({stats.total > 0 ? Math.round((stats.bySeverity.moderate / stats.total) * 100) : 0}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-yellow-600 h-3 rounded-full transition-all"
                style={{
                  width: `${stats.total > 0 ? (stats.bySeverity.moderate / stats.total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Minor</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-blue-600">
                  {stats.bySeverity.minor}
                </span>
                <span className="text-xs text-gray-500">
                  ({stats.total > 0 ? Math.round((stats.bySeverity.minor / stats.total) * 100) : 0}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{
                  width: `${stats.total > 0 ? (stats.bySeverity.minor / stats.total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* WCAG Level View */}
      {activeView === "wcag" && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-sm font-medium text-gray-700">Level A</span>
                <span className="text-xs text-gray-500 ml-2">(Must Have)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-red-600">
                  {stats.byWcagLevel.A}
                </span>
                <span className="text-xs text-gray-500">
                  ({stats.total > 0 ? Math.round((stats.byWcagLevel.A / stats.total) * 100) : 0}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-red-600 h-3 rounded-full transition-all"
                style={{
                  width: `${stats.total > 0 ? (stats.byWcagLevel.A / stats.total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-sm font-medium text-gray-700">Level AA</span>
                <span className="text-xs text-gray-500 ml-2">(Should Have)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-orange-600">
                  {stats.byWcagLevel.AA}
                </span>
                <span className="text-xs text-gray-500">
                  ({stats.total > 0 ? Math.round((stats.byWcagLevel.AA / stats.total) * 100) : 0}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-orange-600 h-3 rounded-full transition-all"
                style={{
                  width: `${stats.total > 0 ? (stats.byWcagLevel.AA / stats.total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-sm font-medium text-gray-700">Level AAA</span>
                <span className="text-xs text-gray-500 ml-2">(Enhanced)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-blue-600">
                  {stats.byWcagLevel.AAA}
                </span>
                <span className="text-xs text-gray-500">
                  ({stats.total > 0 ? Math.round((stats.byWcagLevel.AAA / stats.total) * 100) : 0}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{
                  width: `${stats.total > 0 ? (stats.byWcagLevel.AAA / stats.total) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Type View */}
      {activeView === "type" && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {stats.byType.slice(0, 10).map((violation, index) => (
            <div
              key={violation.code}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{violation.code}</p>
                  <p className="text-xs text-gray-500 truncate">{violation.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 ml-4">
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    violation.severity === "critical"
                      ? "bg-red-100 text-red-800"
                      : violation.severity === "serious"
                      ? "bg-orange-100 text-orange-800"
                      : violation.severity === "moderate"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {violation.severity}
                </span>
                <span className="text-sm font-bold text-gray-600 min-w-[2rem] text-right">
                  {violation.count}
                </span>
              </div>
            </div>
          ))}
          {stats.byType.length > 10 && (
            <p className="text-xs text-gray-500 text-center py-2">
              +{stats.byType.length - 10} more violation types
            </p>
          )}
        </div>
      )}
    </div>
  );
}
