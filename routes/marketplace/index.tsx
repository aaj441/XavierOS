import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Shield, Zap, Bell, Wrench, Award, CheckCircle, ArrowRight, TrendingUp, Users, Clock } from "lucide-react";
import { useState } from "react";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { DashboardLayout } from "~/components/DashboardLayout";
import { Button } from "~/components/Button";

export const Route = createFileRoute("/marketplace/")({
  component: MarketplacePage,
});

function MarketplacePage() {
  const { authToken } = useAuthStore();
  const trpc = useTRPC();
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  
  const subscriptionQuery = useQuery(
    trpc.getSubscriptionStatus.queryOptions({ authToken: authToken || "" })
  );
  
  if (!authToken) {
    navigate({ to: "/login" });
    return null;
  }
  
  const services = [
    {
      id: "audit",
      icon: Zap,
      title: "Automated WCAG Audit",
      subtitle: "Scan Site Now",
      description: "Point-and-click URL scanning with instant WCAG 2.2/3.0 compliance reports. Get actionable insights in minutes.",
      price: "Free",
      priceDetail: "First scan free, then from $29/mo",
      features: [
        "Instant scan results with risk score",
        "Downloadable PDF/CSV reports",
        "WCAG 2.2 Level AA compliance",
        "Shareable compliance badge",
        "Recurring scan scheduling",
      ],
      gradient: "from-primary-500 to-primary-600",
      bgGradient: "from-primary-50 to-primary-100",
      cta: "Start Free Scan",
      route: "/dashboard",
      popular: true,
    },
    {
      id: "sales",
      icon: Users,
      title: "Sales Enablement Suite",
      subtitle: "Audit + Outreach Scripts",
      description: "Batch scan competitors, rank by accessibility risk, and generate AI-powered outreach scripts for your sales team.",
      price: "$99",
      priceDetail: "per batch of 20 sites",
      features: [
        "Bulk URL scanning (up to 50 sites)",
        "Deal score ranking by risk level",
        "AI-generated sales scripts",
        "Decision-maker extraction",
        "CRM integration (HubSpot)",
      ],
      gradient: "from-accent-500 to-accent-600",
      bgGradient: "from-accent-50 to-accent-100",
      cta: "Start Batch Scan",
      route: "/marketplace/sales-enablement",
      requiresPlan: "professional",
    },
    {
      id: "monitoring",
      icon: Bell,
      title: "Recurring Monitoring",
      subtitle: "24/7 Compliance Tracking",
      description: "Automated scheduled scans with customizable alerts. Never miss a compliance issue with gentle, ADHD-friendly notifications.",
      price: "$49",
      priceDetail: "per site/month",
      features: [
        "Daily, weekly, or monthly scans",
        "Email, SMS, and Slack alerts",
        "Quiet hours configuration",
        "Historical trend tracking",
        "Regression detection",
      ],
      gradient: "from-blue-500 to-blue-600",
      bgGradient: "from-blue-50 to-blue-100",
      cta: "Setup Monitoring",
      route: "/marketplace/monitoring",
    },
    {
      id: "remediation",
      icon: Wrench,
      title: "Remediation Marketplace",
      subtitle: "Expert Fixes",
      description: "Connect with accessibility experts who can fix your issues. Escrow-protected payments and guaranteed compliance.",
      price: "Custom",
      priceDetail: "Fixed price or hourly",
      features: [
        "Vetted accessibility experts",
        "Fixed-price or hourly options",
        "Escrow payment protection",
        "Real-time project updates",
        "Free follow-up scan included",
      ],
      gradient: "from-green-500 to-green-600",
      bgGradient: "from-green-50 to-green-100",
      cta: "Browse Experts",
      route: "/marketplace/remediation",
      requiresPlan: "solo",
    },
    {
      id: "certification",
      icon: Award,
      title: "Compliance Certification",
      subtitle: "Peace of Mind Badge",
      description: "Official WCAG compliance certification with shareable badge. Boost trust and demonstrate your commitment to accessibility.",
      price: "$299",
      priceDetail: "annual certification",
      features: [
        "Official compliance certificate",
        "Shareable website badge",
        "Public directory listing",
        "Annual re-certification",
        "LinkedIn-ready credentials",
      ],
      gradient: "from-purple-500 to-purple-600",
      bgGradient: "from-purple-50 to-purple-100",
      cta: "Get Certified",
      route: "/marketplace/certification",
      requiresPlan: "professional",
    },
  ];
  
  const canAccessService = (service: typeof services[0]) => {
    if (!service.requiresPlan) return true;
    if (!subscriptionQuery.data) return false;
    
    const planHierarchy = ["free", "solo", "professional", "enterprise"];
    const userPlanIndex = planHierarchy.indexOf(subscriptionQuery.data.plan.name);
    const requiredPlanIndex = planHierarchy.indexOf(service.requiresPlan);
    
    return userPlanIndex >= requiredPlanIndex;
  };
  
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Accessibility Services Marketplace</h1>
              <p className="text-gray-600 mt-1">Professional WCAG compliance tools and services</p>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-4 border border-primary-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary-800">Your Plan</p>
                  <p className="text-lg font-bold text-primary-900 capitalize">
                    {subscriptionQuery.data?.plan.displayName || "Free"}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-accent-50 to-accent-100 rounded-xl p-4 border border-accent-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-accent-800">Scans This Month</p>
                  <p className="text-lg font-bold text-accent-900">
                    {subscriptionQuery.data?.usage.scansThisMonth || 0} / {subscriptionQuery.data?.plan.features.maxScansPerMonth || 10}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-accent-600" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-800">AI Credits</p>
                  <p className="text-lg font-bold text-green-900">
                    {subscriptionQuery.data?.aiCredits.balance || 0}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Services Used</p>
                  <p className="text-lg font-bold text-blue-900">3 / 5</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Service Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {services.map((service) => {
            const hasAccess = canAccessService(service);
            const ServiceIcon = service.icon;
            
            return (
              <div
                key={service.id}
                className={`group relative bg-white rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1 ${
                  service.popular
                    ? "border-primary-300 shadow-lg hover:shadow-2xl"
                    : "border-gray-200 hover:border-primary-200 hover:shadow-xl"
                }`}
              >
                {service.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-primary-600 to-accent-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                
                {!hasAccess && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      UPGRADE REQUIRED
                    </span>
                  </div>
                )}
                
                <div className="p-6">
                  {/* Icon and Title */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${service.bgGradient} group-hover:scale-110 transition-transform duration-300`}>
                      <ServiceIcon className="h-7 w-7 text-primary-600" />
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{service.price}</p>
                      <p className="text-xs text-gray-600">{service.priceDetail}</p>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{service.title}</h3>
                  <p className="text-sm text-primary-600 font-semibold mb-3">{service.subtitle}</p>
                  <p className="text-gray-600 mb-4 leading-relaxed">{service.description}</p>
                  
                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* CTA Button */}
                  <Button
                    className="w-full group-hover:scale-105 transition-transform duration-300"
                    variant={service.popular ? "primary" : "secondary"}
                    onClick={() => {
                      if (hasAccess) {
                        navigate({ to: service.route });
                      } else {
                        navigate({ to: "/settings" });
                      }
                    }}
                    disabled={!hasAccess}
                  >
                    {hasAccess ? service.cta : "Upgrade Plan"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Help Section */}
        <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl p-8 border border-blue-200">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Not Sure Which Service You Need?</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Our accessibility experts can help you choose the right services for your needs. Get personalized recommendations based on your website and goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="primary" size="lg">
                <Users className="h-5 w-5 mr-2" />
                Talk to an Expert
              </Button>
              <Button variant="outline" size="lg">
                Take Assessment Quiz
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
