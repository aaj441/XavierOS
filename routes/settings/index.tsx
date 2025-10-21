import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Settings2, CreditCard, Palette } from "lucide-react";
import { useAuthStore } from "~/stores/auth";
import { DashboardLayout } from "~/components/DashboardLayout";
import { NotificationSettings } from "~/components/NotificationSettings";

export const Route = createFileRoute("/settings/")({
  component: SettingsPage,
});

function SettingsPage() {
  const { authToken, subscription } = useAuthStore();
  const navigate = useNavigate();

  if (!authToken) {
    navigate({ to: "/login" });
    return null;
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Settings2 className="h-6 w-6 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>
          <p className="text-gray-600">Manage your account preferences and notifications</p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          <NotificationSettings />
          
          {/* White-Label Branding (Enterprise only) */}
          {subscription?.hasWhiteLabel && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    White-Label Branding
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Customize your platform's colors, logo, and domain
                  </p>
                </div>
                <Palette className="h-6 w-6 text-primary-600" />
              </div>
              <Link to="/settings/branding">
                <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
                  Customize Branding
                </button>
              </Link>
            </div>
          )}
          
          {/* Billing & Subscription */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Billing & Subscription
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Manage your plan, AI credits, and payment methods
                </p>
              </div>
              <CreditCard className="h-6 w-6 text-primary-600" />
            </div>
            <Link to="/settings/billing">
              <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium">
                Manage Billing
              </button>
            </Link>
          </div>

          {/* Additional settings sections can be added here */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Email Configuration Status
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Email notifications require SMTP configuration. Check your environment variables to enable this feature.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Required environment variables:</strong>
              </p>
              <ul className="text-xs text-blue-700 mt-2 space-y-1 ml-4 list-disc">
                <li>EMAIL_ENABLED=true</li>
                <li>EMAIL_HOST (e.g., smtp.gmail.com)</li>
                <li>EMAIL_PORT (e.g., 587)</li>
                <li>EMAIL_USER (your SMTP username)</li>
                <li>EMAIL_PASSWORD (your SMTP password)</li>
                <li>EMAIL_FROM (sender email address)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
