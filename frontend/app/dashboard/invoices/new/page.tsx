import { CreateInvoiceForm } from "@/components/create-invoice-form"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"

export default function NewInvoicePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1">
        <DashboardNav />
        <main className="flex-1 p-6">
          <div className="flex flex-col space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Create New Invoice</h1>
            <CreateInvoiceForm />
          </div>
        </main>
      </div>
    </div>
  )
}
