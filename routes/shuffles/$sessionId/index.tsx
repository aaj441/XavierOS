import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Users, 
  ExternalLink,
  Linkedin,
  Building2,
  AlertCircle,
  TrendingUp,
  Repeat,
  Filter,
  ArrowUpDown,
  Download,
  Share2,
  Search,
  Zap,
  Target,
  Award,
  BarChart3,
  Mail,
  MessageSquare,
  Copy,
  Edit,
  Send,
  Phone,
  Calendar,
  Trophy,
  XOctagon
} from "lucide-react";
import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { DashboardLayout } from "~/components/DashboardLayout";
import { Button } from "~/components/Button";

export const Route = createFileRoute("/shuffles/$sessionId/")({
  component: ShuffleDetailsPage,
});

function ShuffleDetailsPage() {
  const { sessionId } = Route.useParams();
  const { authToken } = useAuthStore();
  const navigate = useNavigate();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "compliant" | "non-compliant" | "pending">("all");
  const [sortBy, setSortBy] = useState<"name" | "risk" | "issues" | "discovered">("risk");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [expandedCompanyId, setExpandedCompanyId] = useState<number | null>(null);
  const [showScriptModal, setShowScriptModal] = useState(false);
  const [selectedCompanyForScript, setSelectedCompanyForScript] = useState<number | null>(null);
  const [scriptTone, setScriptTone] = useState<"professional" | "friendly" | "urgent">("professional");
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedCompanyForNotes, setSelectedCompanyForNotes] = useState<number | null>(null);
  const [notesText, setNotesText] = useState("");
  
  const sessionQuery = useQuery(
    trpc.getShuffleDetails.queryOptions({
      authToken: authToken || "",
      sessionId: Number(sessionId),
    })
  );
  
  const generateScriptMutation = useMutation(
    trpc.generateScriptForCompany.mutationOptions({
      onSuccess: () => {
        toast.success("Sales script generated!");
        queryClient.invalidateQueries({ queryKey: ["getShuffleDetails"] });
        setShowScriptModal(false);
        setSelectedCompanyForScript(null);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to generate script");
      },
    })
  );
  
  const updateStatusMutation = useMutation(
    trpc.updateCompanyContactStatus.mutationOptions({
      onSuccess: () => {
        toast.success("Status updated!");
        queryClient.invalidateQueries({ queryKey: ["getShuffleDetails"] });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update status");
      },
    })
  );
  
  const handleGenerateScript = (companyId: number) => {
    setSelectedCompanyForScript(companyId);
    setShowScriptModal(true);
  };
  
  const handleConfirmGenerateScript = () => {
    if (selectedCompanyForScript && authToken) {
      generateScriptMutation.mutate({
        authToken,
        companyId: selectedCompanyForScript,
        tone: scriptTone,
      });
    }
  };
  
  const handleUpdateStatus = (companyId: number, status: string) => {
    if (authToken) {
      updateStatusMutation.mutate({
        authToken,
        companyId,
        status: status as any,
      });
    }
  };
  
  const handleAddNote = (companyId: number) => {
    setSelectedCompanyForNotes(companyId);
    const company = session?.companies.find(c => c.id === companyId);
    setNotesText(company?.notes || "");
    setShowNotesModal(true);
  };
  
  const handleConfirmAddNote = () => {
    if (selectedCompanyForNotes && authToken && notesText.trim()) {
      updateStatusMutation.mutate({
        authToken,
        companyId: selectedCompanyForNotes,
        status: session?.companies.find(c => c.id === selectedCompanyForNotes)?.contactStatus as any || "not_contacted",
        notes: notesText,
      });
      setShowNotesModal(false);
      setSelectedCompanyForNotes(null);
      setNotesText("");
    }
  };
  
  const handleCopyScript = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Script copied to clipboard!");
  };
  
  if (!authToken) {
    navigate({ to: "/login" });
    return null;
  }
  
  if (sessionQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading shuffle session...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  if (sessionQuery.isError || !sessionQuery.data) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Shuffle Session</h3>
            <p className="text-gray-600 mb-6">
              {sessionQuery.isError ? "Failed to load shuffle session details" : "Shuffle session not found"}
            </p>
            <Button onClick={() => navigate({ to: "/dashboard" })}>
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  const session = sessionQuery.data;
  
  const filteredAndSortedCompanies = useMemo(() => {
    if (!session) return [];
    
    let filtered = session.companies.filter((company) => {
      // Search filter
      const matchesSearch = company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           company.websiteUrl.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = 
        filterStatus === "all" ||
        (filterStatus === "compliant" && company.isCompliant === true) ||
        (filterStatus === "non-compliant" && company.isCompliant === false) ||
        (filterStatus === "pending" && company.isCompliant === null);
      
      return matchesSearch && matchesStatus;
    });
    
    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case "name":
          comparison = a.companyName.localeCompare(b.companyName);
          break;
        case "risk":
          comparison = (a.riskScore || 0) - (b.riskScore || 0);
          break;
        case "issues":
          comparison = (a.totalIssues || 0) - (b.totalIssues || 0);
          break;
        case "discovered":
          comparison = new Date(a.discoveredAt).getTime() - new Date(b.discoveredAt).getTime();
          break;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });
    
    return filtered;
  }, [session, searchTerm, filterStatus, sortBy, sortOrder]);
  
  const insights = useMemo(() => {
    if (!session) return null;
    
    const companies = session.companies;
    const scannedCompanies = companies.filter(c => c.isCompliant !== null);
    const avgRisk = scannedCompanies.length > 0 
      ? Math.round(scannedCompanies.reduce((sum, c) => sum + (c.riskScore || 0), 0) / scannedCompanies.length)
      : 0;
    const avgIssues = scannedCompanies.length > 0
      ? Math.round(scannedCompanies.reduce((sum, c) => sum + (c.totalIssues || 0), 0) / scannedCompanies.length)
      : 0;
    const companiesWithLeads = companies.filter(c => c.leads.length > 0).length;
    const totalLeads = companies.reduce((sum, c) => sum + c.leads.length, 0);
    const conversionRate = session.scannedSites > 0 
      ? Math.round((companiesWithLeads / session.scannedSites) * 100)
      : 0;
    
    return {
      avgRisk,
      avgIssues,
      companiesWithLeads,
      totalLeads,
      conversionRate,
      topIssueCompany: scannedCompanies.sort((a, b) => (b.totalIssues || 0) - (a.totalIssues || 0))[0],
      highestRiskCompany: scannedCompanies.sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0))[0],
    };
  }, [session]);
  
  const progress = useMemo(() => {
    if (!session || session.status !== "running") return null;
    
    const scannedPercentage = session.totalSites > 0 
      ? Math.round((session.scannedSites / session.totalSites) * 100)
      : 0;
    
    return {
      percentage: scannedPercentage,
      remaining: session.totalSites - session.scannedSites,
    };
  }, [session]);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-4 w-4 mr-1" />
            Completed
          </span>
        );
      case "running":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <Clock className="h-4 w-4 mr-1" />
            Running
          </span>
        );
      case "error":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <XCircle className="h-4 w-4 mr-1" />
            Error
          </span>
        );
      default:
        return null;
    }
  };
  
  const getComplianceIndicator = (isCompliant: boolean | null, riskScore: number | null) => {
    if (isCompliant === null || riskScore === null) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
          Pending
        </span>
      );
    }
    
    if (isCompliant) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Compliant ({riskScore}%)
        </span>
      );
    }
    
    return (
      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="h-3 w-3 mr-1" />
        Non-Compliant ({riskScore}%)
      </span>
    );
  };
  
  const getContactStatusBadge = (status: string | null) => {
    const statusConfig = {
      not_contacted: { label: "Not Contacted", color: "gray", icon: Mail },
      contacted: { label: "Contacted", color: "blue", icon: Send },
      responded: { label: "Responded", color: "purple", icon: MessageSquare },
      scheduled: { label: "Scheduled", color: "yellow", icon: Calendar },
      closed_won: { label: "Closed Won", color: "green", icon: Trophy },
      closed_lost: { label: "Closed Lost", color: "red", icon: XOctagon },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.not_contacted;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };
  
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: "/dashboard" })}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="h-16 w-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                <Repeat className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Shuffle Session
                </h1>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <span className="font-medium">{session.projectName}</span>
                  <span>•</span>
                  <span>{session.category}</span>
                  {session.demographics && (
                    <>
                      <span>•</span>
                      <span>{session.demographics}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center space-x-3 mt-2">
                  {getStatusBadge(session.status)}
                  <span className="text-xs text-gray-500">
                    Started {new Date(session.startedAt).toLocaleString()}
                  </span>
                  {session.finishedAt && (
                    <>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500">
                        Finished {new Date(session.finishedAt).toLocaleString()}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress Bar for Running Shuffles */}
        {session.status === "running" && progress && (
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-primary-50 rounded-xl shadow-sm border border-blue-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-blue-500 rounded-lg flex items-center justify-center animate-pulse">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Shuffle in Progress</h3>
                  <p className="text-sm text-gray-600">
                    {session.scannedSites} of {session.totalSites} sites scanned • {progress.remaining} remaining
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary-600">{progress.percentage}%</p>
                <p className="text-xs text-gray-500">Complete</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-primary-500 to-accent-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        )}
        
        {/* Discovery Insights */}
        {session.status === "completed" && insights && (
          <div className="mb-8 bg-gradient-to-br from-primary-50 via-accent-50 to-purple-50 rounded-xl shadow-sm border border-primary-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Discovery Insights</h3>
                <p className="text-sm text-gray-600">Key findings from your shuffle session</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <Target className="h-5 w-5 text-orange-500" />
                  <span className="text-xs font-medium text-gray-600">Avg Risk</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{insights.avgRisk}%</p>
                <p className="text-xs text-gray-500 mt-1">Across all scanned sites</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-xs font-medium text-gray-600">Avg Issues</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{insights.avgIssues}</p>
                <p className="text-xs text-gray-500 mt-1">Per site scanned</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <Users className="h-5 w-5 text-primary-500" />
                  <span className="text-xs font-medium text-gray-600">Lead Rate</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{insights.conversionRate}%</p>
                <p className="text-xs text-gray-500 mt-1">{insights.companiesWithLeads} companies with leads</p>
              </div>
              
              <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <Award className="h-5 w-5 text-green-500" />
                  <span className="text-xs font-medium text-gray-600">Compliance</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {session.totalSites > 0 ? Math.round((session.compliantSites / session.totalSites) * 100) : 0}%
                </p>
                <p className="text-xs text-gray-500 mt-1">{session.compliantSites} compliant sites</p>
              </div>
            </div>
            
            {insights.highestRiskCompany && (
              <div className="mt-4 p-4 bg-white/60 backdrop-blur rounded-lg border border-red-200">
                <p className="text-xs font-semibold text-gray-700 mb-1">Highest Risk Opportunity</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{insights.highestRiskCompany.companyName}</p>
                    <p className="text-sm text-gray-600">{insights.highestRiskCompany.totalIssues} issues found</p>
                  </div>
                  <span className="text-2xl font-bold text-red-600">{insights.highestRiskCompany.riskScore}%</span>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total Sites</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{session.totalSites}</p>
              </div>
              <Building2 className="h-8 w-8 text-gray-400" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Scanned</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{session.scannedSites}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Compliant</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{session.compliantSites}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Non-Compliant</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{session.nonCompliantSites}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Leads Generated</p>
                <p className="text-2xl font-bold text-primary-600 mt-1">{session.leadsGenerated}</p>
              </div>
              <Users className="h-8 w-8 text-primary-500" />
            </div>
          </div>
        </div>
        
        {/* Error Message */}
        {session.errorMessage && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">Error</p>
                <p className="text-sm text-red-800 mt-1">{session.errorMessage}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search companies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="all">All ({session.companies.length})</option>
                    <option value="compliant">Compliant ({session.compliantSites})</option>
                    <option value="non-compliant">Non-Compliant ({session.nonCompliantSites})</option>
                    <option value="pending">Pending ({session.companies.filter(c => c.isCompliant === null).length})</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <ArrowUpDown className="h-4 w-4 text-gray-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="risk">Risk Score</option>
                    <option value="issues">Issues Count</option>
                    <option value="name">Company Name</option>
                    <option value="discovered">Discovery Date</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                    className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    title={sortOrder === "asc" ? "Ascending" : "Descending"}
                  >
                    <ArrowUpDown className={`h-4 w-4 text-gray-600 ${sortOrder === "desc" ? "rotate-180" : ""} transition-transform`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <p className="text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredAndSortedCompanies.length}</span> of{" "}
                <span className="font-semibold text-gray-900">{session.companies.length}</span> companies
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">View:</span>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1 rounded ${viewMode === "list" ? "bg-primary-100 text-primary-700" : "bg-white text-gray-600"}`}
                >
                  List
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-1 rounded ${viewMode === "grid" ? "bg-primary-100 text-primary-700" : "bg-white text-gray-600"}`}
                >
                  Grid
                </button>
              </div>
            </div>
          </div>
          
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4 p-4" : "divide-y divide-gray-200"}>
            {filteredAndSortedCompanies.length === 0 ? (
              <div className="p-12 text-center col-span-2">
                <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  {searchTerm || filterStatus !== "all" ? "No companies match your filters" : "No companies discovered yet"}
                </p>
              </div>
            ) : (
              filteredAndSortedCompanies.map((company) => (
                <div key={company.id} className={`${viewMode === "list" ? "p-6" : "p-4"} hover:bg-gray-50 transition-colors group border-b border-gray-100 last:border-b-0`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {company.companyName}
                        </h3>
                        {getComplianceIndicator(company.isCompliant, company.riskScore)}
                        {getContactStatusBadge(company.contactStatus)}
                        {company.hubspotIntegration && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            <Zap className="h-3 w-3 mr-1" />
                            HubSpot
                          </span>
                        )}
                      </div>
                      <a
                        href={company.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 hover:text-primary-700 inline-flex items-center group/link"
                      >
                        <span className="group-hover/link:underline">{company.websiteUrl}</span>
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                      {company.totalIssues !== null && (
                        <p className="text-sm text-gray-600 mt-1">
                          {company.totalIssues} accessibility issue{company.totalIssues !== 1 ? 's' : ''} found
                          {company.riskScore !== null && (
                            <span className="ml-2 font-semibold text-gray-900">• {company.riskScore}% risk</span>
                          )}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {company.scanId && (
                        <Link
                          to={`/scans/${company.scanId}`}
                        >
                          <Button variant="outline" size="sm">
                            View Report
                          </Button>
                        </Link>
                      )}
                      
                      {!company.isCompliant && company.riskScore && company.riskScore >= 70 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateScript(company.id)}
                          disabled={generateScriptMutation.isPending}
                        >
                          <Zap className="h-4 w-4 mr-1" />
                          {company.salesScript ? "Regenerate Script" : "Generate Script"}
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {/* Sales Script Display */}
                  {company.salesScript && (
                    <div className="mt-4 p-4 bg-gradient-to-br from-primary-50 to-accent-50 rounded-lg border border-primary-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-primary-600" />
                          Sales Script ({company.salesScript.tone})
                        </h4>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleCopyScript(company.salesScript!.content)}
                            className="p-1.5 text-gray-600 hover:text-primary-600 hover:bg-white rounded transition-colors"
                            title="Copy to clipboard"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setExpandedCompanyId(expandedCompanyId === company.id ? null : company.id)}
                            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                          >
                            {expandedCompanyId === company.id ? "Hide" : "Show"}
                          </button>
                        </div>
                      </div>
                      
                      {expandedCompanyId === company.id && (
                        <div className="bg-white rounded p-3 text-sm text-gray-700 whitespace-pre-wrap border border-gray-200">
                          {company.salesScript.content}
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500 mt-2">
                        Generated {new Date(company.salesScript.generatedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                  
                  {/* Decision Makers */}
                  {company.leads.length > 0 && (
                    <div className="mt-4 pl-4 border-l-2 border-primary-200 bg-primary-50/50 rounded-r-lg p-3">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                        <Users className="h-4 w-4 mr-2 text-primary-600" />
                        Decision Makers ({company.leads.length})
                      </h4>
                      <div className={`grid ${viewMode === "grid" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"} gap-3`}>
                        {company.leads.map((lead) => (
                          <div
                            key={lead.id}
                            className="p-3 bg-white rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-sm transition-all"
                          >
                            <p className="font-medium text-gray-900 text-sm">{lead.name}</p>
                            <p className="text-xs text-gray-600 mt-1">{lead.title}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              {lead.linkedinUrl && (
                                <a
                                  href={lead.linkedinUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-xs text-blue-600 hover:text-blue-700"
                                >
                                  <Linkedin className="h-3 w-3 mr-1" />
                                  LinkedIn
                                </a>
                              )}
                              {lead.email && (
                                <a
                                  href={`mailto:${lead.email}`}
                                  className="inline-flex items-center text-xs text-gray-600 hover:text-gray-700"
                                >
                                  <Mail className="h-3 w-3 mr-1" />
                                  Email
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Actions and Status Management */}
                  <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <label className="text-xs font-medium text-gray-600">Status:</label>
                        <select
                          value={company.contactStatus || "not_contacted"}
                          onChange={(e) => handleUpdateStatus(company.id, e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          disabled={updateStatusMutation.isPending}
                        >
                          <option value="not_contacted">Not Contacted</option>
                          <option value="contacted">Contacted</option>
                          <option value="responded">Responded</option>
                          <option value="scheduled">Scheduled</option>
                          <option value="closed_won">Closed Won</option>
                          <option value="closed_lost">Closed Lost</option>
                        </select>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddNote(company.id)}
                      >
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Add Note
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      {company.contactedAt && (
                        <span>First contact: {new Date(company.contactedAt).toLocaleDateString()}</span>
                      )}
                      {company.lastContactedAt && (
                        <span>Last contact: {new Date(company.lastContactedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  
                  {/* Notes Display */}
                  {company.notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded border border-gray-200">
                      <h5 className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Notes
                      </h5>
                      <p className="text-xs text-gray-600 whitespace-pre-wrap">{company.notes}</p>
                    </div>
                  )}
                  
                  <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                    <span>Discovered: {new Date(company.discoveredAt).toLocaleString()}</span>
                    {company.scannedAt && (
                      <>
                        <span>•</span>
                        <span>Scanned: {new Date(company.scannedAt).toLocaleString()}</span>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Script Generation Modal */}
        {showScriptModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Sales Script</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Tone
                </label>
                <select
                  value={scriptTone}
                  onChange={(e) => setScriptTone(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="professional">Professional - Formal, business-focused</option>
                  <option value="friendly">Friendly - Warm, conversational</option>
                  <option value="urgent">Urgent - Direct, action-oriented</option>
                </select>
              </div>
              
              <p className="text-sm text-gray-600 mb-6">
                We'll generate a personalized outreach email based on the scan results and decision-makers found for this company.
              </p>
              
              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleConfirmGenerateScript}
                  isLoading={generateScriptMutation.isPending}
                  className="flex-1"
                >
                  Generate Script
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowScriptModal(false);
                    setSelectedCompanyForScript(null);
                  }}
                  disabled={generateScriptMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Notes Modal */}
        {showNotesModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Note</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note
                </label>
                <textarea
                  value={notesText}
                  onChange={(e) => setNotesText(e.target.value)}
                  placeholder="Add a note about this company or your interaction..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleConfirmAddNote}
                  isLoading={updateStatusMutation.isPending}
                  className="flex-1"
                  disabled={!notesText.trim()}
                >
                  Add Note
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNotesModal(false);
                    setSelectedCompanyForNotes(null);
                    setNotesText("");
                  }}
                  disabled={updateStatusMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
