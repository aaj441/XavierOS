import {
  createCallerFactory,
  createTRPCRouter,
} from "~/server/trpc/main";
import { register } from "~/server/trpc/procedures/register";
import { login } from "~/server/trpc/procedures/login";
import { getCurrentUser } from "~/server/trpc/procedures/getCurrentUser";
import { createProject } from "~/server/trpc/procedures/createProject";
import { getProjects } from "~/server/trpc/procedures/getProjects";
import { addUrl } from "~/server/trpc/procedures/addUrl";
import { startScan } from "~/server/trpc/procedures/startScan";
import { getProjectDetails } from "~/server/trpc/procedures/getProjectDetails";
import { getScanDetails } from "~/server/trpc/procedures/getScanDetails";
import { getMinioBaseUrl } from "~/server/trpc/procedures/getMinioBaseUrl";
import { exportScanPdf } from "~/server/trpc/procedures/exportScanPdf";
import { exportScanCsv } from "~/server/trpc/procedures/exportScanCsv";
import { exportAnalyticsPdf } from "~/server/trpc/procedures/exportAnalyticsPdf";
import { exportAnalyticsCsv } from "~/server/trpc/procedures/exportAnalyticsCsv";
import { getAnalytics } from "~/server/trpc/procedures/getAnalytics";
import { createSchedule } from "~/server/trpc/procedures/createSchedule";
import { getSchedules } from "~/server/trpc/procedures/getSchedules";
import { updateSchedule } from "~/server/trpc/procedures/updateSchedule";
import { deleteSchedule } from "~/server/trpc/procedures/deleteSchedule";
import { updateNotificationPreferences } from "~/server/trpc/procedures/updateNotificationPreferences";
import { startShuffle } from "~/server/trpc/procedures/startShuffle";
import { getShuffleSessions } from "~/server/trpc/procedures/getShuffleSessions";
import { getShuffleDetails } from "~/server/trpc/procedures/getShuffleDetails";
import { calculateLawsuitRisk } from "~/server/trpc/procedures/calculateLawsuitRisk";
import { updateProjectMetadata } from "~/server/trpc/procedures/updateProjectMetadata";
import { updateProjectTags } from "~/server/trpc/procedures/updateProjectTags";
import { archiveProject } from "~/server/trpc/procedures/archiveProject";
import { duplicateProject } from "~/server/trpc/procedures/duplicateProject";
import { generateAccessibilityStatement } from "~/server/trpc/procedures/generateAccessibilityStatement";
import { getSubscriptionStatus } from "~/server/trpc/procedures/getSubscriptionStatus";
import { getAvailablePlans } from "~/server/trpc/procedures/getAvailablePlans";
import { purchaseAiCredits } from "~/server/trpc/procedures/purchaseAiCredits";
import { getMarketplaceItems } from "~/server/trpc/procedures/getMarketplaceItems";
import { getLicenseBranding } from "~/server/trpc/procedures/getLicenseBranding";
import { updateLicenseBranding } from "~/server/trpc/procedures/updateLicenseBranding";
import { getPresignedLogoUploadUrl } from "~/server/trpc/procedures/getPresignedLogoUploadUrl";
import { generateExecutiveSummary } from "~/server/trpc/procedures/generateExecutiveSummary";
import { generateComplianceDocument } from "~/server/trpc/procedures/generateComplianceDocument";
import { shareReportByEmail } from "~/server/trpc/procedures/shareReportByEmail";
import { trackReportView } from "~/server/trpc/procedures/trackReportView";
import { getReportEngagement } from "~/server/trpc/procedures/getReportEngagement";
import { createReportSchedule } from "~/server/trpc/procedures/createReportSchedule";
import { getReportSchedules } from "~/server/trpc/procedures/getReportSchedules";
import { generateSalesScript } from "~/server/trpc/procedures/generateSalesScript";
import { generateCertificate } from "~/server/trpc/procedures/generateCertificate";
import { createRemediationRequest } from "~/server/trpc/procedures/createRemediationRequest";
import { getShuffleSalesScripts } from "~/server/trpc/procedures/getShuffleSalesScripts";
import { updateCompanyContactStatus } from "~/server/trpc/procedures/updateCompanyContactStatus";
import { generateScriptForCompany } from "~/server/trpc/procedures/generateScriptForCompany";
import { getSalesAnalytics } from "~/server/trpc/procedures/getSalesAnalytics";

export const appRouter = createTRPCRouter({
  register,
  login,
  getCurrentUser,
  createProject,
  getProjects,
  addUrl,
  startScan,
  getProjectDetails,
  getScanDetails,
  getMinioBaseUrl,
  exportScanPdf,
  exportScanCsv,
  exportAnalyticsPdf,
  exportAnalyticsCsv,
  getAnalytics,
  createSchedule,
  getSchedules,
  updateSchedule,
  deleteSchedule,
  updateNotificationPreferences,
  startShuffle,
  getShuffleSessions,
  getShuffleDetails,
  calculateLawsuitRisk,
  updateProjectMetadata,
  updateProjectTags,
  archiveProject,
  duplicateProject,
  generateAccessibilityStatement,
  
  // Report generation and sharing
  generateExecutiveSummary,
  generateComplianceDocument,
  shareReportByEmail,
  
  // Monetization procedures
  getSubscriptionStatus,
  getAvailablePlans,
  purchaseAiCredits,
  getMarketplaceItems,
  
  // Branding procedures
  getLicenseBranding,
  updateLicenseBranding,
  getPresignedLogoUploadUrl,
  
  // Report engagement tracking
  trackReportView,
  getReportEngagement,
  
  // Report scheduling
  createReportSchedule,
  getReportSchedules,
  
  // Marketplace service procedures
  generateSalesScript,
  generateCertificate,
  createRemediationRequest,
  
  // Sales enablement procedures
  getShuffleSalesScripts,
  updateCompanyContactStatus,
  generateScriptForCompany,
  getSalesAnalytics,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
