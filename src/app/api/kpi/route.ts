import { NextResponse } from "next/server";
import { getKpiMetrics, getMaturityLadder } from "@/lib/store/db";

export async function GET() {
  const metrics = getKpiMetrics();
  const ladder = getMaturityLadder();

  return NextResponse.json({
    success: true,
    metrics,
    maturityLadder: ladder,
  });
}

