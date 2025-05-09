import type { NextRequest } from "next/server"
import { getInvoices, createInvoice } from "@/lib/controllers/invoice.controller"

export async function GET(req: NextRequest) {
  return getInvoices(req)
}

export async function POST(req: NextRequest) {
  return createInvoice(req)
}
