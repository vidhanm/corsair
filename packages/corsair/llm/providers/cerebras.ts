import Cerebras from '@cerebras/cerebras_cloud_sdk';
import { z } from "zod";

// Lazy initialization of Cerebras client
let cerebrasClient: Cerebras | null = null;

function getCerebrasClient(): Cerebras {
  if (!cerebrasClient) {
    cerebrasClient = new Cerebras({ apiKey: process.env.CEREBRAS_API_KEY || "" });
  }
  return cerebrasClient;
}

export const cerebras = async <T>({
  prompt,
  schema,
  message,
}: {
  prompt: string;
  schema: z.ZodSchema<T>;
  message: string;
}): Promise<T | null> => {
  try {
    const client = getCerebrasClient();

    // Create completion request
    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: message || "" },
      ],
      model: 'qwen-3-235b-a22b-instruct-2507',
      temperature: 0.6,
      top_p: 0.95,
      max_completion_tokens: 65536,
    });

    // Extract content from response
    const content = (response as any).choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in Cerebras response');
      return null;
    }

    // Log the raw response for debugging
    console.log('Cerebras raw response (first 200 chars):', content.slice(0, 200));

    // Try to parse JSON from the response
    // Sometimes LLMs wrap JSON in markdown code blocks or add extra text
    let jsonContent = content.trim();

    // Remove markdown code blocks if present
    const codeBlockMatch = jsonContent.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    if (codeBlockMatch) {
      jsonContent = codeBlockMatch[1].trim();
    } else {
      // Try to extract JSON object from anywhere in the response
      const jsonMatch = jsonContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonContent = jsonMatch[0];
      }
    }

    console.log('Extracted JSON (first 200 chars):', jsonContent.slice(0, 200));

    // Parse and validate with Zod schema
    const parsed = JSON.parse(jsonContent);
    const validated = schema.parse(parsed);

    return validated;
  } catch (error) {
    console.error('Cerebras error:', error);
    return null;
  }
};
