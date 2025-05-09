import type { NextRequest } from "next/server"
import { updateProfile } from "@/lib/controllers/auth.controller"

export async function PUT(req: NextRequest) {
  return updateProfile(req)
}
