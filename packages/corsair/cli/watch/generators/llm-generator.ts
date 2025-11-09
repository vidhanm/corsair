import { z } from 'zod';
import { llm } from '../../../llm/index.js';
import type { GeneratedQuery, SchemaDefinition, Query } from '../types/state.js';

const QueryGenerationSchema = z.object({
  queryCode: z.string(),
  types: z.string(),
});

/**
 * LLM-based query generator
 *
 * Calls Cerebras API to generate sophisticated Drizzle queries from natural language.
 */
export async function generateQueryWithLLM(
  query: Query,
  schema: SchemaDefinition
): Promise<GeneratedQuery> {
  const functionName = query.id;
  const typeNameResult = capitalize(functionName) + 'Result';
  const typeNameParams = capitalize(functionName) + 'Params';

  const schemaDescription = JSON.stringify(schema, null, 2);
  const paramsDescription = JSON.stringify(query.params, null, 2);

  const prompt = `You are a TypeScript code generator for database queries using Drizzle ORM.

Schema:
${schemaDescription}

Natural Language Query: "${query.nlQuery}"
Function Name: ${functionName}
Parameters: ${paramsDescription}

Generate:
1. Complete TypeScript function that implements this query using Drizzle ORM
2. TypeScript type definitions for parameters (${typeNameParams}) and result (${typeNameResult})

Requirements:
- Import necessary items from 'drizzle-orm'
- Import db from '../db'
- Import tables from '../schema'
- Function signature: export async function ${functionName}(params: ${typeNameParams}): Promise<${typeNameResult}>
- Use proper Drizzle query builders (select, where, join, etc.)
- Infer accurate return types based on the query

Return JSON with two fields: queryCode (the function code) and types (the type definitions).`;

  const result = await llm({
    provider: 'cerebras',
    prompt,
    schema: QueryGenerationSchema,
    message: query.nlQuery,
  });

  if (!result) {
    // Fallback to basic generation if LLM fails
    console.warn('LLM generation failed, falling back to basic query');
    const queryCode = generateBasicQuery(query, schema, functionName, typeNameResult, typeNameParams);
    const types = generateTypes(query, typeNameResult, typeNameParams);
    return { queryCode, types, functionName };
  }

  return {
    queryCode: result.queryCode,
    types: result.types,
    functionName,
  };
}

function generateBasicQuery(
  query: Query,
  schema: SchemaDefinition,
  functionName: string,
  resultType: string,
  paramsType: string
): string {
  // Simple heuristic-based generation
  const nlLower = query.nlQuery.toLowerCase();

  // Guess the table name from the query
  const tableGuess = schema.tables.find((table) => {
    return nlLower.includes(table.name.toLowerCase());
  });

  const tableName = tableGuess?.name || schema.tables[0]?.name || 'table';

  return `import { db } from '../db';
import { ${tableName} } from '../schema';
import { eq } from 'drizzle-orm';

export async function ${functionName}(params: ${paramsType}): Promise<${resultType}> {
  // TODO: LLM will generate the actual query logic
  const result = await db.select().from(${tableName}).execute();

  return result as ${resultType};
}`;
}

function generateTypes(query: Query, resultType: string, paramsType: string): string {
  const paramsFields = Object.entries(query.params)
    .map(([key, type]) => `  ${key}: ${type};`)
    .join('\n');

  const params = paramsFields
    ? `export type ${paramsType} = {\n${paramsFields}\n};`
    : `export type ${paramsType} = Record<string, never>;`;

  return `${params}

export type ${resultType} = any[]; // TODO: LLM will infer the correct type
`;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
