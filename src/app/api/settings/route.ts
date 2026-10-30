import { NextRequest, NextResponse } from "next/server";
import { getSystemConfig, updateSystemConfig } from "@/lib/config";
import { checkPermission } from "@/lib/rbacServer";

export async function GET() {
  const config = getSystemConfig();
  return NextResponse.json({ success: true, data: config });
}

export async function POST(req: NextRequest) {
  const perm = checkPermission(req, "canModifySystemSettings");
  if (!perm.allowed) {
    return NextResponse.json({ success: false, error: perm.error }, { status: 403 });
  }

  try {
    const body = await req.json();
    const updated = updateSystemConfig(body);
    return NextResponse.json({
      success: true,
      message: "System configuration updated successfully.",
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
