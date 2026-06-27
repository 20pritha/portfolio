import { NextRequest } from 'next/server'

function getAllowedOrigins(): string[] {
  const origins = ['http://localhost:3000', 'http://localhost:3001']
  const siteUrl = process.env.SITE_URL
  if (siteUrl) origins.push(siteUrl.replace(/\/$/, ''))
  return origins
}

export function checkOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin') ?? ''
  return getAllowedOrigins().includes(origin)
}

export function checkAdminToken(req: NextRequest): boolean {
  const token = process.env.ADMIN_TOKEN
  if (!token) return false
  const auth = req.headers.get('authorization') ?? ''
  return auth === `Bearer ${token}`
}
