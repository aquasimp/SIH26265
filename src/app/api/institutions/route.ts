import { NextRequest, NextResponse } from "next/server";
import { getInstitutions, getFdrs } from "@/lib/store/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const region = searchParams.get("region") || undefined;

  let list = getInstitutions(search);
  if (region && region !== "ALL") {
    list = list.filter((i) => i.region.toLowerCase() === region.toLowerCase());
  }

  const fdrs = getFdrs();

  // Aggregate institution-level FDR metrics
  const data = list.map((inst) => {
    const instFdrs = fdrs.filter((f) => f.institutionId === inst.id);
    const totalAmount = instFdrs.reduce((sum, f) => sum + f.amount, 0);
    const activeCount = instFdrs.filter(
      (f) => f.status === "ACTIVE" || f.status === "RENEWED" || f.status === "SUBMITTED"
    ).length;
    const maturingCount = instFdrs.filter(
      (f) => f.status === "EXPIRING" || f.status === "MATURED"
    ).length;
    const discrepancyCount = instFdrs.filter(
      (f) => (f.discrepancies || []).some((d) => !d.resolved)
    ).length;

    return {
      ...inst,
      fdrCount: instFdrs.length,
      totalAmount,
      activeCount,
      maturingCount,
      discrepancyCount,
      fdrs: instFdrs,
    };
  });

  return NextResponse.json({
    success: true,
    count: data.length,
    data,
  });
}
