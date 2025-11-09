import { z } from "zod";
import { openai } from "./providers/openai.js";
import { cerebras } from "./providers/cerebras.js";

export type Providers = "openai" | "cerebras";

export const llm = async <T>({
  provider,
  prompt,
  schema,
  message,
}: {
  provider: Providers;
  prompt: string;
  schema: z.ZodSchema<T>;
  message: string;
}): Promise<T | null> => {
  if (provider === "openai") {
    console.log("Prompting OpenAI");
    return openai({ prompt, schema, message });
  }

  if (provider === "cerebras") {
    console.log("Prompting Cerebras");
    return cerebras({ prompt, schema, message });
  }

  throw new Error(`Provider ${provider} not supported`);
};
