import { NextRequest, NextResponse } from "next/server";
import {
  requestRelease,
  recommendReleaseByRo,
  approveReleaseByBureauHead,
} from "@/lib/store/db";
import { getSessionFromRequest, checkPermission } from "@/lib/rbacServer";
import { z } from "zod";

const releaseActionSchema = z.object({
  action: z.enum(["REQUEST", "RECOMMEND", "APPROVE"]),
  justification: z.string().optional(),
  recommendationNote: z.string().optional(),
  approvalOrderNo: z.string().optional(),
  approvalNote: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const validated = releaseActionSchema.parse(body);
    const session = getSessionFromRequest(req);

    if (validated.action === "REQUEST") {
      const perm = checkPermission(req, "canRequestRelease");
      if (!perm.allowed) {
        return NextResponse.json({ success: false, error: perm.error }, { status: 403 });
      }
      const updated = requestRelease(
        params.id,
        validated.justification || "Statutory tenure completed.",
        session
      );
      return NextResponse.json({
        success: true,
        message: "Release request submitted for regional scrutiny.",
        data: updated,
      });
    }

    if (validated.action === "RECOMMEND") {
      const perm = checkPermission(req, "canRecommendRelease");
      if (!perm.allowed) {
        return NextResponse.json({ success: false, error: perm.error }, { status: 403 });
      }
      const updated = recommendReleaseByRo(
        params.id,
        validated.recommendationNote || "Regional Office verification complete. No pending complaints.",
        session
      );
      return NextResponse.json({
        success: true,
        message: "Release recommended to Bureau Head for sanction.",
        data: updated,
      });
    }

    if (validated.action === "APPROVE") {
      const perm = checkPermission(req, "canApproveRelease");
      if (!perm.allowed) {
        return NextResponse.json({ success: false, error: perm.error }, { status: 403 });
      }
      const updated = approveReleaseByBureauHead(
        params.id,
        validated.approvalOrderNo || `AICTE/REG/SANCTION-${Date.now().toString().slice(-5)}`,
        validated.approvalNote || "Final deposit refund sanctioned by Competent Authority.",
        session
      );
      return NextResponse.json({
        success: true,
        message: "Final deposit release order sanctioned by Bureau Head.",
        data: updated,
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation failed", details: err.errors }, { status: 400 });
    }
    // Hard gate blocks return 422 Unprocessable Entity
    const isHardBlock = (err.message || "").includes("RELEASE BLOCKED");
    return NextResponse.json(
      { success: false, error: err.message },
      { status: isHardBlock ? 422 : 500 }
    );
  }
}

