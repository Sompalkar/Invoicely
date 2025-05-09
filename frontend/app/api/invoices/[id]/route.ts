import type { NextRequest } from "next/server"
import { getInvoice, updateInvoice, deleteInvoice } from "@/lib/controllers/invoice.controller"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return getInvoice(req, { params })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  return updateInvoice(req, { params })
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return deleteInvoice(req, { params })
}
