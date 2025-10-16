import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Wrench, Shield, Star, CheckCircle, DollarSign, Clock } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { DashboardLayout } from "~/components/DashboardLayout";
import { Button } from "~/components/Button";

export const Route = createFileRoute("/marketplace/remediation")({
  component: RemediationPage,
});

function RemediationPage() {
  const { authToken } = useAuthStore();
  const trpc = useTRPC();
  const navigate = useNavigate();
  
  const [pricingModel, setPricingModel] = useState<"fixed" | "hourly">("fixed");
  
  const subscriptionQuery = useQuery(
    trpc.getSubscriptionStatus.queryOptions({ authToken: authToken || "" })
  );
  
  const marketplaceQuery = useQuery(
    trpc.getMarketplaceItems.queryOptions({
      type: "service",
      category: "accessibility_remediation",
      limit: 20,
    })
  );
  
  if (!authToken) {
    navigate({ to: "/login" });
    return null;
  }
  
  const hasAccess = subscriptionQuery.data?.plan.name !== "free";
  
  if (!hasAccess) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-12 border border-orange-200">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Upgrade Required</h1>
            <p className="text-gray-600 mb-6">
              Remediation Marketplace requires a Solo or higher subscription.
            </p>
            <Button onClick={() => navigate({ to: "/settings" })}>
              Upgrade Plan
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Remediation Marketplace</h1>
          <p className="text-gray-600">
            Connect with vetted accessibility experts to fix your issues
          </p>
        </div>
        
        {/* How It Works */}
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-8 border border-green-200 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Select Issues</h3>
              <p className="text-sm text-gray-600">
                Choose which violations you want fixed
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Get Quote</h3>
              <p className="text-sm text-gray-600">
                Receive fixed-price or hourly estimates
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Escrow Payment</h3>
              <p className="text-sm text-gray-600">
                Funds held securely until work is complete
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-primary-600">4</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Verify & Release</h3>
              <p className="text-sm text-gray-600">
                Free follow-up scan to verify fixes
              </p>
            </div>
          </div>
        </div>
        
        {/* Pricing Models */}
        <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Pricing Model</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setPricingModel("fixed")}
              className={`p-6 rounded-xl border-2 transition-all ${
                pricingModel === "fixed"
                  ? "border-primary-600 bg-primary-50"
                  : "border-gray-200 hover:border-primary-300"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <DollarSign className={`h-8 w-8 ${pricingModel === "fixed" ? "text-primary-600" : "text-gray-400"}`} />
                {pricingModel === "fixed" && (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fixed Price</h3>
              <p className="text-sm text-gray-600 mb-4">
                Pay a set amount for the entire project. Best for well-defined issues.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                  Predictable costs
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                  Clear scope of work
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                  No surprises
                </li>
              </ul>
            </button>
            
            <button
              onClick={() => setPricingModel("hourly")}
              className={`p-6 rounded-xl border-2 transition-all ${
                pricingModel === "hourly"
                  ? "border-primary-600 bg-primary-50"
                  : "border-gray-200 hover:border-primary-300"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <Clock className={`h-8 w-8 ${pricingModel === "hourly" ? "text-primary-600" : "text-gray-400"}`} />
                {pricingModel === "hourly" && (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                )}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Hourly Rate</h3>
              <p className="text-sm text-gray-600 mb-4">
                Pay for actual time worked. Best for complex or ongoing projects.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                  Flexible scope
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                  Track progress
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                  Ongoing support
                </li>
              </ul>
            </button>
          </div>
        </div>
        
        {/* Featured Experts */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Experts</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {String.fromCharCode(64 + i)}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Expert {i}</h3>
                      <div className="flex items-center text-sm text-yellow-600">
                        <Star className="h-4 w-4 fill-current mr-1" />
                        <span>4.{8 + i}/5</span>
                      </div>
                    </div>
                  </div>
                  <Shield className="h-6 w-6 text-green-600" title="Verified Expert" />
                </div>
                
                <p className="text-sm text-gray-600 mb-4">
                  WCAG 2.2 certified specialist with {5 + i} years of experience in web accessibility.
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fixed Rate:</span>
                    <span className="font-semibold text-gray-900">${50 + i * 10}/issue</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Hourly Rate:</span>
                    <span className="font-semibold text-gray-900">${100 + i * 25}/hr</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Projects:</span>
                    <span className="font-semibold text-gray-900">{50 + i * 20}+</span>
                  </div>
                </div>
                
                <Button className="w-full" variant="secondary">
                  <Wrench className="h-4 w-4 mr-2" />
                  Request Quote
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
