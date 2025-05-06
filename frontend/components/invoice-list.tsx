"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Plus, MoreHorizontal, Search, FileText, Send, Eye, Edit, Trash, Download } from "lucide-react"
import { invoicesAPI, apiHandler } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useRouter } from "next/navigation"

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
  dueDate: string
}

export function InvoiceList() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  useEffect(() => {
    fetchInvoices()
  }, [statusFilter])

  const fetchInvoices = async () => {
    setIsLoading(true)
    try {
      const filters = statusFilter ? { status: statusFilter } : {}
      const data = await invoicesAPI.getAll(filters)
      setInvoices(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch invoices. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (id: string, status: "draft" | "sent" | "paid" | "overdue" | "cancelled") => {
    await apiHandler(() => invoicesAPI.updateStatus(id, status), {
      successMessage: `Invoice marked as ${status}`,
      errorMessage: "Failed to update invoice status",
      showSuccessToast: true,
    })
    fetchInvoices()
  }

  const handleSendInvoice = async (id: string) => {
    await apiHandler(() => invoicesAPI.send(id), {
      successMessage: "Invoice sent successfully",
      errorMessage: "Failed to send invoice",
      showSuccessToast: true,
    })
    fetchInvoices()
  }

  const filteredInvoices = invoices.filter(
    (invoice) =>
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.clientId.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "paid":
        return { variant: "default", className: "bg-green-500" }
      case "sent":
        return { variant: "secondary", className: "" }
      case "draft":
        return { variant: "outline", className: "" }
      case "overdue":
        return { variant: "destructive", className: "" }
      case "cancelled":
        return { variant: "outline", className: "bg-gray-500 text-white" }
      default:
        return { variant: "outline", className: "" }
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search invoices..."
              className="pl-8 w-full sm:w-[300px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">{statusFilter ? `Status: ${statusFilter}` : "All Statuses"}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter(null)}>All Statuses</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStatusFilter("draft")}>Draft</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("sent")}>Sent</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("paid")}>Paid</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("overdue")}>Overdue</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("cancelled")}>Cancelled</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => router.push("/dashboard/invoices/create")}>
          <Plus className="mr-2 h-4 w-4" />
          New Invoice
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No invoices found. Try a different search or create a new invoice.
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => {
                  const badgeProps = getStatusBadgeVariant(invoice.status)
                  return (
                    <TableRow key={invoice._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {invoice.invoiceNumber}
                        </div>
                      </TableCell>
                      <TableCell>{invoice.clientId.name}</TableCell>
                      <TableCell>${invoice.totalAmount.toFixed(2)}</TableCell>
                      <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant={badgeProps.variant as any} className={badgeProps.className}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/invoices/${invoice._id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/invoices/${invoice._id}/edit`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            {invoice.status === "draft" && (
                              <DropdownMenuItem onClick={() => handleSendInvoice(invoice._id)}>
                                <Send className="mr-2 h-4 w-4" />
                                Send
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                            {invoice.status !== "paid" && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(invoice._id, "paid")}>
                                Mark as Paid
                              </DropdownMenuItem>
                            )}
                            {invoice.status !== "sent" && invoice.status !== "paid" && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(invoice._id, "sent")}>
                                Mark as Sent
                              </DropdownMenuItem>
                            )}
                            {invoice.status !== "overdue" && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(invoice._id, "overdue")}>
                                Mark as Overdue
                              </DropdownMenuItem>
                            )}
                            {invoice.status !== "cancelled" && (
                              <DropdownMenuItem onClick={() => handleUpdateStatus(invoice._id, "cancelled")}>
                                Mark as Cancelled
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
