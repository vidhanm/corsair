#!/usr/bin/env node

import { z } from 'zod';
import { llm } from '../llm/index.js';
import { loadConfig, loadEnv } from './config.js';

const TestSchema = z.object({
  message: z.string(),
  timestamp: z.string(),
});

export async function testLLM(): Promise<void> {
  console.log('🧪 Testing LLM Connection...\n');

  // Load environment variables
  const cfg = loadConfig();
  loadEnv(cfg.envFile ?? '.env');

  const provider = process.env.CEREBRAS_API_KEY ? 'cerebras' : 'openai';
  console.log(`📡 Provider: ${provider}`);
  console.log(`🔑 API Key: ${provider === 'cerebras' ? process.env.CEREBRAS_API_KEY?.slice(0, 10) : process.env.OPENAI_API_KEY?.slice(0, 10)}...`);

  if (!process.env.CEREBRAS_API_KEY && !process.env.OPENAI_API_KEY) {
    console.error('❌ No API key found. Set CEREBRAS_API_KEY or OPENAI_API_KEY in your .env file');
    process.exit(1);
  }

  console.log('\n⏳ Sending test request...\n');

  try {
    const result = await llm({
      provider: provider as 'cerebras' | 'openai',
      prompt: `You are a helpful assistant. Respond with valid JSON only.

Return a JSON object with two fields:
- message: A short greeting message
- timestamp: The current ISO timestamp

Example:
{
  "message": "Hello! LLM connection successful.",
  "timestamp": "2024-01-01T12:00:00Z"
}`,
      schema: TestSchema,
      message: 'Test connection',
    });

    if (result) {
      console.log('✅ LLM Connection Successful!\n');
      console.log('Response:');
      console.log(`  Message: ${result.message}`);
      console.log(`  Timestamp: ${result.timestamp}\n`);
    } else {
      console.error('❌ LLM returned null response');
      console.log('\n💡 Tip: Check your API key and internet connection');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ LLM Test Failed:\n');
    console.error(error);
    console.log('\n💡 Troubleshooting:');
    console.log('  1. Verify your API key is correct');
    console.log('  2. Check your internet connection');
    console.log('  3. Ensure the LLM service is available');
    process.exit(1);
  }
}
