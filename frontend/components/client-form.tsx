"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { clientsAPI, apiHandler } from "@/lib/api"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useRouter } from "next/navigation"

interface ClientFormProps {
  editingClient?: {
    _id: string
    name: string
    email: string
    phone?: string
    address?: string
  } | null
}

export function ClientForm({ editingClient = null }: ClientFormProps) {
  const router = useRouter()
  const [name, setName] = useState(editingClient?.name || "")
  const [email, setEmail] = useState(editingClient?.email || "")
  const [phone, setPhone] = useState(editingClient?.phone || "")
  const [address, setAddress] = useState(editingClient?.address || "")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const clientData = {
      name,
      email,
      phone: phone || undefined,
      address: address || undefined,
    }

    try {
      if (editingClient) {
        await apiHandler(() => clientsAPI.update(editingClient._id, clientData), {
          successMessage: "Client updated successfully",
          errorMessage: "Failed to update client",
        })
      } else {
        await apiHandler(() => clientsAPI.create(clientData), {
          successMessage: "Client created successfully",
          errorMessage: "Failed to create client",
        })
      }
      router.push("/dashboard/clients")
      router.refresh()
    } catch (error) {
      console.error("Error saving client:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{editingClient ? "Edit Client" : "Add New Client"}</CardTitle>
        <CardDescription>
          {editingClient
            ? "Update the client's information below."
            : "Fill in the client's details to add them to your client list."}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">Address (optional)</Label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Main St, Anytown, USA"
              rows={3}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => router.push("/dashboard/clients")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center">
                <LoadingSpinner size="sm" className="mr-2" />
                {editingClient ? "Updating..." : "Creating..."}
              </span>
            ) : (
              <span>{editingClient ? "Update Client" : "Add Client"}</span>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
