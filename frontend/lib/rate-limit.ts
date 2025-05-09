import { type NextRequest, NextResponse } from "next/server"
import { Redis } from "@upstash/redis"

// Initialize Redis client if UPSTASH_REDIS_REST_URL is available
const redis = process.env.KV_REST_API_URL
  ? new Redis({
      url: process.env.KV_REST_API_URL || "",
      token: process.env.KV_REST_API_TOKEN || "",
    })
  : null

// Fallback in-memory store if Redis is not available
const inMemoryStore: Record<string, { count: number; resetTime: number }> = {}

type RateLimitOptions = {
  limit?: number
  windowInSeconds?: number
  identifier?: (req: NextRequest) => string
}

export async function rateLimit(
  req: NextRequest,
  options: RateLimitOptions = {},
): Promise<{ success: boolean; limit: number; remaining: number; reset: Date }> {
  const {
    limit = 20, // Default limit of 20 requests
    windowInSeconds = 60, // Default window of 60 seconds
    identifier = (req) => {
      // Default identifier is IP address
      const ip = req.ip || req.headers.get("x-forwarded-for") || "unknown"
      const path = req.nextUrl.pathname
      return `rate-limit:${ip}:${path}`
    },
  } = options

  const id = identifier(req)
  const now = Date.now()
  const resetTime = now + windowInSeconds * 1000
  const reset = new Date(resetTime)

  // Use Redis if available, otherwise use in-memory store
  if (redis) {
    const [current, _] = await redis.pipeline().incr(id).expire(id, windowInSeconds).exec()

    const remaining = Math.max(0, limit - (current as number))
    return { success: remaining > 0, limit, remaining, reset }
  } else {
    // In-memory fallback
    if (!inMemoryStore[id] || inMemoryStore[id].resetTime < now) {
      inMemoryStore[id] = { count: 1, resetTime }
    } else {
      inMemoryStore[id].count += 1
    }

    const remaining = Math.max(0, limit - inMemoryStore[id].count)
    return { success: remaining > 0, limit, remaining, reset }
  }
}

export function rateLimitMiddleware(options: RateLimitOptions = {}) {
  return async function middleware(req: NextRequest) {
    const result = await rateLimit(req, options)

    // Set rate limit headers
    const headers = new Headers()
    headers.set("X-RateLimit-Limit", result.limit.toString())
    headers.set("X-RateLimit-Remaining", result.remaining.toString())
    headers.set("X-RateLimit-Reset", result.reset.toISOString())

    if (!result.success) {
      return new NextResponse(
        JSON.stringify({
          error: "Too Many Requests",
          message: "Rate limit exceeded. Please try again later.",
        }),
        {
          status: 429,
          headers,
        },
      )
    }

    // Continue with the request
    const response = NextResponse.next()

    // Add rate limit headers to the response
    response.headers.set("X-RateLimit-Limit", result.limit.toString())
    response.headers.set("X-RateLimit-Remaining", result.remaining.toString())
    response.headers.set("X-RateLimit-Reset", result.reset.toISOString())

    return response
  }
}
