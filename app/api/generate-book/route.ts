import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { getBirthChartData } from "@/lib/astro";
import { generateBookContent } from "@/lib/claude";
import { sendBookEmail } from "@/lib/email";
import { generateBookPdf } from "@/lib/pdf";
import {
  formatValidationError,
  generateBookRequestSchema
} from "@/lib/validation";
import type {
  GenerateBookErrorResponse,
  GenerateBookSuccessResponse
} from "@/types/book";

export const runtime = "nodejs";

type WorkflowStep = "validation" | "astro" | "claude" | "pdf" | "email";

export async function POST(request: Request) {
  let step: WorkflowStep = "validation";

  try {
    const body = await parseJsonBody(request);
    const parsed = generateBookRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json<GenerateBookErrorResponse>(
        {
          success: false,
          error: formatValidationError(parsed.error)
        },
        { status: 400 }
      );
    }

    const customerData = parsed.data;

    step = "astro";
    const birthChartData = await getBirthChartData(customerData);

    step = "claude";
    const bookContent = await generateBookContent({
      customerData,
      birthChartData,
      quizAnswers: customerData.quizAnswers
    });

    step = "pdf";
    const pdfBuffer = await generateBookPdf(bookContent, customerData);
    const resultFile = await saveGeneratedBookPdf(pdfBuffer, customerData.fullName);

    step = "email";
    await sendBookEmail({
      to: customerData.email,
      customerName: customerData.fullName,
      pdfBuffer
    });

    return NextResponse.json<GenerateBookSuccessResponse>({
      success: true,
      message:
        "Book generated successfully. The PDF was created and the email step completed.",
      downloadUrl: resultFile.downloadUrl,
      fileName: resultFile.fileName
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json<GenerateBookErrorResponse>(
        {
          success: false,
          error: error.message
        },
        { status: 400 }
      );
    }

    console.error(`[generate-book] ${step} step failed`, error);

    return NextResponse.json<GenerateBookErrorResponse>(
      {
        success: false,
        error: getPublicErrorMessage(step)
      },
      { status: 500 }
    );
  }
}

async function parseJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new ValidationError("Request body must be valid JSON.");
  }
}

function getPublicErrorMessage(step: WorkflowStep): string {
  switch (step) {
    case "astro":
      return "AstroAPI failed while creating the birth chart data.";
    case "claude":
      return "Claude failed while generating the personalized book content.";
    case "pdf":
      return "PDF generation failed while creating the book file.";
    case "email":
      return "Email delivery failed while sending the generated book.";
    case "validation":
    default:
      return "The book generation workflow failed before it could complete.";
  }
}

async function saveGeneratedBookPdf(
  pdfBuffer: Buffer,
  fullName: string
): Promise<{ downloadUrl: string; fileName: string }> {
  const outputDirectory = path.join(process.cwd(), "public", "generated-books");
  await mkdir(outputDirectory, { recursive: true });

  const safeName = fullName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `${safeName || "personalized-book"}-${timestamp}.pdf`;

  await writeFile(path.join(outputDirectory, fileName), pdfBuffer);

  return {
    downloadUrl: `/generated-books/${fileName}`,
    fileName
  };
}

class ValidationError extends Error {}
