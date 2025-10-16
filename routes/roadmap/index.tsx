import { createFileRoute, Link } from "@tanstack/react-router";
import { 
  Shield, ArrowRight, Trash2, Minimize2, TrendingUp, Sparkles,
  Zap, Brain, Puzzle, Rocket, Users, Code, Globe, Award,
  Target, GitBranch, Gamepad2, MessageSquare, Map, Medal
} from "lucide-react";
import { Button } from "~/components/Button";

export const Route = createFileRoute("/roadmap/")({
  component: RoadmapPage,
});

function RoadmapPage() {
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

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-6">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                <Target className="h-4 w-4 mr-2" />
                Blue Ocean Strategy
              </span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Unlocking Lucy's
              <span className="block bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                Blue Ocean Potential
              </span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-8">
              Using the ERRC framework to create uncontested market space where Lucy can truly stand out 
              and create demand through innovation, not competition.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/demo">
                <Button variant="outline" size="lg">
                  Try Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ERRC Framework Explanation */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What is the ERRC Grid?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              ERRC stands for Eliminate, Reduce, Raise, Create—a key tool from Blue Ocean Strategy 
              that pushes us not just to compete better, but to create a new game with different rules.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-red-50 to-white p-6 rounded-2xl border border-red-200">
              <div className="h-12 w-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Eliminate</h3>
              <p className="text-gray-600 text-sm">
                What industry practices or features can we completely remove that add little value or cause pain?
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-white p-6 rounded-2xl border border-orange-200">
              <div className="h-12 w-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <Minimize2 className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Reduce</h3>
              <p className="text-gray-600 text-sm">
                What factors should be reduced below industry standards to cut cost or complexity?
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-200">
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Raise</h3>
              <p className="text-gray-600 text-sm">
                Which factors should be raised well above industry standards to create exceptional value?
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-white p-6 rounded-2xl border border-green-200">
              <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Create</h3>
              <p className="text-gray-600 text-sm">
                What entirely new factors should we introduce that have never been offered before?
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Eliminate Section */}
      <section className="py-24 bg-gradient-to-br from-red-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center h-16 w-16 bg-red-100 rounded-2xl mb-4">
              <Trash2 className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Eliminate</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Remove redundant manual efforts and pain points that slow down accessibility compliance
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Manual, Siloed Accessibility Audits",
                description: "Remove the dependency on slow, error-prone manual audits that are common pain points.",
              },
              {
                title: "Overwhelming Technical Jargon",
                description: "Strip away complex language in reports; keep everything crystal-clear and actionable to expand beyond only expert users.",
              },
              {
                title: "Expensive, One-Off Consulting as Default",
                description: "Transition away from costly manual consulting as the primary revenue driver.",
              },
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-red-200 p-6 hover:shadow-lg transition-all">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="flex-shrink-0 h-8 w-8 bg-red-100 rounded-lg flex items-center justify-center text-red-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">{item.title}</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reduce Section */}
      <section className="py-24 bg-gradient-to-br from-orange-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center h-16 w-16 bg-orange-100 rounded-2xl mb-4">
              <Minimize2 className="h-8 w-8 text-orange-600" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Reduce</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Cut down complexity and delays to streamline the accessibility workflow
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Heavy Reliance on Post-Launch Fixes",
                description: "Reduce dependence on fixing problems only after site launch by shifting toward ongoing, integrated monitoring.",
              },
              {
                title: "Complicated On-Premise Installations",
                description: "Cut down setup complexity—make Lucy a seamless cloud-native service or plugin.",
              },
              {
                title: "Support Wait Times for Critical Issues",
                description: "Shorten response times with AI-powered automated support bots handling common issues instantly.",
              },
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-orange-200 p-6 hover:shadow-lg transition-all">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="flex-shrink-0 h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 font-bold text-sm">
                    {index + 4}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 flex-1">{item.title}</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Raise Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center h-16 w-16 bg-blue-100 rounded-2xl mb-4">
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Raise</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Amplify intelligent automation and seamless integration to create exceptional value
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Brain,
                title: "Automation Intelligence",
                description: "Significantly raise the automation and predictive power so Lucy acts like a continuous accessibility assistant.",
              },
              {
                icon: Puzzle,
                title: "Integration Depth",
                description: "Deepen integrations directly into developers' IDEs, CMS, and CI/CD pipelines to make accessibility a built-in workflow step.",
              },
              {
                icon: Users,
                title: "User Empowerment",
                description: "Empower non-technical users (content creators, marketers) with simple tools to check accessibility in real time.",
              },
              {
                icon: TrendingUp,
                title: "Data-Driven Strategy",
                description: "Amplify visibility on accessibility trends using aggregated, anonymized data analytics that clients can use to strategize proactively.",
              },
              {
                icon: Award,
                title: "Industry Certification Ecosystem",
                description: "Build widely recognized certifications that turn accessibility from a compliance checkbox into a brand advantage.",
              },
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-blue-200 p-6 hover:shadow-lg transition-all">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-xs font-bold text-blue-600">#{index + 7}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Create Section */}
      <section className="py-24 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center h-16 w-16 bg-green-100 rounded-2xl mb-4">
              <Sparkles className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Create</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Introduce entirely new factors and ecosystems that reshape the accessibility market
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Zap,
                title: "Self-Healing Accessibility Pipelines",
                description: "Launch an AI-driven mechanism that automatically suggests and commits fixes for common accessibility code issues—no human intervention needed.",
              },
              {
                icon: Users,
                title: "Accessibility Co-Creation Marketplace",
                description: "Create a vibrant marketplace connecting developers, designers, and people with disabilities to co-create accessible experiences.",
              },
              {
                icon: Globe,
                title: "Emergent Tech Accessibility",
                description: "Develop niche solutions for AR/VR, voice interfaces, and IoT, where accessibility tooling is barely addressed today.",
              },
              {
                icon: Code,
                title: "Accessibility as Code Standards",
                description: "Advocate and implement accessibility design principles as code specifications that integrate with modern dev workflows.",
              },
              {
                icon: GitBranch,
                title: "Developer Community & Open Standards",
                description: "Foster a developer-led accessibility ecosystem around Lucy, including shared resources, plug-ins, and extensions.",
              },
              {
                icon: Gamepad2,
                title: "Gamified Accessibility Training",
                description: "Novel, interactive training modules with game mechanics that reward developers for accessibility best practices.",
              },
              {
                icon: MessageSquare,
                title: "Real-Time Accessibility Feedback Widget",
                description: "Provide embeddable widgets for live accessibility feedback that users can access instantly anywhere on their site.",
              },
              {
                icon: Map,
                title: "Accessibility Roadmap Builder",
                description: "Create tools to help businesses build their accessibility maturity roadmap utilizing Lucy-generated insights.",
              },
              {
                icon: Medal,
                title: "Dynamic Accessibility Certification",
                description: "Offer tiered, dynamic certifications that evolve with improvements, providing ongoing brand credibility and user trust.",
              },
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-green-200 p-6 hover:shadow-lg transition-all group">
                <div className="mb-4">
                  <div className="inline-flex items-center justify-center h-12 w-12 bg-green-100 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                    <item.icon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs font-bold text-green-600">#{index + 12}</span>
                    <h3 className="text-base font-semibold text-gray-900">{item.title}</h3>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What This Means Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                What This Means for Developers
              </h2>
              <p className="text-xl text-gray-600">
                Implementing Lucy's monetization and innovation strategy with this ERRC approach means 
                shifting Lucy from a traditional compliance tool to a groundbreaking accessibility platform
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <div className="bg-gradient-to-br from-primary-50 to-white rounded-2xl p-8 border border-primary-200">
                <Rocket className="h-12 w-12 text-primary-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Blue Ocean Approach</h3>
                <p className="text-gray-600 leading-relaxed">
                  Competing on creating new customer engagement and solving unmet needs rather than 
                  fighting for slices of the same pie.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-accent-50 to-white rounded-2xl p-8 border border-accent-200">
                <Target className="h-12 w-12 text-accent-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Uncontested Market Space</h3>
                <p className="text-gray-600 leading-relaxed">
                  Creating new forms of value and market spaces that competitors haven't touched, 
                  establishing Lucy as the must-have accessibility platform.
                </p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">Lucy's Future is Driven By:</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 h-8 w-8 bg-primary-500 rounded-lg flex items-center justify-center">
                    <Code className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Developer-Centric Innovations</h4>
                    <p className="text-gray-300 text-sm">Built by developers, for developers</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 h-8 w-8 bg-accent-500 rounded-lg flex items-center justify-center">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Automated, Proactive Solutions</h4>
                    <p className="text-gray-300 text-sm">Prevention over remediation</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 h-8 w-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <Puzzle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Deep Integration</h4>
                    <p className="text-gray-300 text-sm">Seamless workflow integration</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">New Ecosystems</h4>
                    <p className="text-gray-300 text-sm">Connecting users and creators</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary-600 to-accent-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Be Part of the Blue Ocean?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join Lucy's journey to transform accessibility compliance from a checkbox into a competitive advantage.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/demo">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Try Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Shield className="h-6 w-6 text-primary-400" />
              <span className="text-xl font-bold text-white">Lucy</span>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <Link to="/" className="hover:text-white transition-colors">Home</Link>
              <Link to="/roadmap" className="hover:text-white transition-colors">Roadmap</Link>
              <Link to="/demo" className="hover:text-white transition-colors">Demo</Link>
              <Link to="/login" className="hover:text-white transition-colors">Login</Link>
            </div>
          </div>
          <div className="text-center mt-8 text-sm">
            © 2024 Lucy WCAG Machine. Making the web accessible for everyone.
          </div>
        </div>
      </footer>
    </div>
  );
}
