import { Link } from "@tanstack/react-router";
import { ExternalLink, AlertCircle, AlertTriangle, Info, CheckCircle, Clock, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { Button } from "~/components/Button";

interface ScanResult {
  id: number;
  url: string;
  projectName: string;
  status: string;
  startedAt: Date;
  finishedAt: Date | null;
  riskScore?: number;
  totalIssues?: number;
  criticalIssues?: number;
  seriousIssues?: number;
  moderateIssues?: number;
  minorIssues?: number;
}

interface ScanResultsOverviewProps {
  scans: ScanResult[];
  isLoading?: boolean;
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case "critical":
      return <AlertCircle className="h-4 w-4" />;
    case "serious":
      return <AlertTriangle className="h-4 w-4" />;
    case "moderate":
      return <Info className="h-4 w-4" />;
    default:
      return <CheckCircle className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "running":
      return "bg-blue-100 text-blue-800";
    case "error":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getRiskColor = (riskScore: number) => {
  if (riskScore >= 80) return "text-red-600";
  if (riskScore >= 60) return "text-orange-600";
  if (riskScore >= 40) return "text-yellow-600";
  return "text-green-600";
};

export function ScanResultsOverview({ scans, isLoading }: ScanResultsOverviewProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Loading scan results...</p>
        </div>
      </div>
    );
  }

  if (scans.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No recent scans</h3>
        <p className="text-gray-600">Start scanning your projects to see results here</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project / URL
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Risk Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Issues
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Scanned
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {scans.map((scan) => (
              <tr key={scan.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{scan.projectName}</span>
                    <a
                      href={scan.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-600 hover:text-primary-700 flex items-center space-x-1 mt-1"
                    >
                      <span className="truncate max-w-xs">{scan.url}</span>
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(scan.status)}`}>
                    {scan.status === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                    {scan.status === "running" && <Clock className="h-3 w-3 mr-1 animate-spin" />}
                    {scan.status === "error" && <AlertTriangle className="h-3 w-3 mr-1" />}
                    {scan.status.charAt(0).toUpperCase() + scan.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {scan.riskScore !== undefined ? (
                    <span className={`text-2xl font-bold ${getRiskColor(scan.riskScore)}`}>
                      {scan.riskScore}
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {scan.totalIssues !== undefined ? (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-900">{scan.totalIssues}</span>
                      <div className="flex items-center space-x-1">
                        {scan.criticalIssues! > 0 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            {scan.criticalIssues}
                          </span>
                        )}
                        {scan.seriousIssues! > 0 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                            {scan.seriousIssues}
                          </span>
                        )}
                        {scan.moderateIssues! > 0 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            {scan.moderateIssues}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {new Date(scan.startedAt).toLocaleDateString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(scan.startedAt).toLocaleTimeString()}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  {scan.status === "completed" && (
                    <Link to={`/scans/${scan.id}`}>
                      <Button size="sm" variant="outline">
                        View Details
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
