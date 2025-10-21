import { useState } from "react";
import { X, Mail, Plus, Trash2 } from "lucide-react";
import { Button } from "~/components/Button";

interface ShareReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { recipients: string[]; message?: string }) => Promise<void>;
  documentTitle: string;
  documentType: string;
  isLoading?: boolean;
}

export function ShareReportModal({
  isOpen,
  onClose,
  onSubmit,
  documentTitle,
  documentType,
  isLoading = false,
}: ShareReportModalProps) {
  const [recipients, setRecipients] = useState<string[]>([""]);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<number, string>>({});
  
  if (!isOpen) return null;
  
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  const handleAddRecipient = () => {
    if (recipients.length < 10) {
      setRecipients([...recipients, ""]);
    }
  };
  
  const handleRemoveRecipient = (index: number) => {
    if (recipients.length > 1) {
      const newRecipients = recipients.filter((_, i) => i !== index);
      setRecipients(newRecipients);
      
      // Remove error for this index
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);
    }
  };
  
  const handleRecipientChange = (index: number, value: string) => {
    const newRecipients = [...recipients];
    newRecipients[index] = value;
    setRecipients(newRecipients);
    
    // Clear error for this field when user types
    if (errors[index]) {
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all recipients
    const newErrors: Record<number, string> = {};
    const validRecipients = recipients.filter((email, index) => {
      const trimmedEmail = email.trim();
      if (!trimmedEmail) {
        newErrors[index] = "Email is required";
        return false;
      }
      if (!validateEmail(trimmedEmail)) {
        newErrors[index] = "Invalid email address";
        return false;
      }
      return true;
    });
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    if (validRecipients.length === 0) {
      return;
    }
    
    await onSubmit({
      recipients: validRecipients.map(email => email.trim()),
      message: message.trim() || undefined,
    });
    
    // Reset form on success
    setRecipients([""]);
    setMessage("");
    setErrors({});
  };
  
  const handleClose = () => {
    if (!isLoading) {
      setRecipients([""]);
      setMessage("");
      setErrors({});
      onClose();
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-gray-900/50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Share Report</h2>
            <p className="text-sm text-gray-600 mt-1">{documentTitle}</p>
          </div>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Recipients
              </label>
              {recipients.length < 10 && (
                <button
                  type="button"
                  onClick={handleAddRecipient}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Recipient
                </button>
              )}
            </div>
            
            <div className="space-y-3">
              {recipients.map((recipient, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="flex-1">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={recipient}
                        onChange={(e) => handleRecipientChange(index, e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                          errors[index] ? "border-red-300 focus:ring-red-500" : "border-gray-300 focus:ring-primary-500"
                        } focus:ring-2 focus:border-transparent transition-all`}
                        placeholder="stakeholder@example.com"
                        disabled={isLoading}
                      />
                    </div>
                    {errors[index] && (
                      <p className="mt-1 text-sm text-red-600">{errors[index]}</p>
                    )}
                  </div>
                  {recipients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRecipient(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      disabled={isLoading}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <p className="mt-2 text-xs text-gray-500">
              You can add up to 10 recipients. Each will receive a secure link to the report.
            </p>
          </div>
          
          <div className="mb-6">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Message (Optional)
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
              placeholder="Add a personal message to include with the report..."
              disabled={isLoading}
              maxLength={500}
            />
            <p className="mt-1 text-xs text-gray-500 text-right">
              {message.length}/500 characters
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>📧 What happens next:</strong>
            </p>
            <ul className="mt-2 text-sm text-blue-700 space-y-1 ml-4 list-disc">
              <li>Recipients will receive an email with a secure link to the report</li>
              <li>The link will be valid for 7 days</li>
              <li>They can download the PDF directly from the email</li>
            </ul>
          </div>
          
          <div className="flex space-x-4">
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
            >
              <Mail className="h-5 w-5 mr-2" />
              Share Report
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
