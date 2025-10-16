import { useState } from "react";
import { X, Repeat, AlertCircle, Sparkles, MapPin, Store, Utensils, Heart, GraduationCap, Briefcase, Home, Palette, Wrench } from "lucide-react";
import { Button } from "~/components/Button";
import { ShuffleExamples } from "~/components/ShuffleExamples";

interface ShuffleModalProps {
  projectId: number;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { category: string; demographics?: string; sitesToDiscover: number }) => void;
  isLoading?: boolean;
}

export function ShuffleModal({ projectId, isOpen, onClose, onSubmit, isLoading }: ShuffleModalProps) {
  const [category, setCategory] = useState("");
  const [demographics, setDemographics] = useState("");
  const [sitesToDiscover, setSitesToDiscover] = useState(20);
  const [showExamples, setShowExamples] = useState(true);
  
  const handleExampleClick = (exampleCategory: string, exampleDemographics: string) => {
    setCategory(exampleCategory);
    setDemographics(exampleDemographics);
    setShowExamples(false);
    // Scroll to the form
    setTimeout(() => {
      document.getElementById('category')?.focus();
    }, 100);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      category,
      demographics: demographics.trim() || undefined,
      sitesToDiscover,
    });
  };
  
  const handleClose = () => {
    if (!isLoading) {
      setCategory("");
      setDemographics("");
      setSitesToDiscover(20);
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-900/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center">
              <Repeat className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Shuffle & Scan</h2>
              <p className="text-sm text-gray-600">Discover and audit websites by category</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {showExamples && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">Discovery Examples</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowExamples(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Hide examples
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Click any example to auto-fill the form, or create your own custom search
            </p>
            <div className="max-h-96 overflow-y-auto pr-2">
              <ShuffleExamples onExampleClick={handleExampleClick} />
            </div>
          </div>
        )}

        {!showExamples && (
          <button
            type="button"
            onClick={() => setShowExamples(true)}
            className="mb-6 text-sm text-primary-600 hover:text-primary-700 flex items-center space-x-1"
          >
            <Sparkles className="h-4 w-4" />
            <span>Show examples</span>
          </button>
        )}

        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">How Shuffle Works:</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-800">
                <li>Discovers websites matching your category</li>
                <li>Scans each site for WCAG compliance</li>
                <li>For non-compliant sites (≥70% risk score), extracts decision-makers</li>
                <li>Integrates companies and leads with HubSpot</li>
              </ol>
              <p className="mt-2 text-xs text-blue-700">
                <strong>Note:</strong> Requires SERPER_API_KEY. HubSpot integration requires HUBSPOT_API_KEY.
              </p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category / Search Term <span className="text-red-500">*</span>
              </label>
              <input
                id="category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="e.g., boutique clothing stores, dental clinics, craft breweries"
                required
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter a business category or industry. The more specific, the better the results.
              </p>
            </div>
            
            <div>
              <label htmlFor="demographics" className="block text-sm font-medium text-gray-700 mb-2">
                Demographics / Location (Optional)
              </label>
              <input
                id="demographics"
                type="text"
                value={demographics}
                onChange={(e) => setDemographics(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="e.g., in California, small business, boutique, independent"
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-500">
                Add location, size, or characteristics to refine your search.
              </p>
            </div>
            
            <div>
              <label htmlFor="sitesToDiscover" className="block text-sm font-medium text-gray-700 mb-2">
                Number of Sites to Discover
              </label>
              <div className="flex items-center space-x-4">
                <input
                  id="sitesToDiscover"
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={sitesToDiscover}
                  onChange={(e) => setSitesToDiscover(Number(e.target.value))}
                  className="flex-1"
                  disabled={isLoading}
                />
                <span className="text-lg font-bold text-primary-600 w-12 text-right">
                  {sitesToDiscover}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                More sites = longer processing time. Each site will be scanned for WCAG compliance.
              </p>
            </div>
          </div>
          
          <div className="flex space-x-4 mt-8">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              isLoading={isLoading}
              disabled={!category.trim()}
            >
              <Repeat className="h-5 w-5 mr-2" />
              Start Shuffle
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
