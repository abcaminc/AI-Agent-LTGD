import { GoogleGenAI, Type } from "@google/genai";
import type { ChartData, Source } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const systemInstruction = `You are LTGD, an expert AI agent specializing in the analysis of long-term USA government debt. Your purpose is to research, monitor, and report on its demand. You must provide data-driven insights by using Google Search to find the latest available data.

You collect data on interest rates, inflation, economic growth, alternative investments, central bank actions, and domestic/foreign government policies.

Your entire response MUST be a single, valid JSON object. Do not include any text before or after the JSON object, such as \`\`\`json.

The JSON object must have the following structure:
{
  "analysis": "A detailed textual analysis of the user's query, formatted in Markdown.",
  "chart": {
    "chartType": "'line' or 'bar'",
    "data": "A JSON string representing an array of data point objects. Example: '[{\\"Year\\": \\"2023\\", \\"Yield\\": 4.5}, {\\"Year\\": \\"2024\\", \\"Yield\\": 4.2}]'",
    "dataKeys": ["An array of strings for the y-axis values."],
    "xAxisKey": "The key for the x-axis label."
  }
}

If a chart is not relevant to the user's query, the value for the "chart" key should be null.`;

interface GeminiResponse {
  text: string;
  chartData: ChartData | null;
  sources: Source[] | undefined;
}

export const generateReport = async (prompt: string): Promise<GeminiResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.2,
      },
    });
    
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources = groundingMetadata?.groundingChunks
      ?.map(chunk => chunk.web)
      .filter((web): web is { uri: string; title: string } => !!(web?.uri && web.title))
      // deduplicate sources
      .filter((value, index, self) => index === self.findIndex((t) => (t.uri === value.uri)));

    const rawJsonText = response.text;
    if (!rawJsonText) {
      throw new Error("Received an empty response from the AI.");
    }
    
    // Sanitize the response to remove markdown fences (e.g., ```json)
    const startIndex = rawJsonText.indexOf('{');
    const endIndex = rawJsonText.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1) {
        throw new Error("Could not find a valid JSON object in the AI's response.");
    }

    const jsonString = rawJsonText.substring(startIndex, endIndex + 1);
    const parsedData = JSON.parse(jsonString);

    // If chart data is a string, parse it into an object.
    if (parsedData.chart && typeof parsedData.chart.data === 'string') {
        try {
            parsedData.chart.data = JSON.parse(parsedData.chart.data);
        } catch (e) {
            console.error("Failed to parse chart data string:", e);
            // If parsing fails, nullify the chart to prevent crashes.
            parsedData.chart = null;
        }
    }

    return {
      text: parsedData.analysis,
      chartData: parsedData.chart,
      sources,
    };
  } catch (error) {
    console.error("Error generating report:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return {
      text: `Sorry, I encountered an error while processing your request: ${errorMessage}`,
      chartData: null,
      sources: undefined,
    };
  }
};