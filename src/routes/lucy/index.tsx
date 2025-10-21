import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { 
  Search, 
  Camera, 
  FileText, 
  Database, 
  Mail, 
  CheckCircle, 
  Send,
  ChevronRight,
  AlertCircle,
  Eye,
  Download
} from 'lucide-react';

export const Route = createFileRoute('/lucy/')({
  component: LucyWorkflow,
});

interface Lead {
  id: string;
  companyName: string;
  website: string;
  industry: string;
  status: 'analyzing' | 'pdf-ready' | 'draft-ready' | 'review' | 'sent';
  wcagIssues: number;
  screenshotUrl?: string;
  pdfUrl?: string;
  emailDraft?: string;
  contactEmail?: string;
}

function LucyWorkflow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [verticalKeywords, setVerticalKeywords] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const workflowSteps = [
    { id: 1, title: 'Vertical Input', icon: Search, description: 'Enter industry keywords' },
    { id: 2, title: 'Discovery', icon: Camera, description: 'Find & screenshot SMBs' },
    { id: 3, title: 'WCAG Analysis', icon: AlertCircle, description: 'Identify compliance issues' },
    { id: 4, title: 'PDF Generation', icon: FileText, description: 'Create visual reports' },
    { id: 5, title: 'HubSpot Sync', icon: Database, description: 'Research & input leads' },
    { id: 6, title: 'Email Draft', icon: Mail, description: 'Generate sales email' },
    { id: 7, title: 'Human Review', icon: Eye, description: 'Personalize & approve' },
    { id: 8, title: 'Send & Schedule', icon: Send, description: 'Execute outreach' }
  ];

  const startDiscovery = async () => {
    if (!verticalKeywords.trim()) return;
    
    setIsProcessing(true);
    setCurrentStep(2);
    
    // Simulate discovery process
    setTimeout(() => {
      const mockLeads: Lead[] = [
        {
          id: '1',
          companyName: 'Acme Healthcare Solutions',
          website: 'https://acme-health.example.com',
          industry: verticalKeywords,
          status: 'analyzing',
          wcagIssues: 23,
          screenshotUrl: 'https://via.placeholder.com/800x600',
        },
        {
          id: '2',
          companyName: 'Smith Medical Group',
          website: 'https://smith-medical.example.com',
          industry: verticalKeywords,
          status: 'analyzing',
          wcagIssues: 31,
          screenshotUrl: 'https://via.placeholder.com/800x600',
        },
        {
          id: '3',
          companyName: 'Johnson Dental Care',
          website: 'https://johnson-dental.example.com',
          industry: verticalKeywords,
          status: 'analyzing',
          wcagIssues: 18,
          screenshotUrl: 'https://via.placeholder.com/800x600',
        },
      ];
      
      setLeads(mockLeads);
      setIsProcessing(false);
      setCurrentStep(3);
    }, 3000);
  };

  const processLeadToReview = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      const updatedLead = {
        ...lead,
        status: 'review' as const,
        pdfUrl: '/mock-pdf-report.pdf',
        emailDraft: generateMockEmailDraft(lead),
        contactEmail: 'contact@' + lead.website.replace('https://', '').split('.')[0] + '.com'
      };
      
      setLeads(leads.map(l => l.id === leadId ? updatedLead : l));
      setSelectedLead(updatedLead);
      setCurrentStep(7);
    }
  };

  const generateMockEmailDraft = (lead: Lead) => {
    return `Subject: Improve ${lead.companyName}'s Digital Accessibility - ADA Compliance

Hi [First Name],

I recently visited ${lead.website} and was impressed by your ${lead.industry} services. However, I noticed ${lead.wcagIssues} accessibility issues that could expose ${lead.companyName} to ADA compliance risks.

**Key Issues Identified:**
• Missing alt text on images (lawsuit risk)
• Poor color contrast ratios (WCAG 2.1 AA failure)
• Keyboard navigation problems
• Screen reader incompatibility

I've prepared a detailed visual report showing exactly where these issues appear on your site. Would you be open to a 15-minute call to review the findings?

**Why This Matters:**
- 71% of disabled users leave inaccessible sites immediately
- ADA website lawsuits increased 300% in 2023
- Average settlement: $75,000+

I'd love to show you how we can make your site fully compliant within 2-4 weeks.

Are you available this Tuesday or Wednesday for a brief call?

Best regards,
[Your Name]
[Your Company]

P.S. I've attached a free accessibility audit report highlighting the specific issues.`;
  };

  const approveAndSendEmail = (leadId: string) => {
    setLeads(leads.map(l => 
      l.id === leadId ? { ...l, status: 'sent' as const } : l
    ));
    setSelectedLead(null);
    alert('Email sent! Follow-ups scheduled for 3, 7, and 14 days.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header - BOLD MODERN */}
      <div className="relative overflow-hidden bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 py-24">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/20 via-purple-600/20 to-blue-600/20 animate-pulse-slow"></div>
        
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center">
            {/* Large animated icon */}
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/20 backdrop-blur-xl rounded-3xl mb-8 shadow-mega animate-bounce-slow">
              <Mail className="w-14 h-14 text-white drop-shadow-lg" />
            </div>
            
            {/* MEGA heading */}
            <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight">
              Lucy
            </h1>
            <p className="text-3xl font-bold text-white/90 mb-4">
              WCAG Sales Prospecting System
            </p>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Automated accessibility prospecting that finds leads, analyzes compliance, and generates personalized outreach
            </p>
          </div>
        </div>
      </div>

      {/* Workflow Progress */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-3xl p-10 shadow-bold border-4 border-purple-200 mb-12">
          <h2 className="text-4xl font-black text-gray-900 mb-8 text-center">
            🚀 Workflow Progress
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {workflowSteps.map((step) => (
              <div 
                key={step.id} 
                className={`relative p-6 rounded-2xl transition-all duration-300 hover:scale-105 ${
                  currentStep >= step.id 
                    ? 'bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-bold' 
                    : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                }`}
              >
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-3 ${
                  currentStep >= step.id ? 'bg-white/20' : 'bg-gray-200'
                }`}>
                  <step.icon className="w-7 h-7" />
                </div>
                <div className="font-bold text-sm">
                  {step.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Input & Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Step 1: Vertical Keywords Input */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Search className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-800">Vertical Input</h2>
              </div>
              
              <textarea
                value={verticalKeywords}
                onChange={(e) => setVerticalKeywords(e.target.value)}
                placeholder="Enter industry keywords... (e.g., 'healthcare', 'dental practices', 'law firms', 'restaurants')"
                className="w-full h-32 p-4 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm text-slate-700 placeholder-slate-400 mb-4"
              />
              
              <button
                onClick={startDiscovery}
                disabled={isProcessing || !verticalKeywords.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-8 rounded-2xl font-black text-lg shadow-bold hover:shadow-mega transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Discovering Leads...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Start Discovery
                  </>
                )}
              </button>
            </div>

            {/* Stats Card */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
              <h3 className="text-lg font-semibold mb-4">Campaign Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Leads Discovered</span>
                  <span className="text-2xl font-bold">{leads.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">In Review</span>
                  <span className="text-2xl font-bold">
                    {leads.filter(l => l.status === 'review').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100">Emails Sent</span>
                  <span className="text-2xl font-bold">
                    {leads.filter(l => l.status === 'sent').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="font-semibold text-slate-800 mb-3">💡 Best Practices</h3>
              <ul className="text-sm text-slate-600 space-y-2">
                <li>• Focus on specific verticals for personalization</li>
                <li>• Review WCAG reports before sending emails</li>
                <li>• Customize email drafts with personal touches</li>
                <li>• Schedule follow-ups strategically</li>
              </ul>
            </div>
          </div>

          {/* Right Column - Leads & Results */}
          <div className="lg:col-span-2 space-y-6">
            {selectedLead ? (
              /* Human Review Interface */
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <Eye className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-slate-800">{selectedLead.companyName}</h2>
                      <p className="text-sm text-slate-600">{selectedLead.website}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    ✕
                  </button>
                </div>

                {/* WCAG Report Preview */}
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-red-900">
                      {selectedLead.wcagIssues} WCAG Issues Found
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-red-300 rounded-lg text-red-700 hover:bg-red-50 text-sm font-medium">
                      <Eye className="w-4 h-4" />
                      View Screenshot
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-red-300 rounded-lg text-red-700 hover:bg-red-50 text-sm font-medium">
                      <Download className="w-4 h-4" />
                      Download PDF Report
                    </button>
                  </div>
                </div>

                {/* Email Draft */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email Draft (Edit to personalize)
                  </label>
                  <textarea
                    defaultValue={selectedLead.emailDraft}
                    className="w-full h-64 p-4 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-slate-700 font-mono text-sm"
                  />
                </div>

                {/* Contact Email */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Send To
                  </label>
                  <input
                    type="email"
                    defaultValue={selectedLead.contactEmail}
                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white text-slate-700"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => approveAndSendEmail(selectedLead.id)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-8 rounded-2xl font-black text-lg shadow-bold hover:shadow-mega transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Approve & Send Email
                  </button>
                  <button
                    onClick={() => setSelectedLead(null)}
                    className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-300 transition-colors"
                  >
                    Skip
                  </button>
                </div>
              </div>
            ) : (
              /* Leads List */
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Database className="w-5 h-5 text-purple-600" />
                  </div>
                  <h2 className="text-2xl font-semibold text-slate-800">Discovered Leads</h2>
                </div>

                {leads.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No leads yet. Enter vertical keywords to start discovery.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leads.map((lead) => (
                      <div
                        key={lead.id}
                        className="p-6 border border-slate-200 rounded-xl hover:shadow-lg transition-all bg-white"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-bold text-slate-800">{lead.companyName}</h3>
                            <p className="text-sm text-slate-600">{lead.website}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            lead.status === 'sent' ? 'bg-green-100 text-green-700' :
                            lead.status === 'review' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {lead.status === 'sent' ? 'Sent' :
                             lead.status === 'review' ? 'Ready for Review' :
                             'Processing'}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 mb-4 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            {lead.wcagIssues} issues
                          </span>
                          <span>•</span>
                          <span>{lead.industry}</span>
                        </div>

                        {lead.status !== 'sent' && (
                          <button
                            onClick={() => processLeadToReview(lead.id)}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Review & Send
                          </button>
                        )}
                        
                        {lead.status === 'sent' && (
                          <div className="flex items-center gap-2 text-green-600 font-medium">
                            <CheckCircle className="w-5 h-5" />
                            Email sent - Follow-ups scheduled
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

