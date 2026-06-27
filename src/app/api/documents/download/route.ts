import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role, EventType, LogStatus } from "@prisma/client";
import { logSecurityEvent, getClientIp } from "@/services/securityLogService";
import * as fs from "fs/promises";
import * as path from "path";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filePath = searchParams.get("path") || "";
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      logSecurityEvent({
        actorName: "Unauthenticated",
        actorRole: "Unauthenticated",
        actorId: null,
        eventType: EventType.DOCUMENT_DOWNLOADED,
        resource: filePath ? `FILE-${filePath.slice(0, 15)}` : "Unknown Path",
        ipAddress: getClientIp(req as unknown as Request),
        status: LogStatus.FAILED,
        metadata: { error: "Belum login." },
      });
      return new Response("Unauthorized", { status: 401 });
    }

    if (!filePath) {
      logSecurityEvent({
        actorName: session.user.name || session.user.email || "Unknown",
        actorRole: session.user.role,
        actorId: session.user.id,
        eventType: EventType.DOCUMENT_DOWNLOADED,
        resource: "Missing Path Param",
        ipAddress: getClientIp(req as unknown as Request),
        status: LogStatus.FAILED,
        metadata: { error: "Path is required" },
      });
      return new Response("Bad Request: Path is required", { status: 400 });
    }

    // 1. Fetch document record to check ownership
    const doc = await prisma.documentRecord.findFirst({
      where: { filePath },
    });

    if (!doc) {
      logSecurityEvent({
        actorName: session.user.name || session.user.email || "Unknown",
        actorRole: session.user.role,
        actorId: session.user.id,
        eventType: EventType.DOCUMENT_DOWNLOADED,
        resource: `FILE-${filePath.slice(0, 15)}`,
        ipAddress: getClientIp(req as unknown as Request),
        status: LogStatus.FAILED,
        metadata: { error: "Dokumen tidak ditemukan di database." },
      });
      return new Response("Not Found: Document record not found", {
        status: 404,
      });
    }

    // 2. Access control check
    const userRoles = session.user.roles || [session.user.role];
    const hasAdminOrStaff = userRoles.includes(Role.HR_ADMIN) || userRoles.includes(Role.STAFF);
    if (!hasAdminOrStaff && doc.ownerId !== session.user.id) {
      logSecurityEvent({
        actorName: session.user.name || session.user.email || "Unknown",
        actorRole: session.user.role,
        actorId: session.user.id,
        eventType: EventType.UNAUTHORIZED_ACCESS,
        resource: `${doc.fileName}-${doc.id.slice(0, 8).toUpperCase()}`,
        ipAddress: getClientIp(req as unknown as Request),
        status: LogStatus.FAILED,
        metadata: { error: "Akses ditolak: Tidak memiliki wewenang mengunduh dokumen." },
      });
      return new Response("Forbidden: Access denied", { status: 403 });
    }

    // 3. Resolve file source (Local disk or Cloud storage URL)
    let fileBuffer: Buffer;
    let contentType = "application/octet-stream";

    const ext = path.extname(doc.fileName).toLowerCase();
    if (ext === ".pdf") contentType = "application/pdf";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";

    if (filePath.startsWith("http://") || filePath.startsWith("https://")) {
      // Fetch the file from the cloud storage URL (proxying it securely)
      const cloudResponse = await fetch(filePath);
      if (!cloudResponse.ok) {
        logSecurityEvent({
          actorName: session.user.name || session.user.email || "Unknown",
          actorRole: session.user.role,
          actorId: session.user.id,
          eventType: EventType.DOCUMENT_DOWNLOADED,
          resource: `FILE-${filePath.slice(0, 15)}`,
          ipAddress: getClientIp(req as unknown as Request),
          status: LogStatus.FAILED,
          metadata: { error: `Gagal mengambil file dari cloud storage: ${cloudResponse.statusText}` },
        });
        return new Response("Not Found: Cloud storage file not found", { status: 404 });
      }
      const arrayBuffer = await cloudResponse.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
      
      // Override content type from cloud headers if available
      const cloudContentType = cloudResponse.headers.get("content-type");
      if (cloudContentType) {
        contentType = cloudContentType;
      }
    } else {
      // Handle local disk file path
      // turbopackIgnore: suppress NFT warning — path is sandboxed to LOCAL_STORAGE_PATH
      const baseDir = path.resolve(process.env.LOCAL_STORAGE_PATH || "./storage");
      const absolutePath = path.join(baseDir, filePath);

      // Prevent path traversal outside the base storage directory
      const relative = path.relative(baseDir, absolutePath);
      const isSafe = relative && !relative.startsWith("..") && !path.isAbsolute(relative);
      if (!isSafe) {
        logSecurityEvent({
          actorName: session.user.name || session.user.email || "Unknown",
          actorRole: session.user.role,
          actorId: session.user.id,
          eventType: EventType.UNAUTHORIZED_ACCESS,
          resource: `TRAVERSAL-${filePath.slice(0, 20)}`,
          ipAddress: getClientIp(req as unknown as Request),
          status: LogStatus.FAILED,
          metadata: { error: "Upaya akses path ilegal (path traversal)." },
        });
        return new Response("Forbidden: Invalid file path", { status: 403 });
      }

      fileBuffer = await fs.readFile(absolutePath);
    }

    // Log success
    logSecurityEvent({
      actorName: session.user.name || session.user.email || "Unknown",
      actorRole: session.user.role,
      actorId: session.user.id,
      eventType: EventType.DOCUMENT_DOWNLOADED,
      resource: `${doc.fileName}-${doc.id.slice(0, 8).toUpperCase()}`,
      ipAddress: getClientIp(req as unknown as Request),
      status: LogStatus.SUCCESS,
    });

    return new Response(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(
          doc.fileName
        )}"`,
      },
    });
  } catch (error: unknown) {
    console.error("Download Error:", error);
    const err = error as Error & { code?: string };
    const session = await getServerSession(authOptions).catch(() => null);
    logSecurityEvent({
      actorName: session?.user?.name || session?.user?.email || "Unknown",
      actorRole: session?.user?.role || "Unauthenticated",
      actorId: session?.user?.id || null,
      eventType: EventType.DOCUMENT_DOWNLOADED,
      resource: filePath ? `FILE-${filePath.slice(0, 15)}` : "Unexpected Error",
      ipAddress: getClientIp(req as unknown as Request),
      status: LogStatus.FAILED,
      metadata: { error: err.message || "Internal Server Error" },
    });
    if (err.code === "ENOENT") {
      return new Response("Not Found: File not found on disk", { status: 404 });
    }
    return new Response("Internal Server Error", { status: 500 });
  }
}
