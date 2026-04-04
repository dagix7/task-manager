/**
 * Environment configuration validation
 * Ensures all required environment variables are set
 */

function getEnvVar(key: string): string {
  const value = process.env[key]

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Please ensure ${key} is set in your .env.local file`
    )
  }

  return value
}

export const config = {
  supabase: {
    url: getEnvVar('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  },
} as const

// Validate config at module load time
export function validateConfig() {
  try {
    // Access config properties to trigger validation
    config.supabase.url
    config.supabase.anonKey
    return true
  } catch (error) {
    console.error('Environment configuration error:', error)
    throw error
  }
}
