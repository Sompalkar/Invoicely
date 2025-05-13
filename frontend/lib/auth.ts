import type { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { User, type IUser } from "@/models/user.model"
import { connectToDatabase } from "@/lib/db"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
const AUTH0_ISSUER = process.env.AUTH0_ISSUER_BASE_URL || "https://your-tenant.auth0.com"
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE || "your-audience"

export interface JwtPayload {
  userId: string
  email: string
  role: string
}

// Generate JWT token
export function generateToken(user: IUser): string {
  const payload: JwtPayload = {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

// Set auth cookie
export function setAuthCookie(res: NextResponse, token: string): void {
  res.cookies.set({
    name: "auth_token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  })
}

// Clear auth cookie
export function clearAuthCookie(res: NextResponse): void {
  res.cookies.delete("auth_token")
}

// Get current user from request
export async function getCurrentUser(req: NextRequest): Promise<IUser | null> {
  await connectToDatabase()

  // Check for JWT token
  const token = req.cookies.get("auth_token")?.value

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
      return await User.findById(decoded.userId)
    } catch (error) {
      return null
    }
  }

  // Check for Auth0 token
  const auth0Token = req.cookies.get("auth0_token")?.value

  if (auth0Token) {
    try {
      // Verify Auth0 token (simplified - in production you'd validate with Auth0)
      const decoded = jwt.decode(auth0Token) as any

      if (!decoded || !decoded.sub) {
        return null
      }

      // Find user by Auth0 ID or create if not exists
      let user = await User.findOne({ auth0Id: decoded.sub })

      if (!user && decoded.email) {
        // Check if user exists with this email
        user = await User.findOne({ email: decoded.email })

        if (user) {
          // Link Auth0 ID to existing user
          user.auth0Id = decoded.sub
          await user.save()
        } else {
          // Create new user
          user = await User.create({
            username: decoded.name || decoded.nickname || decoded.email.split("@")[0],
            email: decoded.email,
            auth0Id: decoded.sub,
            picture: decoded.picture,
          })
        }
      }

      return user
    } catch (error) {
      return null
    }
  }

  return null
}

// Middleware to protect routes
export async function authMiddleware(req: NextRequest): Promise<{ user: IUser | null; isAuthenticated: boolean }> {
  const user = await getCurrentUser(req)
  return { user, isAuthenticated: !!user }
}
