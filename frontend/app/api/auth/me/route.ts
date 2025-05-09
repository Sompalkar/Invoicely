import type { NextRequest } from "next/server"
import { getMe } from "@/lib/controllers/auth.controller"

export async function GET(req: NextRequest) {
  return getMe(req)
}
