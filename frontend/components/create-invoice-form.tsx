"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Plus, Trash2, FileText, Download, Send, Eye, ImageIcon, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"
import { invoicesAPI, clientsAPI, apiHandler } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useRouter } from "next/navigation"

interface Client {
  _id: string
  name: string
  email: string
  address?: string
  phone?: string
}

interface LineItem {
  id: string
  description: string
  quantity: number
  price: number
}

export function CreateInvoiceForm() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<string>("")
  const [dueDate, setDueDate] = useState<Date | undefined>(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Default to 14 days from now
  )
  const [lineItems, setLineItems] = useState<LineItem[]>([{ id: "1", description: "", quantity: 1, price: 0 }])
  const [notes, setNotes] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isFetchingClients, setIsFetchingClients] = useState<boolean>(true)
  const [activeTab, setActiveTab] = useState<string>("details")
  const [companyName, setCompanyName] = useState<string>("Your Company Name")
  const [companyAddress, setCompanyAddress] = useState<string>("123 Business St, City, Country")
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)
  const [companySignature, setCompanySignature] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const signatureInputRef = useRef<HTMLInputElement>(null)

  // Fetch clients on component mount
  useState(() => {
    const fetchClients = async () => {
      try {
        const clientsData = await clientsAPI.getAll()
        setClients(clientsData)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch clients. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsFetchingClients(false)
      }
    }

    fetchClients()
  })

  const handleAddLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: `item-${Date.now()}`,
        description: "",
        quantity: 1,
        price: 0,
      },
    ])
  }

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id))
    }
  }

  const handleLineItemChange = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.quantity * item.price, 0)
  }

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCompanyLogo(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSignatureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCompanySignature(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (action: "save" | "send") => {
    if (!selectedClient) {
      toast({
        title: "Missing client",
        description: "Please select a client for this invoice.",
        variant: "destructive",
      })
      return
    }

    if (!dueDate) {
      toast({
        title: "Missing due date",
        description: "Please select a due date for this invoice.",
        variant: "destructive",
      })
      return
    }

    // Validate line items
    const validLineItems = lineItems.filter(
      (item) => item.description.trim() !== "" && item.quantity > 0 && item.price > 0,
    )

    if (validLineItems.length === 0) {
      toast({
        title: "Invalid line items",
        description: "Please add at least one valid line item with description, quantity, and price.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Create invoice
      const invoiceData = {
        clientId: selectedClient,
        totalAmount: calculateSubtotal(),
        dueDate: dueDate.toISOString(),
        lineItems: validLineItems.map(({ id, ...item }) => item), // Remove the id property
      }

      const result = await apiHandler(() => invoicesAPI.create(invoiceData), {
        successMessage: "Invoice created successfully!",
        errorMessage: "Failed to create invoice. Please try again.",
      })

      if (result) {
        if (action === "send") {
          // Send the invoice
          await apiHandler(() => invoicesAPI.send(result.invoice._id), {
            successMessage: "Invoice sent to client!",
            errorMessage: "Invoice created but failed to send. You can send it later from the dashboard.",
          })
        }

        // Redirect to dashboard
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error creating invoice:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const selectedClientData = clients.find((client) => client._id === selectedClient)

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Create New Invoice</h1>
          <TabsList>
            <TabsTrigger value="details">Invoice Details</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Details</CardTitle>
                <CardDescription>Add your company information to the invoice</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyLogo">Company Logo</Label>
                    <div
                      className="mt-2 border-2 border-dashed rounded-md p-4 h-40 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => logoInputRef.current?.click()}
                    >
                      {companyLogo ? (
                        <div className="relative w-full h-full">
                          <img
                            src={companyLogo || "/placeholder.svg"}
                            alt="Company Logo"
                            className="w-full h-full object-contain"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-0 right-0 bg-background/80 hover:bg-background"
                            onClick={(e) => {
                              e.stopPropagation()
                              setCompanyLogo(null)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Drop your image here or click to browse</p>
                          <p className="text-xs text-muted-foreground mt-1">Max size: 5MB</p>
                        </>
                      )}
                      <input
                        ref={logoInputRef}
                        type="file"
                        id="companyLogo"
                        className="hidden"
                        accept="image/*"
                        onChange={handleLogoUpload}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="companySignature">Company Signature</Label>
                    <div
                      className="mt-2 border-2 border-dashed rounded-md p-4 h-40 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => signatureInputRef.current?.click()}
                    >
                      {companySignature ? (
                        <div className="relative w-full h-full">
                          <img
                            src={companySignature || "/placeholder.svg"}
                            alt="Company Signature"
                            className="w-full h-full object-contain"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-0 right-0 bg-background/80 hover:bg-background"
                            onClick={(e) => {
                              e.stopPropagation()
                              setCompanySignature(null)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Pencil className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Drop your signature here or click to browse</p>
                          <p className="text-xs text-muted-foreground mt-1">Max size: 5MB</p>
                        </>
                      )}
                      <input
                        ref={signatureInputRef}
                        type="file"
                        id="companySignature"
                        className="hidden"
                        accept="image/*"
                        onChange={handleSignatureUpload}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="companyAddress">Company Address</Label>
                  <Textarea
                    id="companyAddress"
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Details</CardTitle>
                <CardDescription>Select a client for this invoice</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isFetchingClients ? (
                  <div className="flex justify-center py-4">
                    <LoadingSpinner />
                  </div>
                ) : clients.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground mb-4">No clients found. Add a client first.</p>
                    <Button variant="outline" onClick={() => router.push("/dashboard/clients")}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Client
                    </Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="client">Select Client</Label>
                      <Select value={selectedClient} onValueChange={setSelectedClient}>
                        <SelectTrigger id="client" className="mt-1">
                          <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client._id} value={client._id}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedClientData && (
                      <div className="border rounded-md p-4 mt-4 bg-muted/30">
                        <h3 className="font-medium mb-2">Client Information</h3>
                        <p className="text-sm">{selectedClientData.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedClientData.email}</p>
                        {selectedClientData.address && (
                          <p className="text-sm text-muted-foreground">{selectedClientData.address}</p>
                        )}
                        {selectedClientData.phone && (
                          <p className="text-sm text-muted-foreground">{selectedClientData.phone}</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
              <CardDescription>Add line items and set the due date</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <div className="mt-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dueDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? format(dueDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                        initialFocus
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Line Items</Label>
                  <Button variant="outline" size="sm" onClick={handleAddLineItem}>
                    <Plus className="h-4 w-4 mr-1" /> Add Item
                  </Button>
                </div>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-medium">Description</th>
                        <th className="text-right p-3 font-medium w-24">Quantity</th>
                        <th className="text-right p-3 font-medium w-32">Price</th>
                        <th className="text-right p-3 font-medium w-32">Amount</th>
                        <th className="p-3 w-16"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((item, index) => (
                        <tr key={item.id} className="border-t">
                          <td className="p-3">
                            <Input
                              value={item.description}
                              onChange={(e) => handleLineItemChange(item.id, "description", e.target.value)}
                              placeholder="Item description"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleLineItemChange(item.id, "quantity", Number.parseInt(e.target.value) || 0)
                              }
                              className="text-right"
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.price}
                              onChange={(e) =>
                                handleLineItemChange(item.id, "price", Number.parseFloat(e.target.value) || 0)
                              }
                              className="text-right"
                            />
                          </td>
                          <td className="p-3 text-right">${(item.quantity * item.price).toFixed(2)}</td>
                          <td className="p-3 text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveLineItem(item.id)}
                              disabled={lineItems.length === 1}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-muted/50">
                      <tr>
                        <td colSpan={3} className="p-3 text-right font-medium">
                          Subtotal:
                        </td>
                        <td className="p-3 text-right font-medium">${calculateSubtotal().toFixed(2)}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes or payment instructions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => router.push("/dashboard")}>
                Cancel
              </Button>
              <Button variant="default" onClick={() => handleSubmit("save")} disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    Save Invoice
                  </span>
                )}
              </Button>
              <Button
                variant="default"
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => handleSubmit("send")}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <LoadingSpinner size="sm" className="mr-2" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <Send className="mr-2 h-4 w-4" />
                    Save & Send
                  </span>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="border rounded-lg p-8 bg-white dark:bg-gray-800 shadow-sm">
                <div className="flex justify-between items-start mb-8">
                  <div className="space-y-2">
                    {companyLogo ? (
                      <img
                        src={companyLogo || "/placeholder.svg"}
                        alt="Company Logo"
                        className="max-h-20 max-w-[200px] object-contain mb-2"
                      />
                    ) : (
                      <div className="h-16 w-40 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                    )}
                    <h3 className="font-bold text-lg">{companyName}</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{companyAddress}</p>
                  </div>
                  <div className="text-right">
                    <h1 className="text-3xl font-bold text-purple-600 mb-2">INVOICE</h1>
                    <p className="text-sm text-muted-foreground">Date: {format(new Date(), "PPP")}</p>
                    <p className="text-sm text-muted-foreground">
                      Due Date: {dueDate ? format(dueDate, "PPP") : "Not set"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="font-medium text-muted-foreground mb-2">Bill To:</h3>
                    {selectedClientData ? (
                      <div>
                        <p className="font-medium">{selectedClientData.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedClientData.email}</p>
                        {selectedClientData.address && (
                          <p className="text-sm text-muted-foreground">{selectedClientData.address}</p>
                        )}
                        {selectedClientData.phone && (
                          <p className="text-sm text-muted-foreground">{selectedClientData.phone}</p>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground italic">No client selected</p>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-muted-foreground mb-2">Invoice Details:</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      <p className="text-sm">Invoice Number:</p>
                      <p className="text-sm font-medium">INV-0001</p>
                      <p className="text-sm">Payment Terms:</p>
                      <p className="text-sm font-medium">Due on receipt</p>
                    </div>
                  </div>
                </div>

                <div className="mb-8">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-purple-100 dark:bg-purple-900/30 text-left">
                        <th className="p-3 rounded-tl-md">Description</th>
                        <th className="p-3 text-right">Quantity</th>
                        <th className="p-3 text-right">Price</th>
                        <th className="p-3 text-right rounded-tr-md">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((item, index) => (
                        <tr key={item.id} className="border-b">
                          <td className="p-3">{item.description || "Item description"}</td>
                          <td className="p-3 text-right">{item.quantity}</td>
                          <td className="p-3 text-right">${item.price.toFixed(2)}</td>
                          <td className="p-3 text-right">${(item.quantity * item.price).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="p-3 text-right font-medium">
                          Subtotal:
                        </td>
                        <td className="p-3 text-right font-medium">${calculateSubtotal().toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="p-3 text-right font-medium">
                          Total:
                        </td>
                        <td className="p-3 text-right font-bold text-lg">${calculateSubtotal().toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {notes && (
                  <div className="mb-8">
                    <h3 className="font-medium mb-2">Notes:</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{notes}</p>
                  </div>
                )}

                <div className="mt-12 pt-8 border-t">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm text-muted-foreground mb-4">Thank you for your business!</p>
                      <p className="text-xs text-muted-foreground">
                        Please make payment by the due date to the account details provided.
                      </p>
                    </div>
                    {companySignature && (
                      <div className="text-right">
                        <img
                          src={companySignature || "/placeholder.svg"}
                          alt="Signature"
                          className="max-h-16 max-w-[200px] object-contain inline-block mb-2"
                        />
                        <p className="text-sm text-muted-foreground">Authorized Signature</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                Print Preview
              </Button>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Button
                variant="default"
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => setActiveTab("details")}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit Invoice
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
