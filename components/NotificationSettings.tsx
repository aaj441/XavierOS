import { useState, useEffect } from "react";
import { Bell, Mail } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { Button } from "~/components/Button";

export function NotificationSettings() {
  const { authToken, user } = useAuthStore();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [receiveEmailNotifications, setReceiveEmailNotifications] = useState(true);
  const [notificationEmail, setNotificationEmail] = useState("");
  const [notifyOnScanComplete, setNotifyOnScanComplete] = useState(true);
  const [notifyOnScanError, setNotifyOnScanError] = useState(true);
  const [notifyOnScheduledScan, setNotifyOnScheduledScan] = useState(false);
  const [notifyOnReportGenerated, setNotifyOnReportGenerated] = useState(true);
  const [notifyOnReportDue, setNotifyOnReportDue] = useState(true);

  const updatePreferencesMutation = useMutation(
    trpc.updateNotificationPreferences.mutationOptions({
      onSuccess: () => {
        toast.success("Notification preferences updated!");
        queryClient.invalidateQueries({
          queryKey: trpc.getCurrentUser.queryKey(),
        });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to update preferences");
      },
    })
  );

  const handleSave = () => {
    if (!authToken) return;

    updatePreferencesMutation.mutate({
      authToken,
      receiveEmailNotifications,
      notificationEmail: notificationEmail || null,
      notifyOnScanComplete,
      notifyOnScanError,
      notifyOnScheduledScan,
      notifyOnReportGenerated,
      notifyOnReportDue,
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
          <Bell className="h-5 w-5 text-primary-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Email Notifications
          </h3>
          <p className="text-sm text-gray-600">
            Configure when you want to receive email alerts
          </p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">
              Enable Email Notifications
            </p>
            <p className="text-xs text-gray-600">
              Receive email alerts for scan events
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={receiveEmailNotifications}
              onChange={(e) => setReceiveEmailNotifications(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
          </label>
        </div>

        {receiveEmailNotifications && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alternative Email (optional)
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={notificationEmail}
                  onChange={(e) => setNotificationEmail(e.target.value)}
                  placeholder={user?.email || "your@email.com"}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Leave blank to use your account email
              </p>
            </div>

            <div className="border-t border-gray-200 pt-4 space-y-3">
              <p className="text-sm font-medium text-gray-900 mb-2">
                Notify me when:
              </p>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyOnScanComplete}
                  onChange={(e) => setNotifyOnScanComplete(e.target.checked)}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <div>
                  <p className="text-sm text-gray-900">Scan completes</p>
                  <p className="text-xs text-gray-600">
                    Get notified when a manual scan finishes
                  </p>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyOnScanError}
                  onChange={(e) => setNotifyOnScanError(e.target.checked)}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <div>
                  <p className="text-sm text-gray-900">Scan encounters an error</p>
                  <p className="text-xs text-gray-600">
                    Get alerts when scans fail
                  </p>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyOnScheduledScan}
                  onChange={(e) => setNotifyOnScheduledScan(e.target.checked)}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <div>
                  <p className="text-sm text-gray-900">Scheduled scan completes</p>
                  <p className="text-xs text-gray-600">
                    Get notified for automated scans
                  </p>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyOnReportGenerated}
                  onChange={(e) => setNotifyOnReportGenerated(e.target.checked)}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <div>
                  <p className="text-sm text-gray-900">Report is generated</p>
                  <p className="text-xs text-gray-600">
                    Get notified when scheduled reports are ready
                  </p>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyOnReportDue}
                  onChange={(e) => setNotifyOnReportDue(e.target.checked)}
                  className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <div>
                  <p className="text-sm text-gray-900">Report is due soon</p>
                  <p className="text-xs text-gray-600">
                    Get reminders before scheduled reports
                  </p>
                </div>
              </label>
            </div>
          </>
        )}
      </div>

      <Button
        onClick={handleSave}
        isLoading={updatePreferencesMutation.isPending}
        className="w-full"
      >
        Save Preferences
      </Button>
    </div>
  );
}
