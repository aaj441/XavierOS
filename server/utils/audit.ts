import { db } from "~/server/db";

export type AuditAction =
  | "report_generated"
  | "report_viewed"
  | "report_shared"
  | "report_downloaded"
  | "scan_started"
  | "scan_completed"
  | "scan_error"
  | "schedule_created"
  | "schedule_updated"
  | "schedule_deleted"
  | "settings_updated"
  | "branding_updated"
  | "user_login"
  | "user_logout"
  | "user_registered"
  | "project_created"
  | "project_updated"
  | "project_deleted"
  | "organization_created"
  | "organization_member_added"
  | "organization_member_removed"
  | "api_key_created"
  | "api_key_revoked"
  | "subscription_updated"
  | "payment_processed";

export type AuditResourceType =
  | "project"
  | "scan"
  | "report"
  | "user"
  | "organization"
  | "schedule"
  | "api_key"
  | "subscription";

export interface CreateAuditLogParams {
  userId?: number;
  organizationId?: number;
  action: AuditAction;
  resourceType?: AuditResourceType;
  resourceId?: number;
  description: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  success?: boolean;
  errorMessage?: string;
}

export async function createAuditLog(params: CreateAuditLogParams): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        userId: params.userId,
        organizationId: params.organizationId,
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        description: params.description,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        success: params.success ?? true,
        errorMessage: params.errorMessage,
      },
    });
  } catch (error) {
    // Don't throw errors from audit logging to avoid breaking the main flow
    console.error("Failed to create audit log:", error);
  }
}

export async function getAuditLogs(params: {
  userId?: number;
  organizationId?: number;
  action?: AuditAction;
  resourceType?: AuditResourceType;
  resourceId?: number;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) {
  const whereClause: any = {};
  
  if (params.userId) whereClause.userId = params.userId;
  if (params.organizationId) whereClause.organizationId = params.organizationId;
  if (params.action) whereClause.action = params.action;
  if (params.resourceType) whereClause.resourceType = params.resourceType;
  if (params.resourceId) whereClause.resourceId = params.resourceId;
  
  if (params.startDate || params.endDate) {
    whereClause.timestamp = {};
    if (params.startDate) whereClause.timestamp.gte = params.startDate;
    if (params.endDate) whereClause.timestamp.lte = params.endDate;
  }
  
  const logs = await db.auditLog.findMany({
    where: whereClause,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      organization: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { timestamp: "desc" },
    take: params.limit || 100,
    skip: params.offset || 0,
  });
  
  return logs.map(log => ({
    id: log.id,
    user: log.user,
    organization: log.organization,
    action: log.action,
    resourceType: log.resourceType,
    resourceId: log.resourceId,
    description: log.description,
    metadata: log.metadata ? JSON.parse(log.metadata) : null,
    ipAddress: log.ipAddress,
    userAgent: log.userAgent,
    success: log.success,
    errorMessage: log.errorMessage,
    timestamp: log.timestamp,
  }));
}
