import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Palette, Upload, Eye, Save, AlertCircle } from "lucide-react";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useTRPC } from "~/trpc/react";
import { useAuthStore } from "~/stores/auth";
import { DashboardLayout } from "~/components/DashboardLayout";
import { Button } from "~/components/Button";

export const Route = createFileRoute("/settings/branding/")({
  component: BrandingPage,
});

type BrandingFormData = {
  brandingEnabled: boolean;
  customDomain: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
};

function BrandingPage() {
  const { authToken, subscription } = useAuthStore();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const brandingQuery = useQuery(
    trpc.getLicenseBranding.queryOptions({ authToken: authToken || "" })
  );
  
  const updateBrandingMutation = useMutation(
    trpc.updateLicenseBranding.mutationOptions({
      onSuccess: () => {
        toast.success("Branding settings saved successfully!");
        queryClient.invalidateQueries({ queryKey: trpc.getLicenseBranding.queryKey() });
      },
      onError: (error) => {
        toast.error(error.message || "Failed to save branding settings");
      },
    })
  );
  
  const getUploadUrlMutation = useMutation(
    trpc.getPresignedLogoUploadUrl.mutationOptions({
      onError: (error) => {
        toast.error(error.message || "Failed to generate upload URL");
      },
    })
  );
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<BrandingFormData>({
    defaultValues: {
      brandingEnabled: brandingQuery.data?.branding.brandingEnabled || false,
      customDomain: brandingQuery.data?.branding.customDomain || "",
      primaryColor: brandingQuery.data?.branding.primaryColor || "#3B82F6",
      secondaryColor: brandingQuery.data?.branding.secondaryColor || "#8B5CF6",
      accentColor: brandingQuery.data?.branding.accentColor || "#EC4899",
    },
  });
  
  // Update form when data loads
  if (brandingQuery.data && !isDirty) {
    setValue("brandingEnabled", brandingQuery.data.branding.brandingEnabled);
    setValue("customDomain", brandingQuery.data.branding.customDomain || "");
    setValue("primaryColor", brandingQuery.data.branding.primaryColor);
    setValue("secondaryColor", brandingQuery.data.branding.secondaryColor);
    setValue("accentColor", brandingQuery.data.branding.accentColor);
    if (brandingQuery.data.branding.logoUrl && !logoPreview) {
      setLogoPreview(brandingQuery.data.branding.logoUrl);
    }
  }
  
  const watchedColors = watch();
  
  if (!authToken) {
    navigate({ to: "/login" });
    return null;
  }
  
  // Check if user has white-label access
  if (!subscription?.hasWhiteLabel) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                  Enterprise Plan Required
                </h3>
                <p className="text-yellow-800 mb-4">
                  White-label branding customization is only available for Enterprise customers.
                  Upgrade your plan to access this feature.
                </p>
                <Button onClick={() => navigate({ to: "/settings/billing" })}>
                  View Plans
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Logo file must be smaller than 5MB");
        return;
      }
      
      setLogoFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return null;
    
    setIsUploading(true);
    try {
      // Get presigned upload URL
      const urlData = await getUploadUrlMutation.mutateAsync({
        authToken: authToken!,
        filename: logoFile.name,
        contentType: logoFile.type,
      });
      
      // Upload file directly to Minio
      const uploadResponse = await fetch(urlData.uploadUrl, {
        method: "PUT",
        body: logoFile,
        headers: {
          "Content-Type": logoFile.type,
        },
      });
      
      if (!uploadResponse.ok) {
        throw new Error("Failed to upload logo");
      }
      
      return urlData.publicUrl;
    } catch (error) {
      console.error("Logo upload error:", error);
      toast.error("Failed to upload logo");
      return null;
    } finally {
      setIsUploading(false);
    }
  };
  
  const onSubmit = async (data: BrandingFormData) => {
    let logoUrl = brandingQuery.data?.branding.logoUrl || null;
    
    // Upload new logo if one was selected
    if (logoFile) {
      const uploadedUrl = await uploadLogo();
      if (uploadedUrl) {
        logoUrl = uploadedUrl;
      } else {
        return; // Don't save if logo upload failed
      }
    }
    
    updateBrandingMutation.mutate({
      authToken: authToken!,
      brandingEnabled: data.brandingEnabled,
      customDomain: data.customDomain || null,
      primaryColor: data.primaryColor,
      secondaryColor: data.secondaryColor,
      accentColor: data.accentColor,
      logoUrl,
      customLogo: logoUrl,
    });
  };
  
  if (brandingQuery.isLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Palette className="h-6 w-6 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">White-Label Branding</h1>
          </div>
          <p className="text-gray-600">
            Customize your platform's appearance with your own branding, colors, and logo
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Enable Branding Toggle */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Enable Custom Branding
                    </h3>
                    <p className="text-sm text-gray-600">
                      Apply your custom branding across the platform
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("brandingEnabled")}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
              
              {/* Custom Domain */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Custom Domain</h3>
                <div>
                  <label htmlFor="customDomain" className="block text-sm font-medium text-gray-700 mb-2">
                    Domain Name
                  </label>
                  <input
                    id="customDomain"
                    type="text"
                    placeholder="app.yourdomain.com"
                    {...register("customDomain")}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Contact support to configure DNS settings for your custom domain
                  </p>
                </div>
              </div>
              
              {/* Logo Upload */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Logo</h3>
                <div className="space-y-4">
                  {logoPreview && (
                    <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="max-h-24 max-w-full object-contain"
                      />
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {logoPreview ? "Change Logo" : "Upload Logo"}
                  </Button>
                  <p className="text-xs text-gray-500">
                    Recommended: PNG or SVG, max 5MB, transparent background
                  </p>
                </div>
              </div>
              
              {/* Color Customization */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Brand Colors</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        id="primaryColor"
                        type="color"
                        {...register("primaryColor", {
                          pattern: {
                            value: /^#[0-9A-Fa-f]{6}$/,
                            message: "Invalid color format",
                          },
                        })}
                        className="h-12 w-20 rounded-lg border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={watchedColors.primaryColor}
                        onChange={(e) => setValue("primaryColor", e.target.value)}
                        className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-mono text-sm"
                        placeholder="#3B82F6"
                      />
                    </div>
                    {errors.primaryColor && (
                      <p className="text-sm text-red-600 mt-1">{errors.primaryColor.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        id="secondaryColor"
                        type="color"
                        {...register("secondaryColor", {
                          pattern: {
                            value: /^#[0-9A-Fa-f]{6}$/,
                            message: "Invalid color format",
                          },
                        })}
                        className="h-12 w-20 rounded-lg border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={watchedColors.secondaryColor}
                        onChange={(e) => setValue("secondaryColor", e.target.value)}
                        className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-mono text-sm"
                        placeholder="#8B5CF6"
                      />
                    </div>
                    {errors.secondaryColor && (
                      <p className="text-sm text-red-600 mt-1">{errors.secondaryColor.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="accentColor" className="block text-sm font-medium text-gray-700 mb-2">
                      Accent Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        id="accentColor"
                        type="color"
                        {...register("accentColor", {
                          pattern: {
                            value: /^#[0-9A-Fa-f]{6}$/,
                            message: "Invalid color format",
                          },
                        })}
                        className="h-12 w-20 rounded-lg border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={watchedColors.accentColor}
                        onChange={(e) => setValue("accentColor", e.target.value)}
                        className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-mono text-sm"
                        placeholder="#EC4899"
                      />
                    </div>
                    {errors.accentColor && (
                      <p className="text-sm text-red-600 mt-1">{errors.accentColor.message}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Save Button */}
              <Button
                type="submit"
                className="w-full"
                isLoading={updateBrandingMutation.isPending || isUploading}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Branding Settings
              </Button>
            </form>
          </div>
          
          {/* Preview Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
              <div className="flex items-center space-x-2 mb-4">
                <Eye className="h-5 w-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
              </div>
              
              {/* Preview Container */}
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                {/* Preview Header */}
                <div
                  className="p-4 flex items-center space-x-3"
                  style={{ backgroundColor: watchedColors.primaryColor }}
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="h-8 max-w-[120px] object-contain" />
                  ) : (
                    <div className="h-8 w-8 bg-white/20 rounded flex items-center justify-center text-white font-bold">
                      L
                    </div>
                  )}
                  <span className="text-white font-semibold text-lg">Your Platform</span>
                </div>
                
                {/* Preview Content */}
                <div className="p-6 bg-gray-50">
                  <div className="space-y-4">
                    <div
                      className="p-4 rounded-lg text-white"
                      style={{ backgroundColor: watchedColors.primaryColor }}
                    >
                      <h4 className="font-semibold mb-1">Primary Color</h4>
                      <p className="text-sm text-white/90">Used for main buttons and headers</p>
                    </div>
                    
                    <div
                      className="p-4 rounded-lg text-white"
                      style={{ backgroundColor: watchedColors.secondaryColor }}
                    >
                      <h4 className="font-semibold mb-1">Secondary Color</h4>
                      <p className="text-sm text-white/90">Used for secondary elements</p>
                    </div>
                    
                    <div
                      className="p-4 rounded-lg text-white"
                      style={{ backgroundColor: watchedColors.accentColor }}
                    >
                      <h4 className="font-semibold mb-1">Accent Color</h4>
                      <p className="text-sm text-white/90">Used for highlights and CTAs</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        className="flex-1 py-2 px-4 rounded-lg text-white font-medium transition-opacity hover:opacity-90"
                        style={{ backgroundColor: watchedColors.primaryColor }}
                      >
                        Primary Button
                      </button>
                      <button
                        className="flex-1 py-2 px-4 rounded-lg text-white font-medium transition-opacity hover:opacity-90"
                        style={{ backgroundColor: watchedColors.accentColor }}
                      >
                        Accent Button
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Changes will be reflected across your white-labeled platform
                  after saving. Custom domain configuration requires DNS setup - contact support for
                  assistance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
