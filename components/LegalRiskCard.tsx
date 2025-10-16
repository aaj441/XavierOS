import { AlertTriangle, Shield, TrendingUp, DollarSign, Scale, Building2, MapPin, Users } from "lucide-react";
import { Button } from "~/components/Button";

interface LegalRiskCardProps {
  riskData: {
    assessment: {
      overallRiskScore: number;
      riskLevel: string;
      calculatedAt: Date;
    };
    riskComponents: {
      violations: {
        score: number;
        total: number;
        critical: number;
        serious: number;
        moderate: number;
        minor: number;
      };
      industry: {
        score: number;
        name: string;
      };
      state: {
        score: number;
        code: string;
      };
      companySize: {
        score: number;
        category: string;
      };
    };
    probabilities: {
      demandLetter: number;
      lawsuit: number;
    };
    costEstimates: {
      settlement: number;
      legalFees: number;
      remediation: number;
      totalExposure: number;
    };
    comparison: {
      lucyAnnualCost: number;
      potentialSavings: number;
      roi: number;
    };
  };
  onUpdateInfo?: () => void;
  showDetailedBreakdown?: boolean;
}

export function LegalRiskCard({ riskData, onUpdateInfo, showDetailedBreakdown = false }: LegalRiskCardProps) {
  const { assessment, riskComponents, probabilities, costEstimates, comparison } = riskData;
  
  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "critical":
        return "text-red-600 bg-red-100 border-red-300";
      case "high":
        return "text-orange-600 bg-orange-100 border-orange-300";
      case "medium":
        return "text-yellow-600 bg-yellow-100 border-yellow-300";
      case "low":
        return "text-green-600 bg-green-100 border-green-300";
      default:
        return "text-gray-600 bg-gray-100 border-gray-300";
    }
  };
  
  const getRiskIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case "critical":
      case "high":
        return <AlertTriangle className="h-6 w-6" />;
      case "medium":
        return <Scale className="h-6 w-6" />;
      case "low":
        return <Shield className="h-6 w-6" />;
      default:
        return <Shield className="h-6 w-6" />;
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const formatPercentage = (decimal: number) => {
    return `${Math.round(decimal * 100)}%`;
  };
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className={`p-6 border-b-4 ${getRiskColor(assessment.riskLevel).replace("text-", "border-")}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${getRiskColor(assessment.riskLevel)}`}>
              {getRiskIcon(assessment.riskLevel)}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Lawsuit Risk Assessment</h3>
              <p className="text-sm text-gray-600 mt-1">
                Based on industry data, state litigation trends, and current violations
              </p>
            </div>
          </div>
          {onUpdateInfo && (
            <Button variant="outline" size="sm" onClick={onUpdateInfo}>
              Update Info
            </Button>
          )}
        </div>
      </div>
      
      {/* Risk Score */}
      <div className="p-6 bg-gradient-to-br from-gray-50 to-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-baseline space-x-3">
              <span className="text-6xl font-bold text-gray-900">{assessment.overallRiskScore}</span>
              <span className="text-2xl text-gray-500">/100</span>
            </div>
            <div className="mt-2">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-bold ${getRiskColor(assessment.riskLevel)}`}>
                {assessment.riskLevel} Risk
              </span>
            </div>
          </div>
          
          {/* Visual Risk Meter */}
          <div className="flex flex-col items-end">
            <div className="w-48 h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  assessment.overallRiskScore >= 80
                    ? "bg-red-600"
                    : assessment.overallRiskScore >= 60
                    ? "bg-orange-600"
                    : assessment.overallRiskScore >= 40
                    ? "bg-yellow-600"
                    : "bg-green-600"
                }`}
                style={{ width: `${assessment.overallRiskScore}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Updated {new Date(assessment.calculatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        {/* Educational Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">
                {assessment.riskLevel === "Critical" || assessment.riskLevel === "High"
                  ? "Your risk level indicates immediate action is recommended."
                  : assessment.riskLevel === "Medium"
                  ? "Your risk level suggests proactive compliance efforts."
                  : "Your risk level is low, but continued monitoring is important."}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                In 2024-2025, over 8,800 ADA website lawsuits were filed. Lucy helps you demonstrate good-faith compliance efforts.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Risk Components */}
      {showDetailedBreakdown && (
        <div className="p-6 border-t border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Risk Breakdown</h4>
          <div className="grid grid-cols-2 gap-4">
            {/* Violations */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Current Violations</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{riskComponents.violations.score}</span>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <p>{riskComponents.violations.total} total issues</p>
                <p className="text-red-600">{riskComponents.violations.critical} critical</p>
              </div>
            </div>
            
            {/* Industry */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Industry Risk</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{riskComponents.industry.score}</span>
              </div>
              <p className="text-xs text-gray-600">{riskComponents.industry.name || "Not specified"}</p>
            </div>
            
            {/* State */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">State Risk</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{riskComponents.state.score}</span>
              </div>
              <p className="text-xs text-gray-600">{riskComponents.state.code || "Not specified"}</p>
            </div>
            
            {/* Company Size */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Company Size</span>
                </div>
                <span className="text-lg font-bold text-gray-900">{riskComponents.companySize.score}</span>
              </div>
              <p className="text-xs text-gray-600 capitalize">{riskComponents.companySize.category || "Not specified"}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Probabilities */}
      <div className="p-6 border-t border-gray-200 bg-orange-50">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Litigation Probability</h4>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Demand Letter Risk</span>
              <span className="text-2xl font-bold text-orange-600">{formatPercentage(probabilities.demandLetter)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-orange-600 h-2 rounded-full"
                style={{ width: `${probabilities.demandLetter * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Likelihood of receiving a demand letter within 12 months
            </p>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Lawsuit Risk</span>
              <span className="text-2xl font-bold text-red-600">{formatPercentage(probabilities.lawsuit)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-600 h-2 rounded-full"
                style={{ width: `${probabilities.lawsuit * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Likelihood of being sued within 12 months
            </p>
          </div>
        </div>
      </div>
      
      {/* Cost Estimates */}
      <div className="p-6 border-t border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-red-600" />
          Potential Legal Costs
        </h4>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between py-2 border-b border-gray-200">
            <span className="text-sm text-gray-700">Average Settlement</span>
            <span className="text-lg font-bold text-gray-900">{formatCurrency(costEstimates.settlement)}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-200">
            <span className="text-sm text-gray-700">Legal Defense Fees</span>
            <span className="text-lg font-bold text-gray-900">{formatCurrency(costEstimates.legalFees)}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-200">
            <span className="text-sm text-gray-700">Remediation Costs</span>
            <span className="text-lg font-bold text-gray-900">{formatCurrency(costEstimates.remediation)}</span>
          </div>
          <div className="flex items-center justify-between py-3 bg-red-50 rounded-lg px-4">
            <span className="text-base font-semibold text-red-900">Total Exposure</span>
            <span className="text-2xl font-bold text-red-600">{formatCurrency(costEstimates.totalExposure)}</span>
          </div>
        </div>
        
        {/* ROI Comparison */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-semibold text-green-900">Prevention vs. Lawsuit Cost</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-800">Lucy Annual Cost (Professional):</span>
                  <span className="text-lg font-bold text-green-900">{formatCurrency(comparison.lucyAnnualCost)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-green-800">Potential Savings:</span>
                  <span className="text-lg font-bold text-green-600">{formatCurrency(comparison.potentialSavings)}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-green-300">
                  <span className="text-sm font-semibold text-green-900">ROI if prevents 1 lawsuit:</span>
                  <span className="text-xl font-bold text-green-600">{comparison.roi}%</span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-green-700 mt-3">
            <strong>Protection Strategy:</strong> Lucy provides court-ready compliance documentation, demonstrating good-faith 
            accessibility efforts that can reduce settlement amounts by up to 40%.
          </p>
        </div>
      </div>
    </div>
  );
}
