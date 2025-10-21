import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle, Zap, BarChart3, Users, ArrowRight, Shield, TrendingUp } from "lucide-react";
import { Button } from "~/components/Button";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <>
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        
        .animation-delay-600 {
          animation-delay: 0.6s;
        }
        
        .animation-delay-800 {
          animation-delay: 0.8s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .bg-grid-white\\/10 {
          background-image: linear-gradient(white 1px, transparent 1px),
                            linear-gradient(90deg, white 1px, transparent 1px);
          background-size: 50px 50px;
          opacity: 0.1;
        }
        
        .bg-grid-gray-900\\/5 {
          background-image: linear-gradient(rgb(17 24 39 / 0.05) 1px, transparent 1px),
                            linear-gradient(90deg, rgb(17 24 39 / 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="border-b border-gray-100 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-accent-400 rounded-lg blur-sm opacity-75"></div>
                  <Shield className="relative h-8 w-8 text-primary-600" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 bg-clip-text text-transparent">
                  Lucy
                </span>
              </div>
              <div className="flex items-center space-x-6">
                <Link to="/roadmap" className="text-gray-600 hover:text-primary-600 transition-colors font-medium hidden sm:block">
                  Roadmap
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-shadow">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="space-y-8 z-10">
                <div className="inline-block animate-fade-in-up">
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-primary-100 to-accent-100 text-primary-800 border border-primary-200 shadow-sm">
                    <Zap className="h-4 w-4 mr-2 text-primary-600" />
                    Automated WCAG Compliance
                  </span>
                </div>
                
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight animate-fade-in-up animation-delay-200">
                  Make Your Website
                  <span className="block mt-2 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 bg-clip-text text-transparent animate-gradient">
                    Accessible to Everyone
                  </span>
                </h1>
                
                <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed animate-fade-in-up animation-delay-400">
                  Lucy automates accessibility audits according to WCAG 2.2/3.0 standards, delivering actionable reports and streamlined compliance workflows.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up animation-delay-600">
                  <Link to="/register" className="group">
                    <Button size="lg" className="w-full sm:w-auto shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/40 hover:scale-105 transition-all duration-300">
                      Start Free Audit
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link to="/demo">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto hover:scale-105 transition-all duration-300">
                      Watch Demo
                    </Button>
                  </Link>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 text-sm text-gray-600 animate-fade-in-up animation-delay-800">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    No credit card required
                  </div>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    WCAG 2.2 compliant
                  </div>
                </div>
              </div>
              
              <div className="relative animate-fade-in-up animation-delay-400">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                  <img
                    src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&auto=format&fit=crop"
                    alt="Team collaboration"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary-600/20 to-accent-600/20"></div>
                </div>
                
                {/* Floating notification card */}
                <div className="absolute -bottom-8 -left-8 bg-white rounded-2xl shadow-2xl p-5 border border-gray-100 animate-float">
                  <div className="flex items-center space-x-4">
                    <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl p-3 shadow-lg">
                      <CheckCircle className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <div className="text-base font-bold text-gray-900">Scan Complete</div>
                      <div className="text-sm text-gray-600">5 issues found & fixed</div>
                    </div>
                  </div>
                </div>
                
                {/* Floating stats badge */}
                <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-2xl p-4 border border-gray-100 animate-float animation-delay-2000">
                  <div className="text-center">
                    <div className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">98%</div>
                    <div className="text-xs text-gray-600 font-medium mt-1">Compliance Score</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))] pointer-events-none"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { number: "10K+", label: "Websites Scanned", icon: Zap },
                { number: "2M+", label: "Issues Detected", icon: Shield },
                { number: "99.9%", label: "Accuracy Rate", icon: CheckCircle },
                { number: "24/7", label: "Monitoring", icon: TrendingUp },
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm mb-3 group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-4xl lg:text-5xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-primary-100 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-block mb-4">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-primary-100 to-accent-100 text-primary-800 border border-primary-200">
                  Features
                </span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Everything You Need for Accessibility
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Comprehensive tools to ensure your website meets WCAG standards and provides an inclusive experience for all users.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Zap,
                  title: "Automated Scanning",
                  description: "Point-and-click URL scanning with automated crawling and DOM analysis against WCAG 2.2/3.0 criteria.",
                  gradient: "from-primary-500 to-primary-600",
                  bgGradient: "from-primary-50 to-primary-100",
                },
                {
                  icon: BarChart3,
                  title: "Detailed Reports",
                  description: "Interactive dashboards with drill-down capabilities and exportable PDF/CSV reports for stakeholders.",
                  gradient: "from-accent-500 to-accent-600",
                  bgGradient: "from-accent-50 to-accent-100",
                },
                {
                  icon: Users,
                  title: "Team Collaboration",
                  description: "Multi-user access with role-based permissions for admins, auditors, and viewers.",
                  gradient: "from-purple-500 to-purple-600",
                  bgGradient: "from-purple-50 to-purple-100",
                },
                {
                  icon: CheckCircle,
                  title: "Risk Assessment",
                  description: "Violations classified by severity and risk category with prioritized remediation suggestions.",
                  gradient: "from-green-500 to-green-600",
                  bgGradient: "from-green-50 to-green-100",
                },
                {
                  icon: Shield,
                  title: "Compliance Tracking",
                  description: "Monitor compliance trends over time and track improvements across all your projects.",
                  gradient: "from-indigo-500 to-indigo-600",
                  bgGradient: "from-indigo-50 to-indigo-100",
                },
                {
                  icon: TrendingUp,
                  title: "CRM Integration",
                  description: "Seamless HubSpot integration for automated sales workflows and follow-up.",
                  gradient: "from-pink-500 to-pink-600",
                  bgGradient: "from-pink-50 to-pink-100",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="group relative bg-white p-8 rounded-2xl border border-gray-200 hover:border-transparent hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  {/* Gradient border effect on hover */}
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl`}></div>
                  
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.bgGradient} mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                    <feature.icon className="h-7 w-7 text-primary-600" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition-colors">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <div className="mt-6 flex items-center text-primary-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Learn more
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 lg:py-32 bg-gradient-to-br from-gray-50 via-white to-primary-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-gray-900/5 [mask-image:radial-gradient(ellipse_at_center,white,transparent)] pointer-events-none"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-block mb-4">
                <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-accent-100 to-primary-100 text-accent-800 border border-accent-200">
                  Testimonials
                </span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
                Real Impact, Real Stories
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Hear from organizations that have transformed their digital presence and made their websites accessible to everyone
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  initials: "SM",
                  name: "Sarah Mitchell",
                  role: "Director of Digital Experience",
                  content: "Lucy helped us discover accessibility issues we never knew existed. After fixing them, we saw a 28% increase in conversions and received heartfelt emails from users thanking us for making our site accessible.",
                  highlight: "28% increase in conversions",
                  company: "E-commerce • 50K+ monthly visitors",
                  gradient: "from-primary-500 to-accent-500",
                },
                {
                  initials: "JC",
                  name: "James Chen",
                  role: "CTO, HealthTech Startup",
                  content: "We were facing a potential ADA lawsuit. Lucy not only helped us identify and fix critical issues quickly, but also gave us confidence in our compliance. The automated scanning saves us hours every week.",
                  highlight: "confidence in our compliance",
                  company: "Healthcare • HIPAA Compliant",
                  gradient: "from-accent-500 to-purple-500",
                },
                {
                  initials: "MP",
                  name: "Maria Patel",
                  role: "Accessibility Advocate",
                  content: "As someone who relies on screen readers, I'm thrilled to see companies using Lucy. It's not just about compliance—it's about dignity and inclusion. Every fixed issue means one less barrier for people like me.",
                  highlight: "dignity and inclusion",
                  company: "Nonprofit • Advocacy",
                  gradient: "from-purple-500 to-primary-500",
                },
              ].map((testimonial, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 p-8 transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="flex items-center mb-6">
                    <div className={`relative h-14 w-14 rounded-full bg-gradient-to-br ${testimonial.gradient} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                      {testimonial.initials}
                      <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${testimonial.gradient} opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-300`}></div>
                    </div>
                    <div className="ml-4">
                      <div className="font-bold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.role}</div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed mb-6">
                    "{testimonial.content.split(testimonial.highlight)[0]}
                    <strong className="text-primary-600 font-semibold">{testimonial.highlight}</strong>
                    {testimonial.content.split(testimonial.highlight)[1]}"
                  </p>
                  
                  <div className="flex items-center text-sm text-gray-500 pt-4 border-t border-gray-100">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-2">
                      <CheckCircle className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    {testimonial.company}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Educational Section */}
        <section className="py-24 lg:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div>
                <div className="inline-block mb-6">
                  <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-accent-100 to-primary-100 text-accent-800 border border-accent-200">
                    <Users className="h-4 w-4 mr-2" />
                    Why Accessibility Matters
                  </span>
                </div>
                
                <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-8">
                  Understanding WCAG Compliance
                </h2>
                
                <div className="space-y-8">
                  {[
                    {
                      icon: Users,
                      title: "1 Billion People Affected",
                      description: "Over 15% of the world's population has some form of disability. Web accessibility ensures everyone can access and use your website, regardless of their abilities.",
                      gradient: "from-primary-500 to-primary-600",
                      bgColor: "bg-primary-50",
                    },
                    {
                      icon: Shield,
                      title: "Legal Requirements",
                      description: "The Americans with Disabilities Act (ADA), Section 508, and similar laws worldwide require websites to be accessible. WCAG 2.2 Level AA is the recognized standard for compliance.",
                      gradient: "from-accent-500 to-accent-600",
                      bgColor: "bg-accent-50",
                    },
                    {
                      icon: TrendingUp,
                      title: "Business Benefits",
                      description: "Accessible websites have better SEO, reach wider audiences, improve user experience for everyone, and demonstrate social responsibility—leading to increased conversions and customer loyalty.",
                      gradient: "from-green-500 to-green-600",
                      bgColor: "bg-green-50",
                    },
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-4 group">
                      <div className={`flex-shrink-0 h-12 w-12 rounded-xl ${item.bgColor} flex items-center justify-center shadow-sm group-hover:shadow-lg transition-all duration-300 group-hover:scale-110`}>
                        <item.icon className="h-6 w-6 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-2 text-lg group-hover:text-primary-600 transition-colors">{item.title}</h3>
                        <p className="text-gray-600 leading-relaxed">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-10">
                  <Link to="/demo" className="group">
                    <Button size="lg" className="shadow-xl shadow-primary-500/30 hover:shadow-2xl hover:shadow-primary-500/40 hover:scale-105 transition-all duration-300">
                      Try Free Accessibility Scan
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-primary-50 via-white to-accent-50 rounded-3xl p-8 lg:p-10 shadow-xl border border-gray-100">
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8">Common Accessibility Issues</h3>
                <div className="space-y-4">
                  {[
                    {
                      title: "Missing Alt Text",
                      description: "Images without alternative text are invisible to screen readers",
                      severity: "Critical",
                      color: "red",
                      icon: "🚨",
                    },
                    {
                      title: "Poor Color Contrast",
                      description: "Text that's hard to read for users with visual impairments",
                      severity: "Serious",
                      color: "orange",
                      icon: "⚠️",
                    },
                    {
                      title: "Keyboard Navigation",
                      description: "Interactive elements that can't be accessed without a mouse",
                      severity: "Serious",
                      color: "orange",
                      icon: "⚠️",
                    },
                    {
                      title: "Form Labels",
                      description: "Input fields without proper labels confuse assistive technologies",
                      severity: "Moderate",
                      color: "yellow",
                      icon: "⚡",
                    },
                  ].map((issue, index) => (
                    <div key={index} className="group bg-white rounded-xl p-5 shadow-sm hover:shadow-lg border border-gray-200 hover:border-primary-200 transition-all duration-300 hover:-translate-y-1">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{issue.icon}</span>
                          <h4 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{issue.title}</h4>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full bg-${issue.color}-100 text-${issue.color}-800 border border-${issue.color}-200`}>
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{issue.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-24 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-500 to-accent-600"></div>
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]"></div>
          
          {/* Animated background shapes */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-white/10 rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-white/10 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
          </div>
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Ready to Make Your Website Accessible?
            </h2>
            <p className="text-xl lg:text-2xl text-primary-100 mb-10 leading-relaxed">
              Start your free accessibility audit today. No credit card required.
            </p>
            <Link to="/register" className="group inline-block">
              <Button size="lg" className="bg-white text-primary-600 hover:bg-gray-50 shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300 text-lg px-8 py-4">
                Get Started Now
                <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-8 text-primary-100">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">Free 14-day trial</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">No credit card needed</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="font-medium">Cancel anytime</span>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-400 py-12 lg:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
              <div className="lg:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-accent-400 rounded-lg blur-sm opacity-75"></div>
                    <Shield className="relative h-8 w-8 text-primary-400" />
                  </div>
                  <span className="text-2xl font-bold text-white">Lucy</span>
                </div>
                <p className="text-gray-400 max-w-md leading-relaxed">
                  Making the web accessible for everyone. Automated WCAG compliance audits and accessibility monitoring for modern websites.
                </p>
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-4">Product</h3>
                <ul className="space-y-2">
                  <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                  <li><Link to="/demo" className="hover:text-white transition-colors">Demo</Link></li>
                  <li><Link to="/roadmap" className="hover:text-white transition-colors">Roadmap</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-white font-semibold mb-4">Account</h3>
                <ul className="space-y-2">
                  <li><Link to="/login" className="hover:text-white transition-colors">Login</Link></li>
                  <li><Link to="/register" className="hover:text-white transition-colors">Sign Up</Link></li>
                </ul>
              </div>
            </div>
            
            <div className="pt-8 border-t border-gray-800">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-sm text-center md:text-left">
                  © 2024 Lucy WCAG Machine. All rights reserved.
                </div>
                <div className="flex items-center space-x-6 text-sm">
                  <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                  <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                  <a href="#" className="hover:text-white transition-colors">Contact</a>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
