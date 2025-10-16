import { Lightbulb, AlertCircle, CheckCircle, ArrowRight, Target, Zap } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "~/components/Button";

interface RemediationItem {
  code: string;
  description: string;
  severity: "critical" | "serious" | "moderate" | "minor";
  wcagLevel: string;
  count: number;
  suggestion: string;
  estimatedImpact: "high" | "medium" | "low";
  affectedScans: number;
}

interface RemediationSuggestionsProps {
  items: RemediationItem[];
  isLoading?: boolean;
  maxItems?: number;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-900",
        badge: "bg-red-100 text-red-800",
        icon: "text-red-600",
      };
    case "serious":
      return {
        bg: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-900",
        badge: "bg-orange-100 text-orange-800",
        icon: "text-orange-600",
      };
    case "moderate":
      return {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        text: "text-yellow-900",
        badge: "bg-yellow-100 text-yellow-800",
        icon: "text-yellow-600",
      };
    default:
      return {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-900",
        badge: "bg-blue-100 text-blue-800",
        icon: "text-blue-600",
      };
  }
};

const getImpactBadge = (impact: string) => {
  switch (impact) {
    case "high":
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        <Zap className="h-3 w-3 mr-1" />
        High Impact
      </span>;
    case "medium":
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <Target className="h-3 w-3 mr-1" />
        Medium Impact
      </span>;
    default:
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        Low Impact
      </span>;
  }
};

export function RemediationSuggestions({ items, isLoading, maxItems = 5 }: RemediationSuggestionsProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Loading remediation suggestions...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">All Clear!</h3>
        <p className="text-gray-600">No critical issues requiring immediate attention</p>
      </div>
    );
  }

  const displayItems = items.slice(0, maxItems);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <Lightbulb className="h-6 w-6 text-primary-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Top Remediation Priorities</h3>
            <p className="text-sm text-gray-600">Focus on these high-impact fixes first</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {displayItems.map((item, index) => {
          const colors = getSeverityColor(item.severity);
          
          return (
            <div
              key={item.code}
              className={`${colors.bg} ${colors.border} border rounded-lg p-5 transition-all hover:shadow-md`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3 flex-1">
                  <div className={`flex-shrink-0 h-8 w-8 rounded-full ${colors.badge} flex items-center justify-center font-bold`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className={`text-base font-semibold ${colors.text}`}>
                        {item.description}
                      </h4>
                    </div>
                    <div className="flex items-center flex-wrap gap-2 mb-3">
                      <span className={`${colors.badge} px-2 py-1 rounded text-xs font-semibold uppercase`}>
                        {item.severity}
                      </span>
                      <span className={`${colors.badge} px-2 py-1 rounded text-xs font-semibold`}>
                        WCAG {item.wcagLevel}
                      </span>
                      {getImpactBadge(item.estimatedImpact)}
                      <span className="text-xs text-gray-600">
                        {item.count} occurrence{item.count !== 1 ? 's' : ''} across {item.affectedScans} scan{item.affectedScans !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`bg-white/70 rounded-lg p-4 border ${colors.border}`}>
                <div className="flex items-start space-x-2 mb-2">
                  <Lightbulb className={`h-4 w-4 ${colors.icon} mt-0.5 flex-shrink-0`} />
                  <span className="text-sm font-semibold text-gray-700">How to Fix:</span>
                </div>
                <p className="text-sm text-gray-800 leading-relaxed">
                  {item.suggestion}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-mono">{item.code}</span>
                <span className={`text-xs font-medium ${colors.text}`}>
                  Fixing this will resolve {item.count} issue{item.count !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {items.length > maxItems && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-3">
            +{items.length - maxItems} more remediation{items.length - maxItems !== 1 ? 's' : ''} available
          </p>
          <Button variant="outline" size="sm">
            View All Suggestions
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
