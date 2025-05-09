import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  const cookieStore = cookies()

  // Clear all auth-related cookies
  cookieStore.delete("auth_token")
  cookieStore.delete("auth0_token")
  cookieStore.delete("appSession")
  cookieStore.delete("token")

  // Clear any other cookies that might be related to authentication
  cookieStore.getAll().forEach((cookie) => {
    if (cookie.name.includes("auth") || cookie.name.includes("token") || cookie.name.includes("session")) {
      cookieStore.delete(cookie.name)
    }
  })

  return NextResponse.json({ success: true })
}
