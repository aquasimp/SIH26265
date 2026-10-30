import { NextRequest, NextResponse } from "next/server";
import { verifyFdrWithBank } from "@/lib/store/db";
import { checkPermission } from "@/lib/rbacServer";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const perm = checkPermission(req, "canVerifyFdr");
  if (!perm.allowed) {
    return NextResponse.json({ success: false, error: perm.error }, { status: 403 });
  }

  try {
    const result = await verifyFdrWithBank(params.id, perm.user);
    return NextResponse.json({
      success: true,
      message: "Core Banking verification completed.",
      data: result.fdr,
      discrepanciesCount: result.discrepanciesCount,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

