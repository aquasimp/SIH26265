import { NextRequest, NextResponse } from "next/server";
import { submitRenewal } from "@/lib/store/db";
import { checkPermission } from "@/lib/rbacServer";
import { z } from "zod";

const renewalSchema = z.object({
  fdrNumber: z.string().min(3, "Renewal FDR Number is required"),
  bankName: z.string().min(2, "Bank name is required"),
  branchName: z.string().min(2, "Branch name is required"),
  ifscCode: z.string().length(11, "IFSC must be 11 characters"),
  amount: z.number().positive("Amount must be positive"),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  maturityDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tenureMonths: z.number().int().positive().optional().default(120),
  lienMarked: z.boolean().optional().default(true),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const perm = checkPermission(req, "canSubmitFdr");
  if (!perm.allowed) {
    return NextResponse.json({ success: false, error: perm.error }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validated = renewalSchema.parse(body);
    const result = submitRenewal(params.id, validated, perm.user);

    return NextResponse.json({
      success: true,
      message: "Renewal instrument registered and linked to previous deposit.",
      data: result,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation failed", details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

