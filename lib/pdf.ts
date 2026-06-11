import PDFDocument from "pdfkit";
import type { BookContent, CustomerData } from "@/types/book";

export async function generateBookPdf(
  bookContent: BookContent,
  customerData: CustomerData
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "LETTER",
      margins: { top: 64, bottom: 64, left: 64, right: 64 },
      info: {
        Title: bookContent.title,
        Author: "Personalized Book Platform Prototype"
      }
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("error", reject);
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    doc.font("Times-Bold").fontSize(24).text(bookContent.title, {
      align: "center"
    });
    doc.moveDown(0.5);
    doc.font("Times-Roman").fontSize(13).text(bookContent.subtitle, {
      align: "center"
    });
    doc.moveDown(0.75);
    doc
      .fontSize(10)
      .fillColor("#555555")
      .text(`Prepared for ${customerData.fullName} on ${new Date().toLocaleDateString()}`, {
        align: "center"
      });

    doc.moveDown(2);
    doc.fillColor("#111111").font("Times-Roman").fontSize(12).text(bookContent.introduction, {
      align: "left",
      lineGap: 4
    });

    for (const section of bookContent.sections) {
      doc.addPage();
      doc.fillColor("#111111").font("Times-Bold").fontSize(18).text(section.title);
      doc.moveDown();
      doc.font("Times-Roman").fontSize(12).text(section.body, {
        align: "left",
        lineGap: 5
      });
    }

    doc.addPage();
    doc.font("Times-Bold").fontSize(18).text("Closing Note");
    doc.moveDown();
    doc.font("Times-Roman").fontSize(12).text(bookContent.closingNote, {
      align: "left",
      lineGap: 5
    });

    doc.end();
  });
}
