import { NextRequest, NextResponse } from "next/server";
import {
  resetStore,
  createFdr,
  verifyFdrWithBank,
  resolveDiscrepancy,
  submitRenewal,
  requestRelease,
  recommendReleaseByRo,
  approveReleaseByBureauHead,
  getFdrById,
} from "@/lib/store/db";
import { DEMO_USERS } from "@/types/rbac";

export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json();

    if (action === "RESET") {
      resetStore();
      return NextResponse.json({ success: true, message: "Ledger reset to deterministic seed." });
    }

    if (action === "RUN_FULL_LIFECYCLE") {
      // Step 1: Submit new FDR
      const submitted = createFdr(
        {
          institutionId: "inst-001",
          fdrNumber: `FDR-DEMO-${Date.now().toString().slice(-4)}`,
          bankName: "State Bank of India",
          branchName: "Industrial Finance Branch",
          ifscCode: "SBIN0004123",
          amount: 3500000,
          issueDate: "2024-01-15",
          maturityDate: "2034-01-15",
          tenureMonths: 120,
          jointAccountHolder: "Regional Officer, AICTE Western Region",
          lienMarked: true,
        },
        DEMO_USERS.INSTITUTION_USER
      );

      // Step 2: Verify with Mock Bank
      const { fdr: verified } = await verifyFdrWithBank(
        submitted.id,
        DEMO_USERS.SCRUTINY_OFFICER
      );

      return NextResponse.json({
        success: true,
        message: "Full lifecycle demo simulation executed successfully.",
        fdrId: verified.id,
      });
    }

    return NextResponse.json({ success: false, error: "Unknown scenario action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
