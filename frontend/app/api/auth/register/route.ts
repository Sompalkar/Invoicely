import type { NextRequest } from "next/server"
import { register } from "@/lib/controllers/auth.controller"

export async function POST(req: NextRequest) {
  return register(req)
}
