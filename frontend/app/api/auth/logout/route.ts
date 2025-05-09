import { logout } from "@/lib/controllers/auth.controller"

export async function POST() {
  return logout()
}
