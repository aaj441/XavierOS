import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AlertCircle, AlertTriangle, Info, CheckCircle, ExternalLink, ArrowLeft, Code, Lightbulb, FileText, Shield, Share2, Copy } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { DashboardLayout } from "~/components/DashboardLayout";
import { Button } from "~/components/Button";
import { ShareReportModal } from "~/components/ShareReportModal";

export const Route = createFileRoute("/scans/$scanId/")({
  component: ScanDetailsPage,
});

function ScanDetailsPage() {
  const { scanId } = Route.useParams();
  const { authToken } = useAuthStore();
  const trpc = useTRPC();
  const navigate = useNavigate();
  
  const [generatedDocuments, setGeneratedDocuments] = useState<Array<{
    id: number;
    type: string;
    filename: string;
    title: string;
  }>>([]);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [documentToShare, setDocumentToShare] = useState<{
    id: number;
    title: string;
    type: string;
  } | null>(null);
  
  const scanQuery = useQuery(
    trpc.getScanDetails.queryOptions({
      authToken: authToken || "",
      scanId: parseInt(scanId),
    })
  );
  
  const minioBaseUrlQuery = useQuery(
    trpc.getMinioBaseUrl.queryOptions()
  );

  const exportPdfMutation = useMutation(
    trpc.exportScanPdf.mutationOptions()
  );

  const exportCsvMutation = useMutation(
    trpc.exportScanCsv.mutationOptions()
  );
  
  const generateExecutiveSummaryMutation = useMutation(
    trpc.generateExecutiveSummary.mutationOptions()
  );

  const generateComplianceDocMutation = useMutation(
    trpc.generateComplianceDocument.mutationOptions()
  );

  const shareReportMutation = useMutation(
    trpc.shareReportByEmail.mutationOptions()
  );
  
  const subscriptionQuery = useQuery(
    trpc.getSubscriptionStatus.queryOptions({ authToken: authToken || "" })
  );
  
  // Redirect if not authenticated - but AFTER all hooks are called
  if (!authToken) {
    navigate({ to: "/login" });
    return null;
  }
  
  const scan = scanQuery.data;
  
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="h-5 w-5" />;
      case "serious":
        return <AlertTriangle className="h-5 w-5" />;
      case "moderate":
        return <Info className="h-5 w-5" />;
      default:
        return <CheckCircle className="h-5 w-5" />;
    }
  };
  
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
  
  const groupedViolations = scan?.violations.reduce((acc, violation) => {
    if (!acc[violation.severity]) {
      acc[violation.severity] = [];
    }
    acc[violation.severity].push(violation);
    return acc;
  }, {} as Record<string, typeof scan.violations>);
  
  const handleExportPdf = async () => {
    if (!authToken || !minioBaseUrlQuery.data) return;
    
    const exportPromise = exportPdfMutation.mutateAsync({
      authToken,
      scanId: parseInt(scanId),
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

  const handleExportCsv = async () => {
    if (!authToken || !minioBaseUrlQuery.data) return;
    
    const exportPromise = exportCsvMutation.mutateAsync({
      authToken,
      scanId: parseInt(scanId),
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
  
  const handleGenerateExecutiveSummary = async () => {
    if (!authToken || !minioBaseUrlQuery.data) return;
    
    const generatePromise = generateExecutiveSummaryMutation.mutateAsync({
      authToken,
      scanId: parseInt(scanId),
      includeRecommendations: true,
    });
    
    toast.promise(generatePromise, {
      loading: "Generating executive summary...",
      success: "Executive summary generated successfully!",
      error: "Failed to generate executive summary",
    });
    
    try {
      const result = await generatePromise;
      
      // Add to generated documents list
      setGeneratedDocuments(prev => [...prev, {
        id: result.documentId,
        type: "executive_summary",
        filename: result.filename,
        title: `Executive Summary - ${scan?.url}`,
      }]);
      
      // Open the PDF in a new tab
      const pdfUrl = `${minioBaseUrlQuery.data.minioBaseUrl}/scan-reports/${result.filename}`;
      window.open(pdfUrl, "_blank");
    } catch (error) {
      // Error is already handled by toast.promise
    }
  };
  
  const handleGenerateComplianceDoc = async (isCourtReady: boolean = false) => {
    if (!authToken || !minioBaseUrlQuery.data) return;
    
    // Check if user has access to court-ready documents
    if (isCourtReady && subscriptionQuery.data) {
      const hasAccess = subscriptionQuery.data.plan.features.courtReadyDocuments;
      if (!hasAccess) {
        toast.error("Court-ready documents require a Professional or Enterprise subscription");
        return;
      }
    }
    
    const generatePromise = generateComplianceDocMutation.mutateAsync({
      authToken,
      scanId: parseInt(scanId),
      includeVPAT: false,
      isCourtReady,
    });
    
    toast.promise(generatePromise, {
      loading: `Generating ${isCourtReady ? "court-ready " : ""}compliance document...`,
      success: `${isCourtReady ? "Court-ready " : ""}Compliance document generated successfully!`,
      error: "Failed to generate compliance document",
    });
    
    try {
      const result = await generatePromise;
      
      // Add to generated documents list
      setGeneratedDocuments(prev => [...prev, {
        id: result.documentId,
        type: "compliance_report",
        filename: result.filename,
        title: `${isCourtReady ? "Court-Ready " : ""}Compliance Documentation - ${scan?.url}`,
      }]);
      
      // Open the PDF in a new tab
      const pdfUrl = `${minioBaseUrlQuery.data.minioBaseUrl}/scan-reports/${result.filename}`;
      window.open(pdfUrl, "_blank");
    } catch (error) {
      // Error is already handled by toast.promise
    }
  };
  
  const handleShareReport = (doc: { id: number; title: string; type: string }) => {
    setDocumentToShare(doc);
    setShareModalOpen(true);
  };
  
  const handleShareSubmit = async (data: { recipients: string[]; message?: string }) => {
    if (!authToken || !documentToShare) return;
    
    const sharePromise = shareReportMutation.mutateAsync({
      authToken,
      documentId: documentToShare.id,
      recipients: data.recipients,
      message: data.message,
      includeLink: true,
    });
    
    toast.promise(sharePromise, {
      loading: "Sharing report...",
      success: (result) => `Report shared with ${result.recipientCount} recipient${result.recipientCount !== 1 ? 's' : ''}!`,
      error: "Failed to share report",
    });
    
    try {
      await sharePromise;
      setShareModalOpen(false);
      setDocumentToShare(null);
    } catch (error) {
      // Error is already handled by toast.promise
    }
  };
  
  const handleCopySuggestion = (suggestion: string) => {
    navigator.clipboard.writeText(suggestion).then(() => {
      toast.success("Suggestion copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy to clipboard");
    });
  };
  
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {scanQuery.isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading scan results...</p>
          </div>
        ) : scan ? (
          <>
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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Accessibility Scan Report</h1>
                  <a
                    href={scan.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700 flex items-center space-x-2"
                  >
                    <span>{scan.url}</span>
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <p className="text-sm text-gray-600 mt-1">
                    Scanned on {new Date(scan.startedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Summary Cards */}
            {scan.report && (
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
                  <p className="text-3xl font-bold text-gray-900">{scan.report.riskScore}</p>
                  <p className="text-xs text-gray-600 mt-1">Risk Score</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
                  <p className="text-3xl font-bold text-gray-900">{scan.report.totalIssues}</p>
                  <p className="text-xs text-gray-600 mt-1">Total Issues</p>
                </div>
                <div className="bg-red-50 rounded-xl shadow-sm border border-red-200 p-4 text-center">
                  <p className="text-3xl font-bold text-red-600">{scan.report.criticalIssues}</p>
                  <p className="text-xs text-red-800 mt-1">Critical</p>
                </div>
                <div className="bg-orange-50 rounded-xl shadow-sm border border-orange-200 p-4 text-center">
                  <p className="text-3xl font-bold text-orange-600">{scan.report.seriousIssues}</p>
                  <p className="text-xs text-orange-800 mt-1">Serious</p>
                </div>
                <div className="bg-yellow-50 rounded-xl shadow-sm border border-yellow-200 p-4 text-center">
                  <p className="text-3xl font-bold text-yellow-600">{scan.report.moderateIssues}</p>
                  <p className="text-xs text-yellow-800 mt-1">Moderate</p>
                </div>
                <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-200 p-4 text-center">
                  <p className="text-3xl font-bold text-blue-600">{scan.report.minorIssues}</p>
                  <p className="text-xs text-blue-800 mt-1">Minor</p>
                </div>
              </div>
            )}
            
            {/* Violations */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Violations by Severity</h2>
              
              {["critical", "serious", "moderate", "minor"].map((severity) => {
                const violations = groupedViolations?.[severity] || [];
                if (violations.length === 0) return null;
                
                const colors = getSeverityColor(severity);
                
                return (
                  <div key={severity} className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${colors.bg}`}>
                        <div className={colors.icon}>
                          {getSeverityIcon(severity)}
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 capitalize">
                        {severity} Issues ({violations.length})
                      </h3>
                    </div>
                    
                    <div className="space-y-4">
                      {violations.map((violation) => (
                        <div
                          key={violation.id}
                          className={`${colors.bg} ${colors.border} border rounded-xl p-6 transition-all hover:shadow-md`}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <span className={`${colors.badge} px-3 py-1 rounded-full text-xs font-semibold uppercase`}>
                                  WCAG {violation.wcagLevel}
                                </span>
                                <span className={`${colors.badge} px-3 py-1 rounded-full text-xs font-semibold uppercase`}>
                                  {violation.risk} Risk
                                </span>
                              </div>
                              <h4 className={`text-lg font-semibold ${colors.text} mb-2`}>
                                {violation.description}
                              </h4>
                              <p className="text-sm text-gray-600 font-mono mb-4">
                                {violation.code}
                              </p>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <div className={`bg-white/50 rounded-lg p-4 border ${colors.border}`}>
                              <div className="flex items-start space-x-2 mb-2">
                                <Code className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm font-semibold text-gray-700">Affected Element:</span>
                              </div>
                              <pre className="text-sm text-gray-800 font-mono overflow-x-auto">
                                {violation.element}
                              </pre>
                            </div>
                            
                            <div className={`bg-white/50 rounded-lg p-4 border ${colors.border}`}>
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-start space-x-2 flex-1">
                                  <Lightbulb className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                                  <span className="text-sm font-semibold text-gray-700">Suggestion:</span>
                                </div>
                                <button
                                  onClick={() => handleCopySuggestion(violation.suggestion)}
                                  className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded transition-colors"
                                  title="Copy to clipboard"
                                >
                                  <Copy className="h-3 w-3" />
                                  <span>Copy</span>
                                </button>
                              </div>
                              <p className="text-sm text-gray-800">
                                {violation.suggestion}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Summary */}
            {scan.report && (
              <div className="mt-8 bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-8 border border-primary-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Summary</h3>
                <p className="text-gray-700 leading-relaxed">{scan.report.summary}</p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <Button 
                    variant="outline"
                    onClick={handleExportPdf}
                    isLoading={exportPdfMutation.isPending}
                    disabled={!minioBaseUrlQuery.data}
                  >
                    Export PDF
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleExportCsv}
                    isLoading={exportCsvMutation.isPending}
                    disabled={!minioBaseUrlQuery.data}
                  >
                    Export CSV
                  </Button>
                  <Button 
                    variant="secondary"
                    onClick={handleGenerateExecutiveSummary}
                    isLoading={generateExecutiveSummaryMutation.isPending}
                    disabled={!minioBaseUrlQuery.data}
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Executive Summary
                  </Button>
                  <Button 
                    variant="secondary"
                    onClick={() => handleGenerateComplianceDoc(false)}
                    isLoading={generateComplianceDocMutation.isPending}
                    disabled={!minioBaseUrlQuery.data}
                  >
                    <Shield className="h-5 w-5 mr-2" />
                    Compliance Document
                  </Button>
                  {subscriptionQuery.data?.plan.features.courtReadyDocuments && (
                    <Button 
                      variant="secondary"
                      onClick={() => handleGenerateComplianceDoc(true)}
                      isLoading={generateComplianceDocMutation.isPending}
                      disabled={!minioBaseUrlQuery.data}
                    >
                      <Shield className="h-5 w-5 mr-2" />
                      Court-Ready Document
                    </Button>
                  )}
                </div>
                
                {/* Generated Documents Section */}
                {generatedDocuments.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-primary-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Generated Reports</h4>
                    <div className="space-y-2">
                      {generatedDocuments.map((doc) => (
                        <div 
                          key={doc.id}
                          className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-primary-300 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            {doc.type === "executive_summary" ? (
                              <FileText className="h-5 w-5 text-primary-600" />
                            ) : (
                              <Shield className="h-5 w-5 text-primary-600" />
                            )}
                            <div>
                              <p className="text-sm font-medium text-gray-900">{doc.title}</p>
                              <p className="text-xs text-gray-500">{doc.type.replace(/_/g, ' ')}</p>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleShareReport({
                              id: doc.id,
                              title: doc.title,
                              type: doc.type,
                            })}
                          >
                            <Share2 className="h-4 w-4 mr-1" />
                            Share
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Scan not found</p>
          </div>
        )}
      </div>
      
      {/* Share Report Modal */}
      {documentToShare && (
        <ShareReportModal
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false);
            setDocumentToShare(null);
          }}
          onSubmit={handleShareSubmit}
          documentTitle={documentToShare.title}
          documentType={documentToShare.type}
          isLoading={shareReportMutation.isPending}
        />
      )}
    </DashboardLayout>
  );
}
