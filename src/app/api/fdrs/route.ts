import { NextRequest, NextResponse } from "next/server";
import { getFdrs, createFdr } from "@/lib/store/db";
import { getSessionFromRequest, checkPermission } from "@/lib/rbacServer";
import { z } from "zod";

const createFdrSchema = z.object({
  institutionId: z.string().min(1, "Institution ID is required"),
  fdrNumber: z.string().min(3, "FDR Number is required"),
  bankName: z.string().min(2, "Bank name is required"),
  branchName: z.string().min(2, "Branch name is required"),
  ifscCode: z.string().length(11, "IFSC must be exactly 11 characters"),
  amount: z.number().positive("Amount must be a positive number"),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Issue date must be YYYY-MM-DD"),
  maturityDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Maturity date must be YYYY-MM-DD"),
  tenureMonths: z.number().int().positive().optional().default(120),
  jointAccountHolder: z.string().optional().default("Regional Officer, AICTE"),
  lienMarked: z.boolean().optional().default(true),
  documents: z.array(z.any()).optional().default([]),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region") || undefined;
  const bank = searchParams.get("bank") || undefined;
  const status = searchParams.get("status") || undefined;
  const search = searchParams.get("search") || undefined;
  const institutionId = searchParams.get("institutionId") || undefined;
  const hasDiscrepancy = searchParams.has("hasDiscrepancy")
    ? searchParams.get("hasDiscrepancy") === "true"
    : undefined;
  const minAttentionScore = searchParams.has("minAttentionScore")
    ? parseInt(searchParams.get("minAttentionScore")!, 10)
    : undefined;

  const fdrs = getFdrs({
    region,
    bank,
    status,
    search,
    institutionId,
    hasDiscrepancy,
    minAttentionScore,
  });

  return NextResponse.json({
    success: true,
    count: fdrs.length,
    data: fdrs,
  });
}

export async function POST(req: NextRequest) {
  const perm = checkPermission(req, "canSubmitFdr");
  if (!perm.allowed) {
    return NextResponse.json({ success: false, error: perm.error }, { status: 403 });
  }

  try {
    const body = await req.json();
    const validated = createFdrSchema.parse(body);
    const newFdr = createFdr(validated, perm.user);

    return NextResponse.json({
      success: true,
      message: "FDR instrument successfully submitted to repository.",
      data: newFdr,
    }, { status: 201 });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation Failed", details: err.errors }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: err.message || "Failed to create FDR" }, { status: 500 });
  }
}
