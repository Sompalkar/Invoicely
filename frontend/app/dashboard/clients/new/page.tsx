import { CreateClientForm } from "@/components/create-client-form"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"

export default function NewClientPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1">
        <DashboardNav />
        <main className="flex-1 p-6">
          <div className="flex flex-col space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Add New Client</h1>
            <CreateClientForm />
          </div>
        </main>
      </div>
    </div>
  )
}
