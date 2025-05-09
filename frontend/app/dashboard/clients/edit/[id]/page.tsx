 "use client"

import { useEffect, useState } from "react"
import { ClientForm } from "@/components/client-form"
import { clientsAPI } from "@/lib/api"
import { LoadingSpinner } from "@/components/loading-spinner"
import { toast } from "@/components/ui/use-toast"

export default function EditClientPage({ params }: { params: { id: string } }) {
  const [client, setClient] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const data = await clientsAPI.getById(params.id)
        setClient(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch client details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchClient()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Client</h1>
        <p className="text-muted-foreground">Update the client's information below.</p>
      </div>
      {client && <ClientForm editingClient={client} />}
    </div>
  )
}
