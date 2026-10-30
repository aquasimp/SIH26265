import { NextRequest, NextResponse } from "next/server";
import { getAuditTrail, verifyAuditIntegrity } from "@/lib/store/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") || "100", 10);

  const logs = getAuditTrail(limit);
  const integrity = verifyAuditIntegrity();

  return NextResponse.json({
    success: true,
    integrity,
    count: logs.length,
    data: logs,
  });
}

