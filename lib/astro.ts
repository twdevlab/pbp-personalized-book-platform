import { getEnvValue, hasValue, isMockMode } from "@/lib/config";
import type { BirthChartData, CustomerData } from "@/types/book";

export async function getBirthChartData(
  customerData: CustomerData
): Promise<BirthChartData> {
  const astroApiUrl = getEnvValue(process.env.ASTRO_API_URL);
  const astroApiKey = getEnvValue(process.env.ASTRO_API_KEY);

  if (isMockMode() || !hasValue(astroApiUrl) || !hasValue(astroApiKey)) {
    console.info("[generate-book] AstroAPI mock mode enabled.");
    return getMockBirthChartData(customerData);
  }

  const response = await fetch(`${astroApiUrl}/birth-chart`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${astroApiKey}`
    },
    body: JSON.stringify({
      date: customerData.birthDate,
      time: customerData.birthTime,
      place: customerData.birthPlace
      // Adjust this payload once the final AstroAPI provider endpoint is selected.
    })
  });

  if (!response.ok) {
    throw new Error(`AstroAPI request failed with status ${response.status}`);
  }

  const data = (await response.json()) as Partial<BirthChartData>;

  return {
    sunSign: data.sunSign ?? "Unknown",
    moonSign: data.moonSign ?? "Unknown",
    risingSign: data.risingSign ?? "Unknown",
    dominantElement: data.dominantElement ?? "Unknown",
    chartSummary: data.chartSummary ?? "Birth chart summary was not provided.",
    placements: data.placements ?? []
  };
}

function getMockBirthChartData(customerData: CustomerData): BirthChartData {
  return {
    sunSign: "Libra",
    moonSign: "Cancer",
    risingSign: "Sagittarius",
    dominantElement: "Air",
    chartSummary: `${customerData.fullName}'s mock chart blends Libra's relational intelligence, Cancer's emotional memory, and Sagittarius rising's appetite for meaning.`,
    placements: [
      {
        planet: "Sun",
        sign: "Libra",
        house: "10th House",
        meaning: "A life path shaped by beauty, balance, visibility, and thoughtful leadership."
      },
      {
        planet: "Moon",
        sign: "Cancer",
        house: "8th House",
        meaning: "Deep sensitivity, intuitive pattern recognition, and a private emotional world."
      },
      {
        planet: "Mercury",
        sign: "Scorpio",
        house: "11th House",
        meaning: "A mind drawn toward hidden motives, loyal communities, and transformative ideas."
      }
    ]
  };
}
