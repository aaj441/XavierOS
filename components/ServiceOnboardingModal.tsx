import { useState, ReactNode } from "react";
import { X, ChevronLeft, ChevronRight, CheckCircle, HelpCircle } from "lucide-react";
import { Button } from "~/components/Button";

type Step = {
  id: string;
  title: string;
  description: string;
  content: ReactNode;
  helpText?: string;
  validation?: () => boolean | string; // Returns true or error message
};

type ServiceOnboardingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  steps: Step[];
  onComplete: (data: any) => void;
  isLoading?: boolean;
};

export function ServiceOnboardingModal({
  isOpen,
  onClose,
  title,
  steps,
  onComplete,
  isLoading = false,
}: ServiceOnboardingModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [showHelp, setShowHelp] = useState(false);
  
  if (!isOpen) return null;
  
  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const progress = ((currentStepIndex + 1) / steps.length) * 100;
  
  const handleNext = () => {
    // Validate current step
    if (currentStep.validation) {
      const result = currentStep.validation();
      if (result !== true) {
        alert(typeof result === "string" ? result : "Please complete this step");
        return;
      }
    }
    
    // Mark step as completed
    setCompletedSteps(prev => new Set(prev).add(currentStep.id));
    
    if (isLastStep) {
      onComplete({});
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };
  
  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Progress Bar */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Step {currentStepIndex + 1} of {steps.length}
              </span>
              <span className="text-sm font-medium text-primary-600">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary-600 to-accent-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{currentStep.title}</h3>
                <p className="text-gray-600 leading-relaxed">{currentStep.description}</p>
              </div>
              {currentStep.helpText && (
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className="ml-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Show help"
                >
                  <HelpCircle className="h-5 w-5 text-primary-600" />
                </button>
              )}
            </div>
            
            {showHelp && currentStep.helpText && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">{currentStep.helpText}</p>
              </div>
            )}
          </div>
          
          <div className="mt-6">
            {currentStep.content}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={isFirstStep || isLoading}
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Back
            </Button>
            
            {/* Step Indicators */}
            <div className="flex items-center space-x-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`h-2 w-2 rounded-full transition-all duration-300 ${
                    index === currentStepIndex
                      ? "bg-primary-600 w-8"
                      : completedSteps.has(step.id)
                      ? "bg-green-600"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
            
            <Button
              type="button"
              onClick={handleNext}
              isLoading={isLoading}
              disabled={isLoading}
            >
              {isLastStep ? (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Complete
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="h-5 w-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
