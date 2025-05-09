import type { NextRequest } from "next/server"
import { changePassword } from "@/lib/controllers/auth.controller"

export async function PUT(req: NextRequest) {
  return changePassword(req)
}
