import { NextRequest, NextResponse } from "next/server";

export interface OcrFieldResult {
  value: string | number | boolean;
  confidence: number; // 0 to 100%
  boundingBox: {
    x: number; // percentage from left (0 to 100)
    y: number; // percentage from top (0 to 100)
    width: number;
    height: number;
  };
}

export interface OcrExtractionPayload {
  fileName: string;
  fileSizeKb: number;
  overallConfidence: number;
  extractedFields: {
    fdrNumber: OcrFieldResult;
    bankName: OcrFieldResult;
    branchName: OcrFieldResult;
    ifscCode: OcrFieldResult;
    amount: OcrFieldResult;
    issueDate: OcrFieldResult;
    maturityDate: OcrFieldResult;
    tenureMonths: OcrFieldResult;
    jointAccountHolder: OcrFieldResult;
    lienMarked: OcrFieldResult;
  };
  metadataAnalysis: {
    suspiciousFlags: string[];
    isAdvisoryOnly: boolean;
    digitalSignaturePresent: boolean;
    pdfCreatorTool?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const templateType = body.templateType || "STANDARD_SBI";

    // Simulate OCR processing latency (350ms)
    await new Promise((r) => setTimeout(r, 350));

    let payload: OcrExtractionPayload;

    if (templateType === "MISMATCH_HDFC_IFSC") {
      payload = {
        fileName: "SBI_Commercial_FDR_Scan.pdf",
        fileSizeKb: 920,
        overallConfidence: 89.2,
        extractedFields: {
          fdrNumber: { value: "FDR-2024-SBI-77192", confidence: 97.4, boundingBox: { x: 55, y: 18, width: 35, height: 5 } },
          bankName: { value: "State Bank of India", confidence: 98.1, boundingBox: { x: 20, y: 8, width: 45, height: 6 } },
          branchName: { value: "Industrial Finance Branch", confidence: 92.0, boundingBox: { x: 20, y: 14, width: 40, height: 4 } },
          ifscCode: { value: "HDFC0001234", confidence: 94.6, boundingBox: { x: 65, y: 14, width: 28, height: 4 } }, // Intentional mismatch
          amount: { value: 3500000, confidence: 99.0, boundingBox: { x: 45, y: 32, width: 30, height: 5 } },
          issueDate: { value: "2024-05-15", confidence: 95.8, boundingBox: { x: 25, y: 42, width: 25, height: 4 } },
          maturityDate: { value: "2034-05-15", confidence: 96.1, boundingBox: { x: 65, y: 42, width: 25, height: 4 } },
          tenureMonths: { value: 120, confidence: 91.0, boundingBox: { x: 45, y: 50, width: 15, height: 4 } },
          jointAccountHolder: { value: "Regional Officer, AICTE Western Region", confidence: 88.4, boundingBox: { x: 20, y: 58, width: 65, height: 6 } },
          lienMarked: { value: true, confidence: 93.0, boundingBox: { x: 20, y: 68, width: 55, height: 5 } },
        },
        metadataAnalysis: {
          suspiciousFlags: ["Software signature: Adobe Acrobat DC - Font layer modified"],
          isAdvisoryOnly: true,
          digitalSignaturePresent: false,
          pdfCreatorTool: "Adobe Distiller 11.0",
        },
      };
    } else {
      // Standard Authentic Template
      payload = {
        fileName: "Canara_Bank_Joint_Deposit_Certificate.pdf",
        fileSizeKb: 840,
        overallConfidence: 96.4,
        extractedFields: {
          fdrNumber: { value: "FDR-2024-CNRB-44910", confidence: 98.6, boundingBox: { x: 55, y: 18, width: 35, height: 5 } },
          bankName: { value: "Canara Bank", confidence: 99.2, boundingBox: { x: 20, y: 8, width: 45, height: 6 } },
          branchName: { value: "Town Hall Branch", confidence: 94.5, boundingBox: { x: 20, y: 14, width: 40, height: 4 } },
          ifscCode: { value: "CNRB0001092", confidence: 98.0, boundingBox: { x: 65, y: 14, width: 28, height: 4 } },
          amount: { value: 3500000, confidence: 99.5, boundingBox: { x: 45, y: 32, width: 30, height: 5 } },
          issueDate: { value: "2024-04-10", confidence: 97.2, boundingBox: { x: 25, y: 42, width: 25, height: 4 } },
          maturityDate: { value: "2034-04-10", confidence: 97.8, boundingBox: { x: 65, y: 42, width: 25, height: 4 } },
          tenureMonths: { value: 120, confidence: 95.0, boundingBox: { x: 45, y: 50, width: 15, height: 4 } },
          jointAccountHolder: { value: "Regional Officer, AICTE Northern Region", confidence: 92.5, boundingBox: { x: 20, y: 58, width: 65, height: 6 } },
          lienMarked: { value: true, confidence: 96.0, boundingBox: { x: 20, y: 68, width: 55, height: 5 } },
        },
        metadataAnalysis: {
          suspiciousFlags: [],
          isAdvisoryOnly: false,
          digitalSignaturePresent: true,
          pdfCreatorTool: "Canon iR-ADV Scanner",
        },
      };
    }

    return NextResponse.json({
      success: true,
      message: "OCR extraction completed with region mapping and field confidence scores.",
      data: payload,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

