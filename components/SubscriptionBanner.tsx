import { Link } from "@tanstack/react-router";
import { Crown, Zap, TrendingUp, Shield, ArrowRight } from "lucide-react";
import { Button } from "~/components/Button";

interface SubscriptionBannerProps {
  planName: string;
  planDisplayName: string;
  aiCreditsBalance: number;
  scansUsed: number;
  scansLimit: number;
  projectsUsed: number;
  projectsLimit: number;
  showUpgradePrompt?: boolean;
}

export function SubscriptionBanner({
  planName,
  planDisplayName,
  aiCreditsBalance,
  scansUsed,
  scansLimit,
  projectsUsed,
  projectsLimit,
  showUpgradePrompt = false,
}: SubscriptionBannerProps) {
  const isFreePlan = planName === "free";
  const isNearScanLimit = scansUsed / scansLimit > 0.8;
  const isNearProjectLimit = projectsUsed / projectsLimit > 0.8;
  
  return (
    <div className="space-y-4">
      {/* Main subscription card */}
      <div className={`rounded-xl p-6 border-2 ${
        isFreePlan 
          ? "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200" 
          : "bg-gradient-to-br from-primary-50 to-accent-50 border-primary-200"
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              {!isFreePlan && <Crown className="h-6 w-6 text-primary-600" />}
              <h3 className="text-xl font-bold text-gray-900">{planDisplayName} Plan</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* AI Credits */}
              <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-medium text-gray-600">AI Credits</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{aiCreditsBalance}</p>
                <Link to="/settings" className="text-xs text-primary-600 hover:text-primary-700 font-medium mt-1 inline-block">
                  Purchase more →
                </Link>
              </div>
              
              {/* Scans Usage */}
              <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <span className="text-sm font-medium text-gray-600">Scans This Month</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {scansUsed} <span className="text-base text-gray-500">/ {scansLimit}</span>
                </p>
                {isNearScanLimit && (
                  <p className="text-xs text-orange-600 font-medium mt-1">
                    {scansLimit - scansUsed} scans remaining
                  </p>
                )}
              </div>
              
              {/* Projects Usage */}
              <div className="bg-white/80 backdrop-blur rounded-lg p-4 border border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium text-gray-600">Active Projects</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {projectsUsed} <span className="text-base text-gray-500">/ {projectsLimit}</span>
                </p>
                {isNearProjectLimit && (
                  <p className="text-xs text-orange-600 font-medium mt-1">
                    {projectsLimit - projectsUsed} projects remaining
                  </p>
                )}
              </div>
            </div>
          </div>
          
          {isFreePlan && (
            <Link to="/settings" className="ml-4">
              <Button size="sm">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade
              </Button>
            </Link>
          )}
        </div>
      </div>
      
      {/* Upgrade prompt for free users */}
      {showUpgradePrompt && isFreePlan && (
        <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-lg font-bold mb-2">Unlock Premium Features</h4>
              <p className="text-primary-100 text-sm mb-4">
                Get unlimited scans, advanced reports, priority processing, and more with a Professional plan.
              </p>
              <ul className="space-y-2 text-sm text-primary-50 mb-4">
                <li className="flex items-center space-x-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary-200" />
                  <span>Unlimited accessibility scans</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary-200" />
                  <span>Court-ready compliance reports</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary-200" />
                  <span>AI-powered accessibility statements</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary-200" />
                  <span>Priority support & processing</span>
                </li>
              </ul>
            </div>
            <Link to="/settings" className="ml-4">
              <Button variant="outline" className="bg-white text-primary-600 hover:bg-primary-50 border-0">
                View Plans
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
