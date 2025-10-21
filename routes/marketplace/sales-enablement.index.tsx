import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Upload, Zap, TrendingUp, Copy, Mail, Download, CheckCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { DashboardLayout } from "~/components/DashboardLayout";
import { Button } from "~/components/Button";
import { ServiceOnboardingModal } from "~/components/ServiceOnboardingModal";

export const Route = createFileRoute("/marketplace/sales-enablement")({
  component: SalesEnablementPage,
});

function SalesEnablementPage() {
  const { authToken } = useAuthStore();
  const trpc = useTRPC();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [category, setCategory] = useState("");
  const [demographics, setDemographics] = useState("");
  const [sitesToDiscover, setSitesToDiscover] = useState(20);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedCompanies, setSelectedCompanies] = useState<Set<number>>(new Set());
  const [scriptTone, setScriptTone] = useState<"professional" | "friendly" | "urgent">("professional");
  
  const projectsQuery = useQuery(
    trpc.getProjects.queryOptions({ authToken: authToken || "" })
  );
  
  const subscriptionQuery = useQuery(
    trpc.getSubscriptionStatus.queryOptions({ authToken: authToken || "" })
  );
  
  const shuffleMutation = useMutation(
    trpc.startShuffle.mutationOptions({
      onSuccess: () => {
        toast.success("Batch scan started! Processing in background...");
        setShowOnboarding(false);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to start batch scan");
      },
    })
  );
  
  const generateScriptMutation = useMutation(
    trpc.generateSalesScript.mutationOptions({
      onSuccess: (data) => {
        toast.success("Sales script generated!");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to generate script");
      },
    })
  );
  
  if (!authToken) {
    navigate({ to: "/login" });
    return null;
  }
  
  // Check if user has access to this service
  const hasAccess = subscriptionQuery.data?.plan.name !== "free";
  
  if (!hasAccess) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-12 border border-orange-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Upgrade Required</h1>
            <p className="text-gray-600 mb-6">
              Sales Enablement requires a Professional or Enterprise subscription.
            </p>
            <Button onClick={() => navigate({ to: "/settings" })}>
              Upgrade Plan
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  const onboardingSteps = [
    {
      id: "project",
      title: "Select Project",
      description: "Choose which project to add these leads to",
      content: (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project
          </label>
          <select
            value={selectedProjectId || ""}
            onChange={(e) => setSelectedProjectId(Number(e.target.value))}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select a project...</option>
            {projectsQuery.data?.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      ),
      validation: () => selectedProjectId !== null || "Please select a project",
    },
    {
      id: "batch",
      title: "Define Target Market",
      description: "Specify the category and demographics for site discovery",
      helpText: "We'll use Google Search to find websites matching your criteria",
      content: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category or Industry
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., dental clinics, restaurants, law firms"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Demographics (Optional)
            </label>
            <input
              type="text"
              value={demographics}
              onChange={(e) => setDemographics(e.target.value)}
              placeholder="e.g., in New York, small business"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Sites
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={sitesToDiscover}
              onChange={(e) => setSitesToDiscover(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      ),
      validation: () => category.trim() !== "" || "Please enter a category",
    },
    {
      id: "confirm",
      title: "Review & Start",
      description: "Confirm your batch scan settings",
      content: (
        <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-6 border border-primary-200">
          <h4 className="font-semibold text-gray-900 mb-4">Scan Configuration</h4>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Category:</dt>
              <dd className="font-medium text-gray-900">{category}</dd>
            </div>
            {demographics && (
              <div className="flex justify-between">
                <dt className="text-gray-600">Demographics:</dt>
                <dd className="font-medium text-gray-900">{demographics}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-gray-600">Sites to scan:</dt>
              <dd className="font-medium text-gray-900">{sitesToDiscover}</dd>
            </div>
            <div className="flex justify-between pt-2 border-t border-primary-200">
              <dt className="text-gray-600">Estimated time:</dt>
              <dd className="font-medium text-gray-900">{Math.ceil(sitesToDiscover * 0.5)} minutes</dd>
            </div>
          </dl>
        </div>
      ),
    },
  ];
  
  const handleOnboardingComplete = () => {
    if (selectedProjectId) {
      shuffleMutation.mutate({
        authToken: authToken!,
        projectId: selectedProjectId,
        category,
        demographics,
        sitesToDiscover,
      });
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales Enablement Suite</h1>
          <p className="text-gray-600">
            Batch scan competitors and generate AI-powered outreach scripts
          </p>
        </div>
        
        {/* Feature Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <Upload className="h-8 w-8 text-primary-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Batch Scanning</h3>
            <p className="text-sm text-gray-600">
              Scan up to 50 competitor sites simultaneously for accessibility issues
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <TrendingUp className="h-8 w-8 text-accent-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Deal Scoring</h3>
            <p className="text-sm text-gray-600">
              Rank prospects by accessibility risk to prioritize outreach
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <Zap className="h-8 w-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">AI Scripts</h3>
            <p className="text-sm text-gray-600">
              Generate personalized outreach emails with one click
            </p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
          <div className="text-center">
            <Button
              size="lg"
              onClick={() => setShowOnboarding(true)}
              isLoading={shuffleMutation.isPending}
            >
              <Upload className="h-5 w-5 mr-2" />
              Start Batch Scan
            </Button>
          </div>
        </div>
      </div>
      
      <ServiceOnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        title="Sales Enablement Setup"
        steps={onboardingSteps}
        onComplete={handleOnboardingComplete}
        isLoading={shuffleMutation.isPending}
      />
    </DashboardLayout>
  );
}
