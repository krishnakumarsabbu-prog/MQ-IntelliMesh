const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8000'
const appEnv = (import.meta.env.VITE_APP_ENV as string | undefined) ?? 'development'

export const env = {
  apiBaseUrl: apiBaseUrl.replace(/\/$/, ''),
  appEnv,
  isDevelopment: appEnv === 'development',
  isProduction: appEnv === 'production',
} as const

export type Env = typeof env
