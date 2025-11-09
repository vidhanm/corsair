import type { SchemaDefinition } from '../../cli/watch/types/state.js'

export const mutationGeneratorPrompt = ({
  name,
  schema,
}: {
  name: string
  schema: SchemaDefinition
}): string => {
  const schemaDescription = generateSchemaDescription(schema)

  return `# Mutation Generation Request

## Operation Details
- **Type**: Mutation
- **Name**: "${name}"
- **Format**: Generate a structured mutation object with 4 properties

## Database Schema
${schemaDescription}

## Required Output Format

Generate a mutation object with exactly 4 properties:

\`\`\`typescript
{
  input: z.object({ ... }),
  execute: async (corsair, data) => { ... },
  optimistic: (corsair, data) => ({ ... }),
  validate: async (corsair, data) => { ... }
}
\`\`\`

### 1. input (Zod Schema)
- Zod object schema for input validation
- Include all required fields for "${name}"
- Add validation rules (min, max, email, etc.)
- Example: \`z.object({ artistId: z.string(), popularity: z.number().min(0).max(100) })\`

### 2. execute (Main Mutation Logic)
- **Signature**: \`async (corsair, data) => { ... }\`
- **Parameters**:
  - \`corsair\`: { db, schema, currentUser }
  - \`data\`: Input object (validated against input schema)
- **Returns**: Created/updated/deleted record(s)
- Implement the actual database operation (insert, update, delete)
- Use Drizzle ORM with \`corsair.db\` and \`corsair.schema\`
- Include proper error handling
- Return meaningful data

### 3. optimistic (Client Preview)
- **Signature**: \`(corsair, data) => ({ ... })\`
- **Purpose**: Generate immediate UI preview before server confirms
- **Returns**: Object matching expected result shape
- For CREATE: Return new object with temp ID: \`id: \`temp_\${Date.now()}\`\`
- For UPDATE: Return updated fields only
- For DELETE: Return object to remove
- Include defaults for computed fields

### 4. validate (Pre-execution Checks)
- **Signature**: \`async (corsair, data) => { ... }\`
- **Purpose**: Validate permissions and business rules before execute
- **Throws**: Error if validation fails
- Check user permissions (\`if (!corsair.currentUser) throw ...\`)
- Validate business constraints
- Can be async for DB lookups
- Return nothing if valid (throw on invalid)

## Operation Name Analysis
For "${name}":
- Determine if CREATE, UPDATE, or DELETE
- Identify which table(s) involved
- Infer required input parameters
- Consider relationships and foreign keys

## Examples

### CREATE Example
\`\`\`typescript
{
  input: z.object({
    name: z.string().min(1),
    genres: z.array(z.string())
  }),
  execute: async (corsair, data) => {
    const [artist] = await corsair.db
      .insert(corsair.schema.artists)
      .values({
        name: data.name,
        genres: data.genres,
        followers: 0,
        popularity: 0
      })
      .returning()
    return artist
  },
  optimistic: (corsair, data) => ({
    id: \`temp_\${Date.now()}\`,
    name: data.name,
    genres: data.genres,
    followers: 0,
    popularity: 0
  }),
  validate: async (corsair, data) => {
    if (!corsair.currentUser) {
      throw new Error('Must be logged in to create artists')
    }
  }
}
\`\`\`

### UPDATE Example
\`\`\`typescript
{
  input: z.object({
    artistId: z.string(),
    popularity: z.number().min(0).max(100)
  }),
  execute: async (corsair, data) => {
    const [artist] = await corsair.db
      .update(corsair.schema.artists)
      .set({ popularity: data.popularity })
      .where(drizzle.eq(corsair.schema.artists.id, data.artistId))
      .returning()
    return artist || null
  },
  optimistic: (corsair, data) => ({
    id: data.artistId,
    popularity: data.popularity
  }),
  validate: async (corsair, data) => {
    if (!corsair.currentUser) {
      throw new Error('Must be logged in')
    }
  }
}
\`\`\`

### DELETE Example
\`\`\`typescript
{
  input: z.object({
    artistId: z.string()
  }),
  execute: async (corsair, data) => {
    const [deleted] = await corsair.db
      .delete(corsair.schema.artists)
      .where(drizzle.eq(corsair.schema.artists.id, data.artistId))
      .returning()
    return { success: true, deletedId: data.artistId }
  },
  optimistic: (corsair, data) => ({
    _remove: { artists: [data.artistId] }
  }),
  validate: async (corsair, data) => {
    const artist = await corsair.db
      .select()
      .from(corsair.schema.artists)
      .where(drizzle.eq(corsair.schema.artists.id, data.artistId))
      .limit(1)

    if (!artist[0]) throw new Error('Artist not found')
    if (!corsair.currentUser) throw new Error('Must be logged in')
  }
}
\`\`\`

## Important Notes
- ALWAYS include all 4 properties (input, execute, optimistic, validate)
- Use \`async ({ input, ctx })\` destructuring for handlers
- Import drizzle operators: \`import { drizzle } from 'corsair/db/types'\`
- Reference tables via \`corsair.schema.tableName\`
- Make optimistic returns match execute return shape
- Keep validate simple but thorough

## Response Format
Return a JSON object with these exact keys:
\`\`\`json
{
  "input_type": "z.object({ ... })",
  "function": "async (corsair, data) => { ... }",
  "optimistic": "(corsair, data) => ({ ... })",
  "validate": "async (corsair, data) => { ... }",
  "notes": "Brief description",
  "pseudocode": "Step-by-step logic"
}
\`\`\`

Generate the complete mutation for "${name}".`
}

function generateSchemaDescription(schema: SchemaDefinition): string {
  if (!schema || !schema.tables || schema.tables.length === 0) {
    return 'No schema information available.'
  }

  let description = '### Database Tables and Schema\n\n'

  schema.tables.forEach(table => {
    description += `#### Table: \`${table.name}\`\n`

    if (table.columns && table.columns.length > 0) {
      description += '**Columns:**\n'
      table.columns.forEach(column => {
        const references = column.references
          ? ` [REFERENCES ${column.references.table}.${column.references.column}]`
          : ''
        description += `- \`${column.name}\`: ${column.type}${references}\n`
      })
    }

    description += '\n'
  })

  return description
}
