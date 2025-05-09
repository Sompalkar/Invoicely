import { ClientForm } from "@/components/client-form"

export default function AddClientPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Add New Client</h1>
        <p className="text-muted-foreground">Create a new client to start generating invoices for them.</p>
      </div>
      <ClientForm />
    </div>
  )
}
