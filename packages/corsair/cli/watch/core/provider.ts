import type { Providers } from '../../../llm/index.js'

let selectedProvider: Providers | null = null

/**
 * Detect available LLM providers based on environment variables
 */
export function detectAvailableProviders(): Providers[] {
  const providers: Providers[] = []

  if (process.env.OPENAI_API_KEY) {
    providers.push('openai')
  }

  if (process.env.CEREBRAS_API_KEY) {
    providers.push('cerebras')
  }

  return providers
}

/**
 * Get or select the LLM provider to use
 * - If CORSAIR_LLM_PROVIDER is set, use that
 * - If only one provider is available, use it
 * - If multiple providers are available, prefer the first one and show a message
 * - If no providers are available, throw an error
 */
export function selectProvider(): Providers {
  if (selectedProvider) {
    return selectedProvider
  }

  // Check for explicit provider preference
  const explicitProvider = process.env.CORSAIR_LLM_PROVIDER as Providers | undefined
  if (explicitProvider && (explicitProvider === 'openai' || explicitProvider === 'cerebras')) {
    // Verify the API key for the explicit provider exists
    const hasKey = explicitProvider === 'openai'
      ? !!process.env.OPENAI_API_KEY
      : !!process.env.CEREBRAS_API_KEY

    if (hasKey) {
      selectedProvider = explicitProvider
      console.log(`✓ Using provider: ${explicitProvider} (from CORSAIR_LLM_PROVIDER)`)
      return selectedProvider
    } else {
      console.warn(`⚠️  CORSAIR_LLM_PROVIDER is set to '${explicitProvider}' but ${explicitProvider.toUpperCase()}_API_KEY is not found`)
    }
  }

  // Auto-detect available providers
  const availableProviders = detectAvailableProviders()

  if (availableProviders.length === 0) {
    console.error('❌ No LLM provider API keys found!')
    console.error('   Please set one of the following environment variables:')
    console.error('   - OPENAI_API_KEY')
    console.error('   - CEREBRAS_API_KEY')
    process.exit(1)
  }

  if (availableProviders.length === 1) {
    selectedProvider = availableProviders[0]
    console.log(`✓ Using provider: ${selectedProvider}`)
    return selectedProvider
  }

  // Multiple providers available - use the first one and inform the user
  selectedProvider = availableProviders[0]
  console.log(`ℹ️  Multiple LLM providers detected: ${availableProviders.join(', ')}`)
  console.log(`   Using: ${selectedProvider}`)
  console.log(`   To specify a provider, set CORSAIR_LLM_PROVIDER=${availableProviders.join(' or ')}`)

  return selectedProvider
}

/**
 * Get the currently selected provider
 */
export function getProvider(): Providers {
  if (!selectedProvider) {
    return selectProvider()
  }
  return selectedProvider
}
