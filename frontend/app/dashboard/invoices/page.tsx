"use client"

import { CreateInvoiceForm } from "@/components/create-invoice-form"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"

export default function CreateInvoicePage() {
  return (
    <div className="flex min-h-screen flex-col">
      
      <div className="flex flex-1">
       
        <main className="flex-1 p-6">
          <CreateInvoiceForm />
        </main>
      </div>
    </div>
  )
}
