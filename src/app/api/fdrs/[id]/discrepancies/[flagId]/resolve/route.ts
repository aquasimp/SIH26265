import { NextRequest, NextResponse } from "next/server";
import { resolveDiscrepancy } from "@/lib/store/db";
import { checkPermission } from "@/lib/rbacServer";
import { z } from "zod";

const resolveSchema = z.object({
  resolutionNote: z.string().min(5, "A descriptive resolution justification is required"),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; flagId: string } }
) {
  const perm = checkPermission(req, "canOverrideDiscrepancy");
  if (!perm.allowed) {
    return NextResponse.json({ success: false, error: perm.error }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validated = resolveSchema.parse(body);
    const updatedFdr = resolveDiscrepancy(
      params.id,
      params.flagId,
      validated.resolutionNote,
      perm.user
    );

    return NextResponse.json({
      success: true,
      message: "Discrepancy marked as resolved with officer justification.",
      data: updatedFdr,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation failed", details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
