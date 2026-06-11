import { getEnvValue, hasValue, isMockMode } from "@/lib/config";

type SendBookEmailInput = {
  to: string;
  customerName: string;
  pdfBuffer: Buffer;
};

export async function sendBookEmail({
  to,
  customerName,
  pdfBuffer
}: SendBookEmailInput): Promise<void> {
  const emailProviderApiKey = getEnvValue(process.env.EMAIL_PROVIDER_API_KEY);

  if (isMockMode() || !hasValue(emailProviderApiKey)) {
    console.info("[generate-book] Email mock mode enabled.", {
      to,
      customerName,
      attachmentFileName: "personalized-book.pdf",
      attachmentBytes: pdfBuffer.length
    });
    return;
  }

  const from = getEnvValue(process.env.EMAIL_FROM) ?? "books@example.com";
  const escapedCustomerName = escapeHtml(customerName);

  // This prototype uses a Resend-compatible HTTP shape as a clean transactional
  // email abstraction. Swap this endpoint/payload for SendGrid, Mailgun, or the
  // final provider once selected.
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${emailProviderApiKey}`
    },
    body: JSON.stringify({
      from,
      to,
      subject: "Your personalized book is ready",
      html: `<p>Hi ${escapedCustomerName},</p><p>Your personalized book is attached as a PDF.</p>`,
      attachments: [
        {
          filename: "personalized-book.pdf",
          content: pdfBuffer.toString("base64")
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`Email provider request failed with status ${response.status}`);
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
