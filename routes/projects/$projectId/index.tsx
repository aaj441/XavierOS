import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, ExternalLink, PlayCircle, CheckCircle, Clock, AlertTriangle, Loader2, Calendar, Trash2, Power, PowerOff, Repeat, Users, Building2, Shield, FileText, Info } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { DashboardLayout } from "~/components/DashboardLayout";
import { Button } from "~/components/Button";
import { ScheduleModal } from "~/components/ScheduleModal";
import { ShuffleModal } from "~/components/ShuffleModal";
import { LegalRiskCard } from "~/components/LegalRiskCard";

export const Route = createFileRoute("/projects/$projectId/")({
  component: ProjectDetailsPage,
});

function ProjectDetailsPage() {
  const { projectId } = Route.useParams();
  const [showAddUrlModal, setShowAddUrlModal] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedUrlForSchedule, setSelectedUrlForSchedule] = useState<number | null>(null);
  const [showShuffleModal, setShowShuffleModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"urls" | "schedules" | "shuffles" | "risk">("urls");
  const [showMetadataModal, setShowMetadataModal] = useState(false);
  const [showStatementModal, setShowStatementModal] = useState(false);
  const [metadataForm, setMetadataForm] = useState({
    industry: "",
    state: "",
    companySize: "" as "" | "small" | "medium" | "large" | "enterprise",
    estimatedRevenue: "" as "" | "under_1m" | "1m_25m" | "25m_plus",
    websiteTraffic: "",
  });
  const { authToken } = useAuthStore();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const projectQuery = useQuery(
    trpc.getProjectDetails.queryOptions({
      authToken: authToken || "",
      projectId: parseInt(projectId),
    })
  );
  
  const schedulesQuery = useQuery(
    trpc.getSchedules.queryOptions({
      authToken: authToken || "",
      projectId: parseInt(projectId),
    })
  );
  
  const shuffleSessionsQuery = useQuery(
    trpc.getShuffleSessions.queryOptions({
      authToken: authToken || "",
      projectId: parseInt(projectId),
    })
  );
  
  const riskQuery = useQuery(
    trpc.calculateLawsuitRisk.queryOptions({
      authToken: authToken || "",
      projectId: parseInt(projectId),
    })
  );
  
  const addUrlMutation = useMutation(
    trpc.addUrl.mutationOptions({
      onSuccess: () => {
        toast.success("URL added successfully!");
        queryClient.invalidateQueries({
          queryKey: trpc.getProjectDetails.queryKey(),
        });
        setShowAddUrlModal(false);
        setNewUrl("");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to add URL");
      },
    })
  );
  
  const startScanMutation = useMutation(
    trpc.startScan.mutationOptions({
      onSuccess: () => {
        toast.success("Scan started!");
        // Clear any existing polling interval
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
        }
        // Poll for updates
        pollingIntervalRef.current = setInterval(() => {
          queryClient.invalidateQueries({
            queryKey: trpc.getProjectDetails.queryKey(),
          });
        }, 3000);
        
        // Stop polling after 15 seconds
        setTimeout(() => {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }, 15000);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to start scan");
      },
    })
  );
  
  const createScheduleMutation = useMutation(
    trpc.createSchedule.mutationOptions({
      onSuccess: () => {
        toast.success("Schedule created!");
        queryClient.invalidateQueries({
          queryKey: trpc.getSchedules.queryKey(),
        });
        setShowScheduleModal(false);
        setSelectedUrlForSchedule(null);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create schedule");
      },
    })
  );
  
  const updateScheduleMutation = useMutation(
    trpc.updateSchedule.mutationOptions({
      onSuccess: () => {
        toast.success("Schedule updated!");
        queryClient.invalidateQueries({
          queryKey: trpc.getSchedules.queryKey(),
        });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update schedule");
      },
    })
  );
  
  const deleteScheduleMutation = useMutation(
    trpc.deleteSchedule.mutationOptions({
      onSuccess: () => {
        toast.success("Schedule deleted!");
        queryClient.invalidateQueries({
          queryKey: trpc.getSchedules.queryKey(),
        });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete schedule");
      },
    })
  );
  
  const shuffleMutation = useMutation(
    trpc.startShuffle.mutationOptions({
      onSuccess: (data) => {
        toast.success("Shuffle started! Processing sites in the background...");
        setShowShuffleModal(false);
        queryClient.invalidateQueries({
          queryKey: trpc.getShuffleSessions.queryKey(),
        });
        navigate({ to: `/shuffles/${data.sessionId}` });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to start shuffle");
      },
    })
  );
  
  const updateMetadataMutation = useMutation(
    trpc.updateProjectMetadata.mutationOptions({
      onSuccess: () => {
        toast.success("Project information updated!");
        queryClient.invalidateQueries({
          queryKey: trpc.getProjectDetails.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.calculateLawsuitRisk.queryKey(),
        });
        setShowMetadataModal(false);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update project information");
      },
    })
  );
  
  const generateStatementMutation = useMutation(
    trpc.generateAccessibilityStatement.mutationOptions({
      onSuccess: (data) => {
        toast.success("Accessibility statement generated!");
        setShowStatementModal(false);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to generate statement");
      },
    })
  );
  
  // Cleanup polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);
  
  const project = projectQuery.data;
  
  // Initialize metadata form when project loads
  useEffect(() => {
    if (project) {
      setMetadataForm({
        industry: project.industry || "",
        state: project.state || "",
        companySize: (project.companySize as "" | "small" | "medium" | "large" | "enterprise") || "",
        estimatedRevenue: (project.estimatedRevenue as "" | "under_1m" | "1m_25m" | "25m_plus") || "",
        websiteTraffic: project.websiteTraffic?.toString() || "",
      });
    }
  }, [project]);
  
  // Redirect if not authenticated - but AFTER all hooks are called
  if (!authToken) {
    navigate({ to: "/login" });
    return null;
  }
  
  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (newUrl.trim()) {
      addUrlMutation.mutate({
        authToken: authToken!,
        projectId: parseInt(projectId),
        url: newUrl,
      });
    }
  };
  
  const handleStartScan = (urlId: number) => {
    startScanMutation.mutate({ authToken: authToken!, urlId });
  };
  
  const handleCreateSchedule = (data: {
    frequency: "daily" | "weekly" | "monthly";
    timeOfDay: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
  }) => {
    if (!selectedUrlForSchedule) return;
    
    createScheduleMutation.mutate({
      authToken: authToken!,
      urlId: selectedUrlForSchedule,
      ...data,
    });
  };
  
  const handleToggleSchedule = (scheduleId: number, enabled: boolean) => {
    updateScheduleMutation.mutate({
      authToken: authToken!,
      scheduleId,
      enabled: !enabled,
    });
  };
  
  const handleDeleteSchedule = (scheduleId: number) => {
    if (confirm("Are you sure you want to delete this schedule?")) {
      deleteScheduleMutation.mutate({
        authToken: authToken!,
        scheduleId,
      });
    }
  };
  
  const handleShuffleSubmit = (data: { category: string; demographics?: string; sitesToDiscover: number }) => {
    shuffleMutation.mutate({
      authToken: authToken!,
      projectId: parseInt(projectId),
      category: data.category,
      demographics: data.demographics,
      sitesToDiscover: data.sitesToDiscover,
    });
  };
  
  const handleUpdateMetadata = (e: React.FormEvent) => {
    e.preventDefault();
    updateMetadataMutation.mutate({
      authToken: authToken!,
      projectId: parseInt(projectId),
      industry: metadataForm.industry || undefined,
      state: metadataForm.state || undefined,
      companySize: metadataForm.companySize || undefined,
      estimatedRevenue: metadataForm.estimatedRevenue || undefined,
      websiteTraffic: metadataForm.websiteTraffic ? parseInt(metadataForm.websiteTraffic) : undefined,
    });
  };
  
  const handleGenerateStatement = () => {
    generateStatementMutation.mutate({
      authToken: authToken!,
      projectId: parseInt(projectId),
      isPremium: false,
    });
  };
  
  const getFrequencyLabel = (
    frequency: string,
    dayOfWeek?: number | null,
    dayOfMonth?: number | null
  ) => {
    if (frequency === "daily") return "Daily";
    if (frequency === "weekly") {
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      return `Weekly on ${days[dayOfWeek || 0]}`;
    }
    if (frequency === "monthly") {
      return `Monthly on day ${dayOfMonth}`;
    }
    return frequency;
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "scanning":
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "scanning":
        return "bg-blue-100 text-blue-800";
      case "error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {projectQuery.isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading project...</p>
          </div>
        ) : project ? (
          <>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
              <p className="text-gray-600">
                Created {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>
            
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab("urls")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "urls"
                      ? "border-primary-600 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  URLs
                </button>
                <button
                  onClick={() => setActiveTab("schedules")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "schedules"
                      ? "border-primary-600 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Schedules
                  {schedulesQuery.data && schedulesQuery.data.length > 0 && (
                    <span className="ml-2 bg-primary-100 text-primary-600 py-0.5 px-2 rounded-full text-xs">
                      {schedulesQuery.data.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("shuffles")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "shuffles"
                      ? "border-primary-600 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Shuffles
                  {shuffleSessionsQuery.data && shuffleSessionsQuery.data.length > 0 && (
                    <span className="ml-2 bg-primary-100 text-primary-600 py-0.5 px-2 rounded-full text-xs">
                      {shuffleSessionsQuery.data.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("risk")}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === "risk"
                      ? "border-primary-600 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span>Risk Assessment</span>
                  </div>
                </button>
              </nav>
            </div>
            
            {/* URLs Tab */}
            {activeTab === "urls" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">URLs</h2>
                  <Button onClick={() => setShowAddUrlModal(true)}>
                    <Plus className="h-5 w-5 mr-2" />
                    Add URL
                  </Button>
                </div>
                
                {project.urls.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <ExternalLink className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No URLs yet</h3>
                    <p className="text-gray-600 mb-6">Add a URL to start scanning for accessibility issues</p>
                    <Button onClick={() => setShowAddUrlModal(true)}>
                      <Plus className="h-5 w-5 mr-2" />
                      Add URL
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {project.urls.map((url) => (
                      <div
                        key={url.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-2">
                              <a
                                href={url.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-lg font-semibold text-primary-600 hover:text-primary-700 flex items-center space-x-2"
                              >
                                <span className="truncate">{url.url}</span>
                                <ExternalLink className="h-4 w-4 flex-shrink-0" />
                              </a>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(url.status)}`}>
                                {getStatusIcon(url.status)}
                                <span className="capitalize">{url.status}</span>
                              </span>
                              {url.lastScan && (
                                <span className="text-sm text-gray-500">
                                  Last scan: {new Date(url.lastScan).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedUrlForSchedule(url.id);
                                setShowScheduleModal(true);
                              }}
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              Schedule
                            </Button>
                            {url.status !== "scanning" && (
                              <Button
                                size="sm"
                                onClick={() => handleStartScan(url.id)}
                                isLoading={startScanMutation.isPending}
                              >
                                <PlayCircle className="h-4 w-4 mr-2" />
                                Scan
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {url.latestScan && url.latestScan.status === "completed" && url.latestScan.report && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                              <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900">{url.latestScan.report.riskScore}</p>
                                <p className="text-xs text-gray-600">Risk Score</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-red-600">{url.latestScan.report.criticalIssues}</p>
                                <p className="text-xs text-gray-600">Critical</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-orange-600">{url.latestScan.report.seriousIssues}</p>
                                <p className="text-xs text-gray-600">Serious</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-yellow-600">{url.latestScan.report.moderateIssues}</p>
                                <p className="text-xs text-gray-600">Moderate</p>
                              </div>
                              <div className="text-center">
                                <p className="text-2xl font-bold text-blue-600">{url.latestScan.report.minorIssues}</p>
                                <p className="text-xs text-gray-600">Minor</p>
                              </div>
                            </div>
                            <div className="mt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => navigate({ to: `/scans/${url.latestScan!.id}` })}
                              >
                                View Full Report
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            
            {/* Schedules Tab */}
            {activeTab === "schedules" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Scan Schedules</h2>
                </div>
                
                {schedulesQuery.isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading schedules...</p>
                  </div>
                ) : !schedulesQuery.data || schedulesQuery.data.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No schedules yet</h3>
                    <p className="text-gray-600 mb-6">Create automated scan schedules for your URLs</p>
                    <Button onClick={() => setActiveTab("urls")}>
                      Go to URLs
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {schedulesQuery.data.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">
                                {schedule.url.url}
                              </h3>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  schedule.enabled
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {schedule.enabled ? "Active" : "Paused"}
                              </span>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              <p>
                                <span className="font-medium">Frequency:</span>{" "}
                                {getFrequencyLabel(schedule.frequency, schedule.dayOfWeek, schedule.dayOfMonth)} at {schedule.timeOfDay}
                              </p>
                              {schedule.nextRunAt && (
                                <p>
                                  <span className="font-medium">Next run:</span>{" "}
                                  {new Date(schedule.nextRunAt).toLocaleString()}
                                </p>
                              )}
                              {schedule.lastRunAt && (
                                <p>
                                  <span className="font-medium">Last run:</span>{" "}
                                  {new Date(schedule.lastRunAt).toLocaleString()}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleSchedule(schedule.id, schedule.enabled)}
                              isLoading={updateScheduleMutation.isPending}
                            >
                              {schedule.enabled ? (
                                <>
                                  <PowerOff className="h-4 w-4 mr-2" />
                                  Pause
                                </>
                              ) : (
                                <>
                                  <Power className="h-4 w-4 mr-2" />
                                  Enable
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteSchedule(schedule.id)}
                              isLoading={deleteScheduleMutation.isPending}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            
            {/* Shuffles Tab */}
            {activeTab === "shuffles" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Shuffle Sessions</h2>
                  <Button onClick={() => setShowShuffleModal(true)}>
                    <Repeat className="h-5 w-5 mr-2" />
                    New Shuffle
                  </Button>
                </div>
                
                {shuffleSessionsQuery.isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading shuffle sessions...</p>
                  </div>
                ) : !shuffleSessionsQuery.data || shuffleSessionsQuery.data.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <Repeat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No shuffle sessions yet</h3>
                    <p className="text-gray-600 mb-6">
                      Discover and audit websites by category, extract leads, and integrate with HubSpot
                    </p>
                    <Button onClick={() => setShowShuffleModal(true)}>
                      <Repeat className="h-5 w-5 mr-2" />
                      Start Shuffle
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {shuffleSessionsQuery.data.map((session) => (
                      <div
                        key={session.id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => navigate({ to: `/shuffles/${session.id}` })}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {session.category}
                              </h3>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  session.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : session.status === "running"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {session.status === "completed" && <CheckCircle className="h-3 w-3 mr-1" />}
                                {session.status === "running" && <Clock className="h-3 w-3 mr-1" />}
                                {session.status === "error" && <AlertTriangle className="h-3 w-3 mr-1" />}
                                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                              </span>
                            </div>
                            {session.demographics && (
                              <p className="text-sm text-gray-600 mb-2">{session.demographics}</p>
                            )}
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>Started {new Date(session.startedAt).toLocaleString()}</span>
                              {session.finishedAt && (
                                <>
                                  <span>•</span>
                                  <span>Finished {new Date(session.finishedAt).toLocaleString()}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4 pt-4 border-t border-gray-200">
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1">
                              <Building2 className="h-4 w-4 text-gray-400 mr-1" />
                              <p className="text-lg font-bold text-gray-900">{session.totalSites}</p>
                            </div>
                            <p className="text-xs text-gray-600">Sites</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-blue-600">{session.scannedSites}</p>
                            <p className="text-xs text-gray-600">Scanned</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-green-600">{session.compliantSites}</p>
                            <p className="text-xs text-gray-600">Compliant</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-red-600">{session.nonCompliantSites}</p>
                            <p className="text-xs text-gray-600">Non-Compliant</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center mb-1">
                              <Users className="h-4 w-4 text-primary-400 mr-1" />
                              <p className="text-lg font-bold text-primary-600">{session.leadsGenerated}</p>
                            </div>
                            <p className="text-xs text-gray-600">Leads</p>
                          </div>
                        </div>
                        
                        {session.errorMessage && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">{session.errorMessage}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            
            {/* Risk Assessment Tab */}
            {activeTab === "risk" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Lawsuit Risk Assessment</h2>
                    <p className="text-gray-600 mt-1">
                      Understand your legal exposure based on industry data and current violations
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateStatement}
                      isLoading={generateStatementMutation.isPending}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Statement
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMetadataModal(true)}
                    >
                      <Info className="h-4 w-4 mr-2" />
                      Update Info
                    </Button>
                  </div>
                </div>
                
                {riskQuery.isLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Calculating risk assessment...</p>
                  </div>
                ) : riskQuery.data ? (
                  <LegalRiskCard
                    riskData={riskQuery.data}
                    onUpdateInfo={() => setShowMetadataModal(true)}
                    showDetailedBreakdown={true}
                  />
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Complete Your Profile</h3>
                    <p className="text-gray-600 mb-6">
                      Provide your business information to get a personalized lawsuit risk assessment
                    </p>
                    <Button onClick={() => setShowMetadataModal(true)}>
                      <Info className="h-5 w-5 mr-2" />
                      Add Business Information
                    </Button>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Project not found</p>
          </div>
        )}
      </div>
      
      {/* Add URL Modal */}
      {showAddUrlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-900/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add URL</h2>
            <form onSubmit={handleAddUrl}>
              <div className="mb-6">
                <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                  Website URL
                </label>
                <input
                  id="url"
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="https://example.com"
                  required
                />
              </div>
              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowAddUrlModal(false);
                    setNewUrl("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  isLoading={addUrlMutation.isPending}
                >
                  Add URL
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Schedule Modal */}
      <ScheduleModal
        isOpen={showScheduleModal}
        onClose={() => {
          setShowScheduleModal(false);
          setSelectedUrlForSchedule(null);
        }}
        onSubmit={handleCreateSchedule}
        isLoading={createScheduleMutation.isPending}
      />
      
      {/* Shuffle Modal */}
      <ShuffleModal
        projectId={parseInt(projectId)}
        isOpen={showShuffleModal}
        onClose={() => setShowShuffleModal(false)}
        onSubmit={handleShuffleSubmit}
        isLoading={shuffleMutation.isPending}
      />
      
      {/* Update Metadata Modal */}
      {showMetadataModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-900/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Business Information</h2>
            <p className="text-sm text-gray-600 mb-6">
              This information helps us calculate your personalized lawsuit risk assessment based on industry trends and state litigation data.
            </p>
            <form onSubmit={handleUpdateMetadata}>
              <div className="space-y-4 mb-6">
                <div>
                  <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                    Industry
                  </label>
                  <select
                    id="industry"
                    value={metadataForm.industry}
                    onChange={(e) => setMetadataForm({ ...metadataForm, industry: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select industry</option>
                    <option value="retail">Retail</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="hospitality">Hospitality (Hotels, Restaurants)</option>
                    <option value="finance">Finance</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="education">Education</option>
                    <option value="technology">Technology</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                    State (Primary Location)
                  </label>
                  <select
                    id="state"
                    value={metadataForm.state}
                    onChange={(e) => setMetadataForm({ ...metadataForm, state: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select state</option>
                    <option value="CA">California</option>
                    <option value="NY">New York</option>
                    <option value="FL">Florida</option>
                    <option value="IL">Illinois</option>
                    <option value="PA">Pennsylvania</option>
                    <option value="TX">Texas</option>
                    <option value="NJ">New Jersey</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Size
                  </label>
                  <select
                    id="companySize"
                    value={metadataForm.companySize}
                    onChange={(e) => setMetadataForm({ ...metadataForm, companySize: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select size</option>
                    <option value="small">Small (1-50 employees)</option>
                    <option value="medium">Medium (51-250 employees)</option>
                    <option value="large">Large (251-1000 employees)</option>
                    <option value="enterprise">Enterprise (1000+ employees)</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="estimatedRevenue" className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Annual Revenue
                  </label>
                  <select
                    id="estimatedRevenue"
                    value={metadataForm.estimatedRevenue}
                    onChange={(e) => setMetadataForm({ ...metadataForm, estimatedRevenue: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select revenue range</option>
                    <option value="under_1m">Under $1M</option>
                    <option value="1m_25m">$1M - $25M</option>
                    <option value="25m_plus">$25M+</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="websiteTraffic" className="block text-sm font-medium text-gray-700 mb-2">
                    Monthly Website Visitors (Optional)
                  </label>
                  <input
                    id="websiteTraffic"
                    type="number"
                    value={metadataForm.websiteTraffic}
                    onChange={(e) => setMetadataForm({ ...metadataForm, websiteTraffic: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    placeholder="e.g., 10000"
                  />
                </div>
              </div>
              
              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowMetadataModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  isLoading={updateMetadataMutation.isPending}
                >
                  Save Information
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
