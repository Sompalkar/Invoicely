import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 })
    }

    // Create the response
    const response = NextResponse.json({ success: true })

    // Set the cookie
    response.cookies.set({
      name: "auth0_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Error setting Auth0 cookie:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
