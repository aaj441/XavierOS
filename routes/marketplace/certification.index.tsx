import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Award, Shield, CheckCircle, Copy, Download, Share2, ExternalLink } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { DashboardLayout } from "~/components/DashboardLayout";
import { Button } from "~/components/Button";

export const Route = createFileRoute("/marketplace/certification")({
  component: CertificationPage,
});

function CertificationPage() {
  const { authToken } = useAuthStore();
  const trpc = useTRPC();
  const navigate = useNavigate();
  
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [certificateType, setCertificateType] = useState<"wcag_aa" | "wcag_aaa">("wcag_aa");
  const [businessName, setBusinessName] = useState("");
  const [badgeColor, setBadgeColor] = useState("#3B82F6");
  const [generatedCertificate, setGeneratedCertificate] = useState<any>(null);
  
  const projectsQuery = useQuery(
    trpc.getProjects.queryOptions({ authToken: authToken || "" })
  );
  
  const subscriptionQuery = useQuery(
    trpc.getSubscriptionStatus.queryOptions({ authToken: authToken || "" })
  );
  
  const analyticsQuery = useQuery(
    trpc.getAnalytics.queryOptions({
      authToken: authToken || "",
      days: 30,
    })
  );
  
  const generateCertificateMutation = useMutation(
    trpc.generateCertificate.mutationOptions({
      onSuccess: (data) => {
        toast.success("Certificate generated successfully!");
        setGeneratedCertificate(data);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to generate certificate");
      },
    })
  );
  
  if (!authToken) {
    navigate({ to: "/login" });
    return null;
  }
  
  const hasAccess = subscriptionQuery.data?.plan.name === "professional" || subscriptionQuery.data?.plan.name === "enterprise";
  
  if (!hasAccess) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-12 border border-orange-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Upgrade Required</h1>
            <p className="text-gray-600 mb-6">
              Compliance Certification requires a Professional or Enterprise subscription.
            </p>
            <Button onClick={() => navigate({ to: "/settings" })}>
              Upgrade Plan
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  const handleGenerateCertificate = () => {
    if (!selectedProjectId) {
      toast.error("Please select a project");
      return;
    }
    
    if (!businessName.trim()) {
      toast.error("Please enter your business name");
      return;
    }
    
    generateCertificateMutation.mutate({
      authToken: authToken!,
      projectId: selectedProjectId,
      certificateType,
      businessName: businessName.trim(),
      badgeColor,
    });
  };
  
  const copyBadgeCode = () => {
    if (generatedCertificate?.badgeHtml) {
      navigator.clipboard.writeText(generatedCertificate.badgeHtml);
      toast.success("Badge code copied to clipboard!");
    }
  };
  
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate({ to: "/marketplace" })}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Marketplace
        </Button>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Compliance Certification</h1>
          <p className="text-gray-600">
            Official WCAG certification with shareable badge
          </p>
        </div>
        
        {!generatedCertificate ? (
          <>
            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <Award className="h-8 w-8 text-purple-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Official Certificate</h3>
                <p className="text-sm text-gray-600">
                  Verified WCAG compliance certificate with unique ID
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <Shield className="h-8 w-8 text-green-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Trust Badge</h3>
                <p className="text-sm text-gray-600">
                  Display your commitment to accessibility on your site
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <ExternalLink className="h-8 w-8 text-blue-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">Public Directory</h3>
                <p className="text-sm text-gray-600">
                  Featured in our public directory of accessible businesses
                </p>
              </div>
            </div>
            
            {/* Application Form */}
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Apply for Certification</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Project
                  </label>
                  <select
                    value={selectedProjectId || ""}
                    onChange={(e) => setSelectedProjectId(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Choose a project...</option>
                    {projectsQuery.data?.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Your Company Name"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certification Level
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setCertificateType("wcag_aa")}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        certificateType === "wcag_aa"
                          ? "border-primary-600 bg-primary-50"
                          : "border-gray-200 hover:border-primary-300"
                      }`}
                    >
                      <h4 className="font-semibold text-gray-900 mb-1">WCAG 2.2 Level AA</h4>
                      <p className="text-xs text-gray-600">Industry standard</p>
                    </button>
                    
                    <button
                      onClick={() => setCertificateType("wcag_aaa")}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        certificateType === "wcag_aaa"
                          ? "border-primary-600 bg-primary-50"
                          : "border-gray-200 hover:border-primary-300"
                      }`}
                    >
                      <h4 className="font-semibold text-gray-900 mb-1">WCAG 2.2 Level AAA</h4>
                      <p className="text-xs text-gray-600">Enhanced compliance</p>
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Badge Color
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="color"
                      value={badgeColor}
                      onChange={(e) => setBadgeColor(e.target.value)}
                      className="h-12 w-24 rounded-lg border border-gray-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={badgeColor}
                      onChange={(e) => setBadgeColor(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 font-mono"
                    />
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button
                    size="lg"
                    onClick={handleGenerateCertificate}
                    isLoading={generateCertificateMutation.isPending}
                    disabled={!selectedProjectId || !businessName.trim()}
                  >
                    <Award className="h-5 w-5 mr-2" />
                    Generate Certificate
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Certificate Generated */
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8 border border-green-200 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Congratulations!</h2>
              <p className="text-lg text-gray-600 mb-6">
                Your WCAG compliance certificate has been generated
              </p>
              
              <div className="bg-white rounded-lg p-6 mb-6 inline-block">
                <div className="text-sm text-gray-600 mb-2">Certificate ID</div>
                <div className="text-2xl font-bold text-gray-900 font-mono">
                  {generatedCertificate.certificateId}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="primary">
                  <Download className="h-5 w-5 mr-2" />
                  Download Certificate
                </Button>
                <Button variant="secondary" onClick={copyBadgeCode}>
                  <Copy className="h-5 w-5 mr-2" />
                  Copy Badge Code
                </Button>
                <Button variant="outline">
                  <Share2 className="h-5 w-5 mr-2" />
                  Share on LinkedIn
                </Button>
              </div>
            </div>
            
            {/* Badge Preview */}
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Your Badge</h3>
              <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
                <div dangerouslySetInnerHTML={{ __html: generatedCertificate.badgeHtml }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
