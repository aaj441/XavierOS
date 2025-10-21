import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, FolderOpen, Clock, AlertCircle, TrendingUp, TrendingDown, Activity, CheckCircle, XCircle, Calendar, Repeat, AlertTriangle, History, Award, FileText, Target, Send, Trophy, Mail, MessageSquare, XOctagon, Building2, ExternalLink } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { DashboardLayout } from "~/components/DashboardLayout";
import { Button } from "~/components/Button";
import { ShuffleModal } from "~/components/ShuffleModal";
import { SubscriptionBanner } from "~/components/SubscriptionBanner";
import { ScanResultsOverview } from "~/components/ScanResultsOverview";
import { IssueTimeline } from "~/components/IssueTimeline";
import { RemediationSuggestions } from "~/components/RemediationSuggestions";
import { ViolationBreakdown } from "~/components/ViolationBreakdown";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardPage,
});

function DashboardPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [analyticsDays, setAnalyticsDays] = useState(30);
  const [showShuffleModal, setShowShuffleModal] = useState(false);
  const [selectedProjectForShuffle, setSelectedProjectForShuffle] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "scans" | "issues" | "remediation" | "sales">("overview");
  const { authToken } = useAuthStore();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const projectsQuery = useQuery(
    trpc.getProjects.queryOptions({ authToken: authToken || "" })
  );
  
  const analyticsQuery = useQuery(
    trpc.getAnalytics.queryOptions({ 
      authToken: authToken || "",
      days: analyticsDays,
    })
  );
  
  const createProjectMutation = useMutation(
    trpc.createProject.mutationOptions({
      onSuccess: (data) => {
        toast.success("Project created successfully!");
        queryClient.invalidateQueries({ queryKey: trpc.getProjects.queryKey() });
        setShowCreateModal(false);
        setProjectName("");
        navigate({ to: `/projects/${data.id}` });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create project");
      },
    })
  );
  
  const exportAnalyticsPdfMutation = useMutation(
    trpc.exportAnalyticsPdf.mutationOptions()
  );

  const exportAnalyticsCsvMutation = useMutation(
    trpc.exportAnalyticsCsv.mutationOptions()
  );
  
  const shuffleMutation = useMutation(
    trpc.startShuffle.mutationOptions({
      onSuccess: (data) => {
        toast.success("Shuffle started! Processing sites in the background...");
        setShowShuffleModal(false);
        setSelectedProjectForShuffle(null);
        queryClient.invalidateQueries({ queryKey: trpc.getProjects.queryKey() });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to start shuffle");
      },
    })
  );
  
  const minioBaseUrlQuery = useQuery(
    trpc.getMinioBaseUrl.queryOptions()
  );
  
  const subscriptionQuery = useQuery(
    trpc.getSubscriptionStatus.queryOptions({ authToken: authToken || "" })
  );
  
  const engagementQuery = useQuery(
    trpc.getReportEngagement.queryOptions({ 
      authToken: authToken || "",
      days: analyticsDays,
    })
  );
  
  const salesAnalyticsQuery = useQuery(
    trpc.getSalesAnalytics.queryOptions({ 
      authToken: authToken || "",
      timeRange: analyticsDays === 7 ? "7d" : analyticsDays === 30 ? "30d" : analyticsDays === 90 ? "90d" : "30d",
    })
  );
  
  // Prepare data for new components
  const recentScans = analyticsQuery.data?.recentActivity
    .filter(activity => activity.type === "scan_complete")
    .slice(0, 10)
    .map(activity => ({
      id: activity.id,
      url: activity.url,
      projectName: activity.projectName,
      status: "completed" as const,
      startedAt: activity.timestamp,
      finishedAt: activity.timestamp,
      riskScore: activity.riskScore,
      totalIssues: activity.totalIssues,
      criticalIssues: undefined,
      seriousIssues: undefined,
      moderateIssues: undefined,
      minorIssues: undefined,
    })) || [];

  const timelineData = analyticsQuery.data?.historicalData.accessibilityDebtTrend.map(point => ({
    date: point.date,
    totalIssues: point.violations,
    critical: point.critical,
    serious: point.serious,
    moderate: point.moderate,
    minor: point.minor,
    debt: point.debt,
  })) || [];

  const remediationItems = analyticsQuery.data?.topViolationTypes.map(violation => ({
    code: violation.code,
    description: violation.code.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    severity: "critical" as const,
    wcagLevel: "AA",
    count: violation.count,
    suggestion: "Review and fix all instances of this violation according to WCAG guidelines.",
    estimatedImpact: "high" as const,
    affectedScans: Math.ceil(violation.count / 5),
  })) || [];

  const violationStats = {
    bySeverity: analyticsQuery.data?.issueDistribution || {
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0,
    },
    byWcagLevel: analyticsQuery.data?.wcagLevelDistribution || {
      A: 0,
      AA: 0,
      AAA: 0,
    },
    byType: analyticsQuery.data?.topViolationTypes.map(v => ({
      code: v.code,
      description: v.code.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count: v.count,
      severity: "critical",
    })) || [],
    total: analyticsQuery.data?.totalIssues || 0,
  };
  
  // Redirect if not authenticated - but AFTER all hooks are called
  if (!authToken) {
    navigate({ to: "/login" });
    return null;
  }
  
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName.trim()) {
      createProjectMutation.mutate({ authToken: authToken!, name: projectName });
    }
  };
  
  const handleExportAnalyticsPdf = async () => {
    if (!authToken || !minioBaseUrlQuery.data) return;
    
    const exportPromise = exportAnalyticsPdfMutation.mutateAsync({
      authToken,
      days: analyticsDays,
    });
    
    toast.promise(exportPromise, {
      loading: "Generating PDF report...",
      success: "PDF report generated successfully!",
      error: "Failed to generate PDF report",
    });
    
    try {
      const result = await exportPromise;
      // Open the PDF in a new tab
      const pdfUrl = `${minioBaseUrlQuery.data.minioBaseUrl}/scan-reports/${result.filename}`;
      window.open(pdfUrl, "_blank");
    } catch (error) {
      // Error is already handled by toast.promise
    }
  };

  const handleExportAnalyticsCsv = async () => {
    if (!authToken || !minioBaseUrlQuery.data) return;
    
    const exportPromise = exportAnalyticsCsvMutation.mutateAsync({
      authToken,
      days: analyticsDays,
    });
    
    toast.promise(exportPromise, {
      loading: "Generating CSV report...",
      success: "CSV report generated successfully!",
      error: "Failed to generate CSV report",
    });
    
    try {
      const result = await exportPromise;
      // Open the CSV in a new tab
      const csvUrl = `${minioBaseUrlQuery.data.minioBaseUrl}/scan-reports/${result.filename}`;
      window.open(csvUrl, "_blank");
    } catch (error) {
      // Error is already handled by toast.promise
    }
  };
  
  const handleStartShuffle = (projectId: number) => {
    setSelectedProjectForShuffle(projectId);
    setShowShuffleModal(true);
  };

  const handleShuffleSubmit = (data: { category: string; demographics?: string; sitesToDiscover: number }) => {
    if (selectedProjectForShuffle && authToken) {
      shuffleMutation.mutate({
        authToken,
        projectId: selectedProjectForShuffle,
        category: data.category,
        demographics: data.demographics,
        sitesToDiscover: data.sitesToDiscover,
      });
    }
  };
  
  const projects = projectsQuery.data || [];
  const analytics = analyticsQuery.data;
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "scan_complete":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "scan_error":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "scan_started":
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <Activity className="h-5 w-5 text-gray-600" />;
    }
  };
  
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header with Tabs */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
              <p className="text-gray-600">Comprehensive analytics and insights for your accessibility audits</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => {
                  if (projects.length > 0) {
                    handleStartShuffle(projects[0].id);
                  } else {
                    toast.error("Create a project first");
                  }
                }}
                variant="secondary"
                size="sm"
              >
                <Repeat className="h-5 w-5 mr-2" />
                Shuffle
              </Button>
              <select
                value={analyticsDays}
                onChange={(e) => setAnalyticsDays(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportAnalyticsPdf}
                isLoading={exportAnalyticsPdfMutation.isPending}
                disabled={!minioBaseUrlQuery.data}
              >
                Export PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportAnalyticsCsv}
                isLoading={exportAnalyticsCsvMutation.isPending}
                disabled={!minioBaseUrlQuery.data}
              >
                Export CSV
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "overview"
                    ? "border-primary-600 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("scans")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "scans"
                    ? "border-primary-600 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Scan Results
              </button>
              <button
                onClick={() => setActiveTab("issues")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "issues"
                    ? "border-primary-600 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Issue Tracking
              </button>
              <button
                onClick={() => setActiveTab("remediation")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "remediation"
                    ? "border-primary-600 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Remediation
              </button>
              <button
                onClick={() => setActiveTab("sales")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "sales"
                    ? "border-primary-600 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Sales Enablement
              </button>
            </nav>
          </div>
        </div>
        
        {/* Subscription Status */}
        {subscriptionQuery.data && (
          <div className="mb-8">
            <SubscriptionBanner
              planName={subscriptionQuery.data.plan.name}
              planDisplayName={subscriptionQuery.data.plan.displayName}
              aiCreditsBalance={subscriptionQuery.data.aiCredits.balance}
              scansUsed={subscriptionQuery.data.usage.scansThisMonth}
              scansLimit={subscriptionQuery.data.plan.features.maxScansPerMonth}
              projectsUsed={subscriptionQuery.data.usage.projectsUsed}
              projectsLimit={subscriptionQuery.data.plan.features.maxProjects}
              showUpgradePrompt={subscriptionQuery.data.plan.name === "free"}
            />
          </div>
        )}
        
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Projects</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{projects.length}</p>
                  </div>
                  <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <FolderOpen className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Scans</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {analytics?.totalScans || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {analytics?.completedScans || 0} completed
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-accent-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-accent-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Scans</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {analytics?.runningScans || 0}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Issues</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {analytics?.totalIssues || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Avg: {analytics?.averageIssuesPerScan || 0} per scan
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Second Stats Grid Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Report Views</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {engagementQuery.data?.summary.totalViews || 0}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {engagementQuery.data?.summary.uniqueViewers || 0} unique viewers
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Metrics */}
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">Scan Activity</h3>
                    {analytics.comparisonMetrics.scanGrowth !== 0 && (
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        analytics.comparisonMetrics.scanGrowth > 0 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {analytics.comparisonMetrics.scanGrowth > 0 ? "+" : ""}{analytics.comparisonMetrics.scanGrowth}%
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{analytics.completedScans} scans</p>
                  <p className="text-xs text-gray-500 mt-1">
                    vs {analytics.comparisonMetrics.previousPeriodScans} in previous period
                  </p>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">Issue Trend</h3>
                    {analytics.comparisonMetrics.issueChange !== 0 && (
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        analytics.comparisonMetrics.issueChange < 0 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {analytics.comparisonMetrics.issueChange > 0 ? "+" : ""}{analytics.comparisonMetrics.issueChange}%
                      </span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{analytics.totalIssues} issues</p>
                  <p className="text-xs text-gray-500 mt-1">
                    vs {analytics.comparisonMetrics.previousPeriodIssues} in previous period
                  </p>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">Avg Scan Time</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.averageScanDuration > 60 
                      ? `${Math.floor(analytics.averageScanDuration / 60)}m ${analytics.averageScanDuration % 60}s`
                      : `${analytics.averageScanDuration}s`
                    }
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Per completed scan
                  </p>
                </div>
              </div>
            )}

            {/* Issue Timeline */}
            <div className="mb-8">
              <IssueTimeline
                data={timelineData}
                title="Issue Trend Over Time"
                description={`Tracking ${analytics?.historicalData.longestTrendDays || 0} days of history`}
                showDebt={true}
              />
            </div>

            {/* Remediation & Regression Metrics */}
            {analytics && (analytics.remediationData.totalRemediated > 0 || analytics.regressionData.totalRegressions > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Remediation Progress */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">Issues Remediated</h3>
                    <Award className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{analytics.remediationData.totalRemediated}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {analytics.remediationData.remediatedThisPeriod} fixed in last {analyticsDays} days
                  </p>
                  {analytics.remediationData.remediationRate > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-600">Remediation Rate</span>
                        <span className="font-semibold text-green-600">{analytics.remediationData.remediationRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${analytics.remediationData.remediationRate}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Regressions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">Regressions Detected</h3>
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{analytics.regressionData.totalRegressions}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {analytics.regressionData.recentRegressions.length} in last {analyticsDays} days
                  </p>
                  {analytics.regressionData.totalRegressions > 0 && (
                    <p className="text-xs text-orange-600 mt-2">
                      Previously fixed issues have reappeared
                    </p>
                  )}
                </div>
                
                {/* Historical Tracking */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-600">Historical Data</h3>
                    <History className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{analytics.historicalData.longestTrendDays}</p>
                  <p className="text-xs text-gray-500 mt-1">days of tracking</p>
                  <p className="text-xs text-blue-600 mt-2">
                    {analytics.historicalData.accessibilityDebtTrend.length} snapshots recorded
                  </p>
                </div>
              </div>
            )}

            {/* Recent Regressions Alert */}
            {analytics && analytics.regressionData.recentRegressions.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-8">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-orange-900 mb-2">
                      Regression Alert: {analytics.regressionData.recentRegressions.length} Issue{analytics.regressionData.recentRegressions.length !== 1 ? 's' : ''} Reappeared
                    </h3>
                    <p className="text-sm text-orange-700 mb-4">
                      The following previously fixed issues have returned. Review your recent changes.
                    </p>
                    <div className="space-y-2">
                      {analytics.regressionData.recentRegressions.slice(0, 5).map((regression) => (
                        <div key={regression.id} className="bg-white rounded-lg p-3 border border-orange-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                                  regression.severity === "critical" ? "bg-red-100 text-red-800" :
                                  regression.severity === "serious" ? "bg-orange-100 text-orange-800" :
                                  regression.severity === "moderate" ? "bg-yellow-100 text-yellow-800" :
                                  "bg-blue-100 text-blue-800"
                                }`}>
                                  {regression.severity}
                                </span>
                                <span className="text-sm font-medium text-gray-900">{regression.code}</span>
                              </div>
                              <p className="text-xs text-gray-600 truncate">{regression.url}</p>
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-xs text-gray-500">
                                Fixed: {new Date(regression.remediatedAt).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-orange-600 font-medium">
                                Returned: {regression.regressedAt && new Date(regression.regressedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {analytics.regressionData.recentRegressions.length > 5 && (
                      <p className="text-xs text-orange-600 mt-3">
                        +{analytics.regressionData.recentRegressions.length - 5} more regressions detected
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Report Engagement */}
            {engagementQuery.data && engagementQuery.data.summary.totalViews > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Report Engagement</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-600">Total Views</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{engagementQuery.data.summary.totalViews}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {engagementQuery.data.summary.uniqueViewers} unique viewers
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-600">Avg. Time</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {Math.floor(engagementQuery.data.summary.avgDuration / 60)}m
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {engagementQuery.data.summary.avgDuration % 60}s per view
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-600">Engagement</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {engagementQuery.data.summary.avgScrollDepth}%
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Average scroll depth
                    </p>
                  </div>
                  
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-600">Downloads</h3>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                      {engagementQuery.data.summary.downloadCount}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {((engagementQuery.data.summary.downloadCount / engagementQuery.data.summary.totalViews) * 100).toFixed(1)}% download rate
                    </p>
                  </div>
                </div>
                
                {engagementQuery.data.documentStats.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Viewed Reports</h3>
                    <div className="space-y-3">
                      {engagementQuery.data.documentStats.slice(0, 5).map((stat) => (
                        <div key={stat.document.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <FileText className="h-5 w-5 text-primary-600 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {stat.document.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {stat.document.documentType.replace(/_/g, ' ')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="text-right">
                              <p className="font-semibold">{stat.views}</p>
                              <p className="text-xs text-gray-500">views</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{stat.uniqueViewers}</p>
                              <p className="text-xs text-gray-500">viewers</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">{stat.downloads}</p>
                              <p className="text-xs text-gray-500">downloads</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Scans Tab */}
        {activeTab === "scans" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Scan Results</h2>
              <ScanResultsOverview
                scans={recentScans}
                isLoading={analyticsQuery.isLoading}
              />
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h3>
              {analytics && analytics.recentActivity.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {analytics.recentActivity.map((activity) => (
                    <div
                      key={`${activity.type}-${activity.id}`}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.projectName}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{activity.url}</p>
                        {activity.type === "scan_complete" && activity.totalIssues !== undefined && (
                          <p className="text-xs text-gray-600 mt-1">
                            Found {activity.totalIssues} issue{activity.totalIssues !== 1 ? 's' : ''} • Risk: {activity.riskScore}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(activity.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Issues Tab */}
        {activeTab === "issues" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Issue Analysis</h2>
              <ViolationBreakdown
                stats={violationStats}
                isLoading={analyticsQuery.isLoading}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* WCAG Level Distribution */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">WCAG Level Distribution</h3>
                {analytics && analytics.totalIssues > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Level A (Must Have)</span>
                        <span className="text-sm font-bold text-red-600">
                          {analytics.wcagLevelDistribution.A || 0}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full"
                          style={{
                            width: `${((analytics.wcagLevelDistribution.A || 0) / analytics.totalIssues) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Level AA (Should Have)</span>
                        <span className="text-sm font-bold text-orange-600">
                          {analytics.wcagLevelDistribution.AA || 0}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-600 h-2 rounded-full"
                          style={{
                            width: `${((analytics.wcagLevelDistribution.AA || 0) / analytics.totalIssues) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Level AAA (Enhanced)</span>
                        <span className="text-sm font-bold text-blue-600">
                          {analytics.wcagLevelDistribution.AAA || 0}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${((analytics.wcagLevelDistribution.AAA || 0) / analytics.totalIssues) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No WCAG violations found</p>
                  </div>
                )}
              </div>
              
              {/* Top Violation Types */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Common Issues</h3>
                {analytics && analytics.topViolationTypes && analytics.topViolationTypes.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.topViolationTypes.map((violation, index) => (
                      <div key={violation.code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{violation.code}</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-gray-600">{violation.count}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No violation data yet</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <IssueTimeline
                data={timelineData}
                title="Historical Issue Tracking"
                description="Track how issues have changed over time"
                showDebt={true}
              />
            </div>
          </div>
        )}

        {/* Remediation Tab */}
        {activeTab === "remediation" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Remediation Guidance</h2>
              <RemediationSuggestions
                items={remediationItems}
                isLoading={analyticsQuery.isLoading}
                maxItems={10}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Issue Distribution for context */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Issue Distribution</h3>
                {analytics && analytics.totalIssues > 0 ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Critical</span>
                        <span className="text-sm font-bold text-red-600">
                          {analytics.issueDistribution.critical}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full"
                          style={{
                            width: `${(analytics.issueDistribution.critical / analytics.totalIssues) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Serious</span>
                        <span className="text-sm font-bold text-orange-600">
                          {analytics.issueDistribution.serious}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-600 h-2 rounded-full"
                          style={{
                            width: `${(analytics.issueDistribution.serious / analytics.totalIssues) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Moderate</span>
                        <span className="text-sm font-bold text-yellow-600">
                          {analytics.issueDistribution.moderate}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-600 h-2 rounded-full"
                          style={{
                            width: `${(analytics.issueDistribution.moderate / analytics.totalIssues) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Minor</span>
                        <span className="text-sm font-bold text-blue-600">
                          {analytics.issueDistribution.minor}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(analytics.issueDistribution.minor / analytics.totalIssues) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <AlertCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No issues found yet</p>
                  </div>
                )}
              </div>

              {/* Remediation Progress */}
              {analytics && analytics.remediationData.totalRemediated > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Remediation Progress</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Total Remediated</span>
                        <span className="text-2xl font-bold text-green-600">
                          {analytics.remediationData.totalRemediated}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {analytics.remediationData.remediatedThisPeriod} fixed in the last {analyticsDays} days
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Remediation Rate</span>
                        <span className="text-lg font-bold text-green-600">
                          {analytics.remediationData.remediationRate}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-green-600 h-3 rounded-full transition-all"
                          style={{ width: `${analytics.remediationData.remediationRate}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Percentage of issues fixed vs total issues found
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-2 text-sm text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Great progress! Keep up the good work.</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sales Enablement Tab */}
        {activeTab === "sales" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Sales Enablement Analytics</h2>
              <p className="text-gray-600 mb-6">Track your accessibility sales funnel from discovery to close</p>
            </div>

            {salesAnalyticsQuery.isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading sales analytics...</p>
              </div>
            ) : salesAnalyticsQuery.data ? (
              <>
                {/* Funnel Overview */}
                <div className="bg-gradient-to-br from-primary-50 via-accent-50 to-purple-50 rounded-xl shadow-sm border border-primary-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Sales Funnel Overview</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-gray-200">
                      <p className="text-xs font-medium text-gray-600 mb-1">Sessions</p>
                      <p className="text-2xl font-bold text-gray-900">{salesAnalyticsQuery.data.funnel.totalSessions}</p>
                    </div>
                    <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-gray-200">
                      <p className="text-xs font-medium text-gray-600 mb-1">Discovered</p>
                      <p className="text-2xl font-bold text-gray-900">{salesAnalyticsQuery.data.funnel.totalDiscovered}</p>
                    </div>
                    <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-gray-200">
                      <p className="text-xs font-medium text-gray-600 mb-1">Scanned</p>
                      <p className="text-2xl font-bold text-blue-600">{salesAnalyticsQuery.data.funnel.totalScanned}</p>
                      <p className="text-xs text-gray-500 mt-1">{salesAnalyticsQuery.data.conversionRates.scanConversionRate}% rate</p>
                    </div>
                    <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-gray-200">
                      <p className="text-xs font-medium text-gray-600 mb-1">Non-Compliant</p>
                      <p className="text-2xl font-bold text-orange-600">{salesAnalyticsQuery.data.funnel.totalNonCompliant}</p>
                      <p className="text-xs text-gray-500 mt-1">{salesAnalyticsQuery.data.conversionRates.nonCompliantRate}% rate</p>
                    </div>
                    <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-gray-200">
                      <p className="text-xs font-medium text-gray-600 mb-1">Leads</p>
                      <p className="text-2xl font-bold text-primary-600">{salesAnalyticsQuery.data.funnel.totalLeads}</p>
                      <p className="text-xs text-gray-500 mt-1">{salesAnalyticsQuery.data.conversionRates.leadExtractionRate} per co.</p>
                    </div>
                    <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-gray-200">
                      <p className="text-xs font-medium text-gray-600 mb-1">Scripts</p>
                      <p className="text-2xl font-bold text-purple-600">{salesAnalyticsQuery.data.funnel.companiesWithScripts}</p>
                      <p className="text-xs text-gray-500 mt-1">{salesAnalyticsQuery.data.conversionRates.scriptGenerationRate}% rate</p>
                    </div>
                    <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-gray-200">
                      <p className="text-xs font-medium text-gray-600 mb-1">Contacted</p>
                      <p className="text-2xl font-bold text-green-600">
                        {salesAnalyticsQuery.data.contactStatus.contacted + 
                         salesAnalyticsQuery.data.contactStatus.responded + 
                         salesAnalyticsQuery.data.contactStatus.scheduled + 
                         salesAnalyticsQuery.data.contactStatus.closed_won}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{salesAnalyticsQuery.data.conversionRates.contactRate}% rate</p>
                    </div>
                  </div>
                </div>

                {/* Conversion Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-600">Lead Generation Rate</h3>
                      <Target className="h-5 w-5 text-primary-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-2">
                      {salesAnalyticsQuery.data.conversionRates.leadExtractionRate}
                    </p>
                    <p className="text-xs text-gray-500">Leads extracted per non-compliant company</p>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600">
                        Total: <span className="font-semibold text-gray-900">{salesAnalyticsQuery.data.funnel.totalLeads}</span> leads
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-600">Contact Rate</h3>
                      <Send className="h-5 w-5 text-green-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-2">
                      {salesAnalyticsQuery.data.conversionRates.contactRate}%
                    </p>
                    <p className="text-xs text-gray-500">Opportunities contacted vs discovered</p>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${salesAnalyticsQuery.data.conversionRates.contactRate}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-gray-600">Close Rate</h3>
                      <Trophy className="h-5 w-5 text-yellow-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-2">
                      {salesAnalyticsQuery.data.conversionRates.closeRate}%
                    </p>
                    <p className="text-xs text-gray-500">Deals won vs contacted</p>
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-green-600 font-medium">
                        {salesAnalyticsQuery.data.contactStatus.closed_won} deals won
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Status Pipeline */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">Sales Pipeline Status</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <Mail className="h-5 w-5 text-gray-500" />
                        <span className="text-xs font-medium text-gray-600">Not Contacted</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900">
                        {salesAnalyticsQuery.data.contactStatus.not_contacted}
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <Send className="h-5 w-5 text-blue-600" />
                        <span className="text-xs font-medium text-blue-600">Contacted</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-900">
                        {salesAnalyticsQuery.data.contactStatus.contacted}
                      </p>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <MessageSquare className="h-5 w-5 text-purple-600" />
                        <span className="text-xs font-medium text-purple-600">Responded</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-900">
                        {salesAnalyticsQuery.data.contactStatus.responded}
                      </p>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center justify-between mb-2">
                        <Calendar className="h-5 w-5 text-yellow-600" />
                        <span className="text-xs font-medium text-yellow-600">Scheduled</span>
                      </div>
                      <p className="text-2xl font-bold text-yellow-900">
                        {salesAnalyticsQuery.data.contactStatus.scheduled}
                      </p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <Trophy className="h-5 w-5 text-green-600" />
                        <span className="text-xs font-medium text-green-600">Closed Won</span>
                      </div>
                      <p className="text-2xl font-bold text-green-900">
                        {salesAnalyticsQuery.data.contactStatus.closed_won}
                      </p>
                    </div>

                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center justify-between mb-2">
                        <XOctagon className="h-5 w-5 text-red-600" />
                        <span className="text-xs font-medium text-red-600">Closed Lost</span>
                      </div>
                      <p className="text-2xl font-bold text-red-900">
                        {salesAnalyticsQuery.data.contactStatus.closed_lost}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Category Performance */}
                {Object.keys(salesAnalyticsQuery.data.categoryBreakdown).length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Category Performance</h3>
                    <div className="space-y-3">
                      {Object.entries(salesAnalyticsQuery.data.categoryBreakdown)
                        .sort(([, a], [, b]) => b - a)
                        .map(([category, count]) => (
                          <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Building2 className="h-5 w-5 text-primary-600" />
                              <span className="font-medium text-gray-900 capitalize">{category}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="text-sm font-semibold text-gray-900">{count} opportunities</span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Top Opportunities */}
                {salesAnalyticsQuery.data.topOpportunities.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Top Opportunities</h3>
                        <p className="text-sm text-gray-600">Highest risk companies not yet contacted</p>
                      </div>
                      <Award className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="space-y-3">
                      {salesAnalyticsQuery.data.topOpportunities.map((opportunity, index) => (
                        <div key={opportunity.companyId} className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-200">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
                              #{index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{opportunity.companyName}</p>
                              <a
                                href={opportunity.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-primary-600 hover:text-primary-700 inline-flex items-center"
                              >
                                <span>{opportunity.websiteUrl}</span>
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </div>
                          </div>
                          <div className="flex items-center space-x-6 text-sm">
                            <div className="text-right">
                              <p className="text-xs text-gray-600">Risk Score</p>
                              <p className="text-lg font-bold text-red-600">{opportunity.riskScore}%</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-600">Issues</p>
                              <p className="text-lg font-bold text-gray-900">{opportunity.totalIssues}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-600">Leads</p>
                              <p className="text-lg font-bold text-primary-600">{opportunity.leadsCount}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Average Risk Score */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-600 mb-2">Average Risk Score</h3>
                      <p className="text-4xl font-bold text-gray-900">{salesAnalyticsQuery.data.avgRiskScore}%</p>
                      <p className="text-xs text-gray-500 mt-2">Across all non-compliant companies</p>
                    </div>
                    <div className="h-24 w-24 rounded-full border-8 flex items-center justify-center" style={{
                      borderColor: salesAnalyticsQuery.data.avgRiskScore >= 70 ? '#dc2626' : 
                                   salesAnalyticsQuery.data.avgRiskScore >= 40 ? '#ea580c' : '#16a34a'
                    }}>
                      <AlertCircle className="h-12 w-12" style={{
                        color: salesAnalyticsQuery.data.avgRiskScore >= 70 ? '#dc2626' : 
                               salesAnalyticsQuery.data.avgRiskScore >= 40 ? '#ea580c' : '#16a34a'
                      }} />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <Repeat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Sales Data Yet</h3>
                <p className="text-gray-600 mb-6">Start a shuffle session to discover sales opportunities</p>
                <Button onClick={() => {
                  if (projects.length > 0) {
                    handleStartShuffle(projects[0].id);
                  } else {
                    toast.error("Create a project first");
                  }
                }}>
                  <Repeat className="h-5 w-5 mr-2" />
                  Start Shuffle
                </Button>
              </div>
            )}
          </div>
        )}
        
        {/* Projects Section - Always visible below tabs */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Projects</h2>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="h-5 w-5 mr-2" />
              New Project
            </Button>
          </div>
          
          {projectsQuery.isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-6">Create your first project to start auditing websites</p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-5 w-5 mr-2" />
                Create Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="group bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-primary-300 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                      {project.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-gray-500">
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {project.name}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{project.urlCount} URL{project.urlCount !== 1 ? 's' : ''}</span>
                    {project.lastScan && (
                      <span className="text-xs text-gray-500">
                        Last scan: {new Date(project.lastScan).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-900/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="mb-6">
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name
                </label>
                <input
                  id="projectName"
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="My Website Audit"
                  required
                />
              </div>
              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowCreateModal(false);
                    setProjectName("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  isLoading={createProjectMutation.isPending}
                >
                  Create
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Shuffle Modal */}
      {showShuffleModal && selectedProjectForShuffle && (
        <ShuffleModal
          projectId={selectedProjectForShuffle}
          isOpen={showShuffleModal}
          onClose={() => {
            setShowShuffleModal(false);
            setSelectedProjectForShuffle(null);
          }}
          onSubmit={handleShuffleSubmit}
          isLoading={shuffleMutation.isPending}
        />
      )}
    </DashboardLayout>
  );
}
