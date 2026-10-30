import { NextRequest, NextResponse } from "next/server";
import { getFdrById, getInstitutionById } from "@/lib/store/db";
import { getSessionFromRequest } from "@/lib/rbacServer";
import { maskSensitiveId } from "@/lib/formatters";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const fdr = getFdrById(params.id);
  if (!fdr) {
    return NextResponse.json({ success: false, error: "Instrument not found" }, { status: 404 });
  }

  const institution = getInstitutionById(fdr.institutionId);
  const session = getSessionFromRequest(req);

  // If user is not authorized to view unmasked sensitive data, mask the FDR Number
  const shouldMask = session.role === "AUDITOR";
  const responseData = {
    ...fdr,
    fdrNumber: shouldMask ? maskSensitiveId(fdr.fdrNumber) : fdr.fdrNumber,
    institution,
  };

  return NextResponse.json({
    success: true,
    data: responseData,
  });
}

