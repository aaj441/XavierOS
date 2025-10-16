import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Bell, Clock, Calendar, Smartphone, Mail, MessageSquare, CheckCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { DashboardLayout } from "~/components/DashboardLayout";
import { Button } from "~/components/Button";
import { ScheduleModal } from "~/components/ScheduleModal";

export const Route = createFileRoute("/marketplace/monitoring")({
  component: MonitoringPage,
});

function MonitoringPage() {
  const { authToken } = useAuthStore();
  const trpc = useTRPC();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<{ id: number; url: string } | null>(null);
  
  const projectsQuery = useQuery(
    trpc.getProjects.queryOptions({ authToken: authToken || "" })
  );
  
  const subscriptionQuery = useQuery(
    trpc.getSubscriptionStatus.queryOptions({ authToken: authToken || "" })
  );
  
  const createScheduleMutation = useMutation(
    trpc.createSchedule.mutationOptions({
      onSuccess: () => {
        toast.success("Monitoring schedule created!");
        setShowScheduleModal(false);
        queryClient.invalidateQueries({ queryKey: trpc.getSchedules.queryKey() });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create schedule");
      },
    })
  );
  
  if (!authToken) {
    navigate({ to: "/login" });
    return null;
  }
  
  const handleScheduleSubmit = (data: {
    frequency: "daily" | "weekly" | "monthly";
    timeOfDay: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
  }) => {
    if (selectedUrl) {
      createScheduleMutation.mutate({
        authToken: authToken!,
        urlId: selectedUrl.id,
        enabled: true,
        ...data,
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Recurring Monitoring</h1>
          <p className="text-gray-600">
            24/7 compliance tracking with ADHD-friendly notifications
          </p>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <Calendar className="h-8 w-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Flexible Scheduling</h3>
            <p className="text-sm text-gray-600">
              Daily, weekly, or monthly scans at your preferred time
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <Bell className="h-8 w-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Smart Alerts</h3>
            <p className="text-sm text-gray-600">
              Email, SMS, and Slack notifications with quiet hours
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <Clock className="h-8 w-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Historical Tracking</h3>
            <p className="text-sm text-gray-600">
              Monitor compliance trends and detect regressions
            </p>
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <CheckCircle className="h-8 w-8 text-accent-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Gentle Reminders</h3>
            <p className="text-sm text-gray-600">
              ADHD-friendly notifications that don't overwhelm
            </p>
          </div>
        </div>
        
        {/* Setup Section */}
        <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Setup Monitoring</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select URL to Monitor
              </label>
              <select
                value={selectedUrl?.id || ""}
                onChange={(e) => {
                  const urlId = Number(e.target.value);
                  const project = projectsQuery.data?.find(p => 
                    p.urls.some(u => u.id === urlId)
                  );
                  const url = project?.urls.find(u => u.id === urlId);
                  if (url) {
                    setSelectedUrl({ id: url.id, url: url.url });
                  }
                }}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Choose a URL...</option>
                {projectsQuery.data?.map((project) =>
                  project.urls.map((url) => (
                    <option key={url.id} value={url.id}>
                      {url.url} ({project.name})
                    </option>
                  ))
                )}
              </select>
            </div>
            
            <Button
              size="lg"
              onClick={() => {
                if (selectedUrl) {
                  setShowScheduleModal(true);
                } else {
                  toast.error("Please select a URL to monitor");
                }
              }}
              disabled={!selectedUrl}
            >
              <Calendar className="h-5 w-5 mr-2" />
              Configure Schedule
            </Button>
          </div>
        </div>
        
        {/* Notification Channels */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Channels</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <Mail className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-sm text-gray-600 mb-4">
                Detailed scan reports delivered to your inbox
              </p>
              <div className="flex items-center text-sm text-green-600">
                <CheckCircle className="h-4 w-4 mr-2" />
                Included
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <Smartphone className="h-8 w-8 text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">SMS</h3>
              <p className="text-sm text-gray-600 mb-4">
                Instant text alerts for critical issues
              </p>
              <div className="flex items-center text-sm text-orange-600">
                <Bell className="h-4 w-4 mr-2" />
                Professional Plan
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <MessageSquare className="h-8 w-8 text-purple-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Slack</h3>
              <p className="text-sm text-gray-600 mb-4">
                Team notifications in your workspace
              </p>
              <div className="flex items-center text-sm text-orange-600">
                <Bell className="h-4 w-4 mr-2" />
                Enterprise Plan
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {selectedUrl && (
        <ScheduleModal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          onSubmit={handleScheduleSubmit}
          isLoading={createScheduleMutation.isPending}
        />
      )}
    </DashboardLayout>
  );
}
