import { z } from "zod";

export const generateBookRequestSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required."),
  email: z.string().trim().email("A valid email address is required."),
  birthDate: z.string().trim().min(1, "Birth date is required."),
  birthTime: z.string().trim().min(1, "Birth time is required."),
  birthPlace: z.string().trim().min(2, "Birth place is required."),
  quizAnswers: z.object({
    lifeFocus: z.string().trim().min(1, "Life focus is required."),
    readingTone: z.string().trim().min(1, "Reading tone is required."),
    currentChallenge: z
      .string()
      .trim()
      .min(5, "Current challenge must include a little detail."),
    personalIntention: z
      .string()
      .trim()
      .min(5, "Personal intention must include a little detail.")
  })
});

export function formatValidationError(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join(" ");
}

export const bookContentSchema = z.object({
  title: z.string().trim().min(1),
  subtitle: z.string().trim().min(1),
  introduction: z.string().trim().min(1),
  sections: z
    .array(
      z.object({
        title: z.string().trim().min(1),
        body: z.string().trim().min(1)
      })
    )
    .min(1),
  closingNote: z.string().trim().min(1)
});
