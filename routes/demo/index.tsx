import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shield, PlayCircle, CheckCircle, AlertTriangle, Loader2, ArrowRight, Heart, Users, TrendingUp } from "lucide-react";
import { Button } from "~/components/Button";

export const Route = createFileRoute("/demo/")({
  component: DemoPage,
});

function DemoPage() {
  const [demoUrl, setDemoUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResults, setScanResults] = useState<{
    totalIssues: number;
    criticalIssues: number;
    seriousIssues: number;
    moderateIssues: number;
    minorIssues: number;
    riskScore: number;
    exampleViolations: Array<{
      severity: string;
      description: string;
      impact: string;
    }>;
  } | null>(null);
  
  const handleStartDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoUrl.trim()) return;
    
    setIsScanning(true);
    setScanProgress(0);
    setScanResults(null);
    
    // Simulate scanning progress with educational messages
    const progressSteps = [
      { progress: 20, delay: 800 },
      { progress: 40, delay: 1000 },
      { progress: 60, delay: 900 },
      { progress: 80, delay: 1100 },
      { progress: 100, delay: 800 },
    ];
    
    for (const step of progressSteps) {
      await new Promise(resolve => setTimeout(resolve, step.delay));
      setScanProgress(step.progress);
    }
    
    // Simulate realistic results based on common accessibility issues
    const mockResults = {
      totalIssues: Math.floor(Math.random() * 20) + 5,
      criticalIssues: Math.floor(Math.random() * 3) + 1,
      seriousIssues: Math.floor(Math.random() * 5) + 2,
      moderateIssues: Math.floor(Math.random() * 7) + 3,
      minorIssues: Math.floor(Math.random() * 5) + 1,
      riskScore: Math.floor(Math.random() * 40) + 50,
      exampleViolations: [
        {
          severity: "critical",
          description: "Images missing alternative text",
          impact: "Screen reader users cannot understand image content",
        },
        {
          severity: "serious",
          description: "Form inputs lack proper labels",
          impact: "Users with disabilities cannot identify form fields",
        },
        {
          severity: "moderate",
          description: "Insufficient color contrast",
          impact: "Text may be difficult to read for users with visual impairments",
        },
      ],
    };
    
    await new Promise(resolve => setTimeout(resolve, 500));
    setScanResults(mockResults);
    setIsScanning(false);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Navigation */}
      <nav className="border-b border-primary-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                Lucy
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-800 text-sm font-medium mb-6">
            <Heart className="h-4 w-4 mr-2" />
            Making the Web Accessible for Everyone
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Experience Lucy in Action
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how Lucy identifies accessibility barriers that prevent millions of people from fully experiencing your website. 
            Enter any URL below for an instant accessibility audit.
          </p>
        </div>

        {/* Demo Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8">
          <form onSubmit={handleStartDemo} className="space-y-4">
            <div>
              <label htmlFor="demo-url" className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                id="demo-url"
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
                disabled={isScanning}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full"
              isLoading={isScanning}
              disabled={isScanning}
            >
              {isScanning ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <PlayCircle className="h-5 w-5 mr-2" />
                  Start Free Accessibility Scan
                </>
              )}
            </Button>
          </form>

          {/* Progress Bar */}
          {isScanning && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Analyzing accessibility...
                </span>
                <span className="text-sm font-medium text-primary-600">
                  {scanProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-primary-600 to-accent-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
              <p className="mt-3 text-sm text-gray-600 text-center">
                {scanProgress < 40 && "Loading page and analyzing structure..."}
                {scanProgress >= 40 && scanProgress < 70 && "Checking WCAG 2.2 compliance criteria..."}
                {scanProgress >= 70 && scanProgress < 100 && "Identifying accessibility barriers..."}
                {scanProgress === 100 && "Generating detailed report..."}
              </p>
            </div>
          )}
        </div>

        {/* Results */}
        {scanResults && (
          <div className="space-y-6 animate-fade-in">
            {/* Summary Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Scan Complete</h2>
                  <p className="text-gray-600">
                    Found {scanResults.totalIssues} accessibility issues that could prevent people from using your website
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-orange-600">{scanResults.riskScore}</div>
                  <div className="text-sm text-gray-600">Risk Score</div>
                </div>
              </div>

              {/* Issue Distribution */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{scanResults.criticalIssues}</div>
                  <div className="text-sm text-gray-600">Critical</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{scanResults.seriousIssues}</div>
                  <div className="text-sm text-gray-600">Serious</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{scanResults.moderateIssues}</div>
                  <div className="text-sm text-gray-600">Moderate</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{scanResults.minorIssues}</div>
                  <div className="text-sm text-gray-600">Minor</div>
                </div>
              </div>

              {/* Example Violations */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">Example Issues Found:</h3>
                {scanResults.exampleViolations.map((violation, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                    <AlertTriangle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                      violation.severity === "critical" ? "text-red-600" :
                      violation.severity === "serious" ? "text-orange-600" :
                      "text-yellow-600"
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{violation.description}</p>
                      <p className="text-sm text-gray-600 mt-1">{violation.impact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Impact Explanation */}
            <div className="bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl shadow-xl p-8 text-white">
              <div className="flex items-start space-x-4 mb-6">
                <Users className="h-8 w-8 flex-shrink-0" />
                <div>
                  <h3 className="text-2xl font-bold mb-2">Who This Affects</h3>
                  <p className="text-primary-100">
                    These accessibility barriers impact over <strong>1 billion people worldwide</strong> who have disabilities, 
                    including those who are blind, have low vision, are deaf or hard of hearing, or have motor impairments.
                  </p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Legal Compliance</h4>
                  <p className="text-sm text-primary-100">
                    Avoid lawsuits and ensure compliance with ADA, Section 508, and international accessibility laws.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Business Growth</h4>
                  <p className="text-sm text-primary-100">
                    Reach a wider audience and improve SEO. Accessible websites perform better in search rankings.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Ready to Fix These Issues?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Sign up for Lucy to get detailed reports, automated scanning, and step-by-step remediation guidance. 
                Start making your website accessible to everyone today.
              </p>
              <Link to="/register">
                <Button size="lg">
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <p className="text-sm text-gray-500 mt-4">
                No credit card required • Full access to all features
              </p>
            </div>
          </div>
        )}

        {/* Educational Info */}
        {!scanResults && !isScanning && (
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <Heart className="h-8 w-8 text-primary-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Empathy First</h3>
              <p className="text-sm text-gray-600">
                Every accessibility issue represents a real person who cannot fully experience your website. 
                Lucy helps you understand and fix these barriers.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <TrendingUp className="h-8 w-8 text-accent-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Better Performance</h3>
              <p className="text-sm text-gray-600">
                Accessible websites typically have better SEO, faster load times, and higher conversion rates. 
                Accessibility is good for everyone.
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <Shield className="h-8 w-8 text-green-600 mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">Legal Protection</h3>
              <p className="text-sm text-gray-600">
                Stay compliant with ADA, Section 508, and WCAG standards. Avoid costly lawsuits and demonstrate 
                your commitment to inclusivity.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
