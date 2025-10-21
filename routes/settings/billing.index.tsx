import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Crown, Zap, Check, ArrowRight, CreditCard, Download, TrendingUp } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { DashboardLayout } from "~/components/DashboardLayout";
import { Button } from "~/components/Button";

export const Route = createFileRoute("/settings/billing/")({
  component: BillingPage,
});

function BillingPage() {
  const [showCreditPurchaseModal, setShowCreditPurchaseModal] = useState(false);
  const [creditsToPurchase, setCreditsToPurchase] = useState(100);
  const { authToken } = useAuthStore();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const subscriptionQuery = useQuery(
    trpc.getSubscriptionStatus.queryOptions({ authToken: authToken || "" })
  );
  
  const plansQuery = useQuery(
    trpc.getAvailablePlans.queryOptions()
  );
  
  const purchaseCreditsMutation = useMutation(
    trpc.purchaseAiCredits.mutationOptions({
      onSuccess: (data) => {
        toast.success(`Successfully purchased ${data.creditsPurchased} AI credits!`);
        queryClient.invalidateQueries({ queryKey: trpc.getSubscriptionStatus.queryKey() });
        setShowCreditPurchaseModal(false);
        setCreditsToPurchase(100);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to purchase credits");
      },
    })
  );
  
  if (!authToken) {
    navigate({ to: "/login" });
    return null;
  }
  
  const handlePurchaseCredits = () => {
    purchaseCreditsMutation.mutate({
      authToken: authToken!,
      credits: creditsToPurchase,
    });
  };
  
  const subscription = subscriptionQuery.data;
  const plans = plansQuery.data?.plans || [];
  
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
          </div>
          <p className="text-gray-600">Manage your subscription, credits, and payment methods</p>
        </div>
        
        {/* Current Plan */}
        {subscription && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Current Plan</h2>
            <div className={`rounded-xl p-6 border-2 ${
              subscription.plan.name === "free"
                ? "bg-gray-50 border-gray-200"
                : "bg-gradient-to-br from-primary-50 to-accent-50 border-primary-200"
            }`}>
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    {subscription.plan.name !== "free" && <Crown className="h-6 w-6 text-primary-600" />}
                    <h3 className="text-2xl font-bold text-gray-900">{subscription.plan.displayName}</h3>
                  </div>
                  <p className="text-gray-600">{subscription.plan.description}</p>
                  {subscription.billing && (
                    <p className="text-sm text-gray-500 mt-2">
                      {subscription.billing.status === "active" && (
                        <>
                          Renews on {new Date(subscription.billing.currentPeriodEnd).toLocaleDateString()}
                        </>
                      )}
                    </p>
                  )}
                </div>
                {subscription.plan.name === "free" && (
                  <Button>
                    <Crown className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </Button>
                )}
              </div>
              
              {/* Usage Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Projects</span>
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-gray-900">{subscription.usage.projectsUsed}</span>
                    <span className="text-sm text-gray-500">/ {subscription.plan.features.maxProjects}</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, (subscription.usage.projectsUsed / subscription.plan.features.maxProjects) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Scans This Month</span>
                    <TrendingUp className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-gray-900">{subscription.usage.scansThisMonth}</span>
                    <span className="text-sm text-gray-500">/ {subscription.plan.features.maxScansPerMonth}</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, (subscription.usage.scansThisMonth / subscription.plan.features.maxScansPerMonth) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">AI Credits</span>
                    <Zap className="h-4 w-4 text-yellow-500" />
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-gray-900">{subscription.aiCredits.balance}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => setShowCreditPurchaseModal(true)}
                  >
                    Purchase More
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Available Plans */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Available Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`rounded-xl p-6 border-2 transition-all hover:shadow-lg ${
                  plan.name === subscription?.plan.name
                    ? "border-primary-600 bg-primary-50"
                    : "border-gray-200 bg-white hover:border-primary-300"
                }`}
              >
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.displayName}</h3>
                  <div className="flex items-baseline space-x-1 mb-2">
                    <span className="text-3xl font-bold text-gray-900">
                      ${(plan.pricing.monthly / 100).toFixed(0)}
                    </span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  {plan.pricing.annualSavings > 0 && (
                    <p className="text-xs text-green-600 font-medium">
                      Save ${(plan.pricing.annualSavings / 100).toFixed(0)}/year with annual billing
                    </p>
                  )}
                </div>
                
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start space-x-2 text-sm">
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{plan.limits.projects === -1 ? "Unlimited" : plan.limits.projects} projects</span>
                  </li>
                  <li className="flex items-start space-x-2 text-sm">
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{plan.limits.scansPerMonth === -1 ? "Unlimited" : plan.limits.scansPerMonth} scans/month</span>
                  </li>
                  <li className="flex items-start space-x-2 text-sm">
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{plan.aiCredits.included} AI credits/month</span>
                  </li>
                  {plan.features.advancedReports && (
                    <li className="flex items-start space-x-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Advanced reports</span>
                    </li>
                  )}
                  {plan.features.priorityProcessing && (
                    <li className="flex items-start space-x-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Priority processing</span>
                    </li>
                  )}
                  {plan.features.courtReadyDocuments && (
                    <li className="flex items-start space-x-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Court-ready documents</span>
                    </li>
                  )}
                  {plan.features.certification && (
                    <li className="flex items-start space-x-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Compliance certification</span>
                    </li>
                  )}
                </ul>
                
                {plan.name === subscription?.plan.name ? (
                  <div className="text-center py-2 px-4 bg-primary-600 text-white rounded-lg font-medium">
                    Current Plan
                  </div>
                ) : (
                  <Button className="w-full">
                    {plan.name === "free" ? "Downgrade" : "Upgrade"}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Feature Comparison */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Feature</th>
                  {plans.map((plan) => (
                    <th key={plan.id} className="text-center py-3 px-4 font-semibold text-gray-900">
                      {plan.displayName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-3 px-4 text-gray-700">API Access</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="text-center py-3 px-4">
                      {plan.features.apiAccess ? (
                        <Check className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">White Label</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="text-center py-3 px-4">
                      {plan.features.whiteLabel ? (
                        <Check className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">Data Vault</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="text-center py-3 px-4">
                      {plan.features.dataVault ? (
                        <Check className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">Distribution Network</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="text-center py-3 px-4">
                      {plan.features.distribution ? (
                        <Check className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">Enterprise Audit</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="text-center py-3 px-4">
                      {plan.features.enterpriseAudit ? (
                        <Check className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-3 px-4 text-gray-700">Compliance Insurance</td>
                  {plans.map((plan) => (
                    <td key={plan.id} className="text-center py-3 px-4">
                      {plan.features.complianceInsurance ? (
                        <Check className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Purchase Credits Modal */}
      {showCreditPurchaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-900/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Purchase AI Credits</h2>
                <p className="text-sm text-gray-600">Power your AI-generated content</p>
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="credits" className="block text-sm font-medium text-gray-700 mb-2">
                Number of Credits
              </label>
              <input
                id="credits"
                type="number"
                value={creditsToPurchase}
                onChange={(e) => setCreditsToPurchase(parseInt(e.target.value) || 0)}
                min="1"
                max="10000"
                step="50"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              <p className="text-sm text-gray-600 mt-2">
                Cost: ${((creditsToPurchase * 10) / 100).toFixed(2)} ($0.10 per credit)
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>What can you do with AI credits?</strong>
              </p>
              <ul className="text-xs text-blue-700 mt-2 space-y-1 ml-4 list-disc">
                <li>Generate accessibility statements</li>
                <li>Create court-ready compliance reports</li>
                <li>AI-powered document formatting</li>
                <li>Enhanced WCAG analysis</li>
              </ul>
            </div>
            
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowCreditPurchaseModal(false);
                  setCreditsToPurchase(100);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={handlePurchaseCredits}
                isLoading={purchaseCreditsMutation.isPending}
              >
                Purchase
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
