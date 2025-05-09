import { type NextRequest, NextResponse } from "next/server"
import { User } from "@/models/user.model"
import { connectToDatabase } from "@/lib/db"
import { generateToken, setAuthCookie, clearAuthCookie } from "@/lib/auth"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"
export async function register(req: NextRequest): Promise<NextResponse> {
  await connectToDatabase()

  try {
    const { username, email, password } = await req.json()

    // Validate input
    if (!username || !email || !password) {
      return NextResponse.json({ message: "Username, email, and password are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 400 })
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
    })

    // Generate token
    const token = generateToken(user)

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    })

    // Set auth cookie
    setAuthCookie(response, token)

    return response
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Registration failed" }, { status: 500 })
  }
}

export async function login(req: NextRequest): Promise<NextResponse> {
  await connectToDatabase()

  try {
    const { email, password } = await req.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
    }

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    // Check password
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate token
    const token = generateToken(user)

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        picture: user.picture,
      },
    })

    // Set auth cookie
    setAuthCookie(response, token)

    return response
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Login failed" }, { status: 500 })
  }
}

export async function logout(): Promise<NextResponse> {
  const response = NextResponse.json({ success: true })
  clearAuthCookie(response)
  return response
}

// export async function getMe(req: NextRequest): Promise<NextResponse> {
//   await connectToDatabase()

//   try {
//     // Get user from auth middleware
//     const { user, isAuthenticated } = await import("@/lib/auth").then((module) => module.authMiddleware(req))

//     if (!isAuthenticated || !user) {
//       return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
//     }

//     return NextResponse.json({
//       id: user._id,
//       username: user.username,
//       email: user.email,
//       role: user.role,
//       picture: user.picture,
//     })
//   } catch (error) {
//     console.error("Get me error:", error)
//     return NextResponse.json({ message: "Failed to get user information" }, { status: 500 })
//   }
// }

















export async function getMe(req: NextRequest): Promise<NextResponse> {
    await connectToDatabase()
  
    try {
      const token = req.cookies.get("auth_token")?.value
  
      if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
      }
  
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload
      const user = await User.findById(decoded.userId)
  
      if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 })
      }
  
      return NextResponse.json({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        picture: user.picture,
      })
    } catch (error) {
      console.error("Get me error:", error)
      return NextResponse.json({ message: "Failed to get user information" }, { status: 500 })
    }
  }

  

















export async function updateProfile(req: NextRequest): Promise<NextResponse> {
  await connectToDatabase()

  try {
    // Get user from auth middleware
    const { user, isAuthenticated } = await import("@/lib/auth").then((module) => module.authMiddleware(req))

    if (!isAuthenticated || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { username, email } = await req.json()

    // Update user
    if (username) user.username = username
    if (email && email !== user.email) {
      // Check if email is already in use
      const existingUser = await User.findOne({ email, _id: { $ne: user._id } })
      if (existingUser) {
        return NextResponse.json({ message: "Email is already in use" }, { status: 400 })
      }
      user.email = email
    }

    await user.save()

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        picture: user.picture,
      },
    })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ message: "Failed to update profile" }, { status: 500 })
  }
}

export async function changePassword(req: NextRequest): Promise<NextResponse> {
  await connectToDatabase()

  try {
    // Get user from auth middleware
    const { user, isAuthenticated } = await import("@/lib/auth").then((module) => module.authMiddleware(req))

    if (!isAuthenticated || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { currentPassword, newPassword } = await req.json()

    // Validate input
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ message: "Current password and new password are required" }, { status: 400 })
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return NextResponse.json({ message: "Current password is incorrect" }, { status: 401 })
    }

    // Update password
    user.password = newPassword
    await user.save()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json({ message: "Failed to change password" }, { status: 500 })
  }
}
