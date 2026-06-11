import { getEnvValue, hasValue, isMockMode } from "@/lib/config";
import { bookContentSchema } from "@/lib/validation";
import type { BirthChartData, BookContent, CustomerData } from "@/types/book";

type GenerateBookContentInput = {
  customerData: CustomerData;
  birthChartData: BirthChartData;
  quizAnswers: CustomerData["quizAnswers"];
};

export async function generateBookContent({
  customerData,
  birthChartData,
  quizAnswers
}: GenerateBookContentInput): Promise<BookContent> {
  const anthropicApiKey = getEnvValue(process.env.ANTHROPIC_API_KEY);

  if (isMockMode() || !hasValue(anthropicApiKey)) {
    console.info("[generate-book] Claude mock mode enabled.");
    return getMockBookContent(customerData, birthChartData);
  }

  const prompt = [
    "Create a concise personalized book from the customer profile below.",
    "Return only valid JSON with this shape:",
    '{"title":"string","subtitle":"string","introduction":"string","sections":[{"title":"string","body":"string"}],"closingNote":"string"}',
    "",
    `Customer: ${customerData.fullName}`,
    `Birth date/time/place: ${customerData.birthDate} ${customerData.birthTime}, ${customerData.birthPlace}`,
    `Quiz answers: ${JSON.stringify(quizAnswers)}`,
    `Birth chart data: ${JSON.stringify(birthChartData)}`
  ].join("\n");

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": anthropicApiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2500,
      temperature: 0.7,
      messages: [{ role: "user", content: prompt }]
    })
  });

  if (!response.ok) {
    throw new Error(`Claude request failed with status ${response.status}`);
  }

  const message = (await response.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const textBlock = message.content?.find((block) => block.type === "text");
  if (!textBlock?.text) {
    throw new Error("Claude returned no text content.");
  }

  try {
    const parsedContent = JSON.parse(textBlock.text);
    return bookContentSchema.parse(parsedContent);
  } catch (error) {
    throw new Error(`Claude returned invalid book content: ${(error as Error).message}`);
  }
}

function getMockBookContent(
  customerData: CustomerData,
  birthChartData: BirthChartData
): BookContent {
  return {
    title: `${customerData.fullName}'s Personal Star Map`,
    subtitle: "A short personalized guide generated from quiz inputs and mock birth chart data",
    introduction: `This prototype book uses ${customerData.fullName}'s stated intention, current season, and a mock astrology profile to demonstrate the full generation workflow.`,
    sections: [
      {
        title: "Chapter 1: The Pattern You Carry",
        body: `Your ${birthChartData.sunSign} Sun points toward harmony, discernment, and the quiet craft of choosing what deserves your energy. With a ${birthChartData.moonSign} Moon, your inner compass is emotionally intelligent and deeply protective of what matters.`
      },
      {
        title: "Chapter 2: The Question of This Season",
        body: `You named "${customerData.quizAnswers.currentChallenge}" as a current challenge. Read through the lens of your chart, this becomes an invitation to pair sensitivity with clear choices instead of waiting for certainty to arrive first.`
      },
      {
        title: "Chapter 3: A Practice for Your Intention",
        body: `Your intention is "${customerData.quizAnswers.personalIntention}". A simple weekly practice: choose one concrete action that makes this intention visible, then record what shifted in your mood, body, and relationships.`
      },
      {
        title: "Chapter 4: How to Use Your Voice",
        body: `The mock chart's Mercury placement suggests that your words are strongest when they are precise, honest, and a little brave. You do not need to tell the whole story at once; begin with the truest sentence.`
      }
    ],
    closingNote:
      "This is mock content for local testing. In production, Claude should generate richer sections from the final book prompt, brand voice, and approved structure."
  };
}
