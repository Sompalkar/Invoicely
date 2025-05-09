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
import { motion } from "framer-motion"
import { toast } from "@/components/ui/use-toast"

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
      toast({
        title: "Error",
        description: "There was a problem saving the client. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="max-w-2xl mx-auto border-purple-100 dark:border-purple-800/30 shadow-lg shadow-purple-500/5">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/50 dark:to-violet-950/50 rounded-t-lg">
          <CardTitle className="text-purple-800 dark:text-purple-200">
            {editingClient ? "Edit Client" : "Add New Client"}
          </CardTitle>
          <CardDescription>
            {editingClient
              ? "Update the client's information below."
              : "Fill in the client's details to add them to your client list."}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-6">
            <motion.div
              className="grid gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="border-purple-100 dark:border-purple-800/30 focus-visible:ring-purple-500"
              />
            </motion.div>
            <motion.div
              className="grid gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                required
                className="border-purple-100 dark:border-purple-800/30 focus-visible:ring-purple-500"
              />
            </motion.div>
            <motion.div
              className="grid gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="border-purple-100 dark:border-purple-800/30 focus-visible:ring-purple-500"
              />
            </motion.div>
            <motion.div
              className="grid gap-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Label htmlFor="address">Address (optional)</Label>
              <Textarea
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main St, Anytown, USA"
                rows={3}
                className="border-purple-100 dark:border-purple-800/30 focus-visible:ring-purple-500"
              />
            </motion.div>
          </CardContent>
          <CardFooter className="flex justify-between bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/50 dark:to-violet-950/50 rounded-b-lg">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.push("/dashboard/clients")}
              className="border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30"
            >
              Cancel
            </Button>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 shadow-md shadow-purple-500/20"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    {editingClient ? "Updating..." : "Creating..."}
                  </span>
                ) : (
                  <span>{editingClient ? "Update Client" : "Add Client"}</span>
                )}
              </Button>
            </motion.div>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  )
}
