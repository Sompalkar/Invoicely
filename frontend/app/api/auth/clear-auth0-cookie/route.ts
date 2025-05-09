import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  // Create the response
  const response = NextResponse.json({ success: true })

  // Clear the cookie
  response.cookies.delete("auth0_token")

  return response
}
