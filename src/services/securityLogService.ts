import { prisma } from "@/lib/prisma";
import { EventType, LogStatus } from "@prisma/client";

interface LogEventInput {
  actorName: string;
  actorRole: string;
  actorId?: string | null;
  eventType: EventType;
  resource: string;
  ipAddress?: string | null;
  status?: LogStatus;
  metadata?: Record<string, unknown>;
}

/**
 * Creates a security log entry. Non-blocking - errors are silently swallowed
 * so they never interfere with the main business logic.
 */
export async function logSecurityEvent(input: LogEventInput): Promise<void> {
  try {
    await prisma.securityLog.create({
      data: {
        actorName: input.actorName,
        actorRole: input.actorRole,
        actorId: input.actorId ?? null,
        eventType: input.eventType,
        resource: input.resource,
        ipAddress: input.ipAddress ?? null,
        status: input.status ?? LogStatus.SUCCESS,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      },
    });
  } catch (err) {
    // Silently fail — logging must never block the primary operation
    console.error("[SecurityLog] Failed to write log entry:", err);
  }
}

/**
 * Extracts the real IP from a Next.js request (handles proxies).
 */
export function getClientIp(req: Request): string | null {
  const headers = req.headers as unknown as Headers;
  return (
    headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    headers.get("x-real-ip") ||
    null
  );
}
