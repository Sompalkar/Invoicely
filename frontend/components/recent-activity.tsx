"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { invoicesAPI } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from 'lucide-react'

interface Invoice {
  _id: string
  invoiceNumber: string
  clientId: {
    _id: string
    name: string
  }
  totalAmount: number
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
  createdAt: string
  updatedAt: string
}

export function RecentActivity() {
  const [activities, setActivities] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchRecentInvoices()
  }, [])

  const fetchRecentInvoices = async () => {
    try {
      setIsLoading(true)
      const data = await invoicesAPI.getInvoices()
      // Sort by updatedAt date and take the 5 most recent
      const sortedData = data
        .sort((a: Invoice, b: Invoice) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5)
      setActivities(sortedData)
    } catch (error: any) {
      toast({
        title: "Error fetching recent activity",
        description: error.response?.data?.message || "Could not load recent activity. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Function to format relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) {
      return "Just now"
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} ${days === 1 ? "day" : "days"} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  // Function to get activity description based on status
  const getActivityDescription = (invoice: Invoice) => {
    switch (invoice.status) {
      case "draft":
        return `Invoice #${invoice.invoiceNumber} created`
      case "sent":
        return `Invoice #${invoice.invoiceNumber} sent`
      case "paid":
        return `Invoice #${invoice.invoiceNumber} paid`
      case "overdue":
        return `Invoice #${invoice.invoiceNumber} overdue`
      case "cancelled":
        return `Invoice #${invoice.invoiceNumber} cancelled`
      default:
        return `Invoice #${invoice.invoiceNumber} updated`
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No recent activity to display.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity._id} className="flex items-center gap-4">
          <Avatar className="h-9 w-9">
            <AvatarImage src={`/placeholder.svg?height=36&width=36`} alt={activity.clientId.name} />
            <AvatarFallback className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
              {getInitials(activity.clientId.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">{activity.clientId.name}</p>
            <p className="text-sm text-muted-foreground">{getActivityDescription(activity)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">${activity.totalAmount.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{getRelativeTime(activity.updatedAt)}</p>
          </div>
          <Badge
            variant={
              activity.status === "paid"
                ? "default"
                : activity.status === "sent"
                  ? "secondary"
                  : activity.status === "draft"
                    ? "outline"
                    : "destructive"
            }
            className={activity.status === "paid" ? "bg-green-500" : activity.status === "overdue" ? "bg-red-500" : ""}
          >
            {activity.status}
          </Badge>
        </div>
      ))}
    </div>
  )
}
