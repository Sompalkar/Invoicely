"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, addDays } from "date-fns"
import { CalendarIcon, Plus, Trash2, FileText, Send, ImageIcon, Pencil, Save, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { invoicesAPI, clientsAPI, apiHandler } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { InvoicePreview } from "@/components/invoice-preview"
import { ProductSelector } from "@/components/product-selector"
import Link from "next/link"

interface Client {
  _id: string
  name: string
  email: string
  address?: string
  phone?: string
}

interface TempClient {
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
  taxable: boolean
}

interface Product {
  _id: string
  name: string
  description: string
  price: number
  taxable: boolean
}

export function CreateInvoiceForm() {
  const router = useRouter()
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState<string>("")
  const [clientMode, setClientMode] = useState<"existing" | "new">("existing")
  const [saveClientToDb, setSaveClientToDb] = useState(false)
  const [tempClient, setTempClient] = useState<TempClient>({
    name: "",
    email: "",
    address: "",
    phone: "",
  })
  const [dueDate, setDueDate] = useState<Date | undefined>(addDays(new Date(), 14))
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: "1", description: "", quantity: 1, price: 0, taxable: true },
  ])
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

  const [companyGst, setCompanyGst] = useState<string>("27AADCB2230M1ZT")
  const [companyPan, setCompanyPan] = useState<string>("AADCB2230M")

  // GST rate settings
  const [cgstRate, setCgstRate] = useState<number>(9)
  const [sgstRate, setSgstRate] = useState<number>(9)
  const [isProductSelectorOpen, setIsProductSelectorOpen] = useState(false)

  // New client form state
  const [isNewClientDialogOpen, setIsNewClientDialogOpen] = useState(false)
  const [newClientName, setNewClientName] = useState("")
  const [newClientEmail, setNewClientEmail] = useState("")
  const [newClientPhone, setNewClientPhone] = useState("")
  const [newClientAddress, setNewClientAddress] = useState("")
  const [isSubmittingClient, setIsSubmittingClient] = useState(false)

  // Product templates for quick addition
  const productTemplates = [
    { name: "Web Design", description: "Professional website design services", price: 1500, taxable: true },
    { name: "Logo Design", description: "Custom logo design with revisions", price: 500, taxable: true },
    { name: "Consulting", description: "Professional consulting services (hourly)", price: 150, taxable: true },
    { name: "Development", description: "Software development services", price: 2000, taxable: true },
    { name: "Maintenance", description: "Monthly website maintenance", price: 250, taxable: true },
  ]

  // Fetch clients on component mount
  useEffect(() => {
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
  }, [])

  const handleAddLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        id: `item-${Date.now()}`,
        description: "",
        quantity: 1,
        price: 0,
        taxable: true,
      },
    ])
  }

  const handleAddProductTemplate = (template: (typeof productTemplates)[0]) => {
    setLineItems([
      ...lineItems,
      {
        id: `item-${Date.now()}`,
        description: `${template.name}: ${template.description}`,
        quantity: 1,
        price: template.price,
        taxable: template.taxable,
      },
    ])
  }

  const handleAddProduct = (product: Product) => {
    setLineItems([
      ...lineItems,
      {
        id: `item-${Date.now()}`,
        description: `${product.name}: ${product.description}`,
        quantity: 1,
        price: product.price,
        taxable: product.taxable,
      },
    ])
    setIsProductSelectorOpen(false)
  }

  const handleRemoveLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((item) => item.id !== id))
    }
  }

  const handleLineItemChange = (id: string, field: keyof LineItem, value: string | number | boolean) => {
    setLineItems(lineItems.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.quantity * item.price, 0)
  }

  const calculateTaxableAmount = () => {
    return lineItems.filter((item) => item.taxable).reduce((sum, item) => sum + item.quantity * item.price, 0)
  }

  const calculateCGST = () => {
    return calculateTaxableAmount() * (cgstRate / 100)
  }

  const calculateSGST = () => {
    return calculateTaxableAmount() * (sgstRate / 100)
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateCGST() + calculateSGST()
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

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmittingClient(true)

    try {
      const clientData = {
        name: newClientName,
        email: newClientEmail,
        phone: newClientPhone || undefined,
        address: newClientAddress || undefined,
      }

      const result = await apiHandler(() => clientsAPI.create(clientData), {
        successMessage: "Client created successfully!",
        errorMessage: "Failed to create client. Please try again.",
      })

      if (result) {
        // Add the new client to the list and select it
        setClients([...clients, result.client])
        setSelectedClient(result.client._id)
        setIsNewClientDialogOpen(false)

        // Reset form
        setNewClientName("")
        setNewClientEmail("")
        setNewClientPhone("")
        setNewClientAddress("")
      }
    } catch (error) {
      console.error("Error creating client:", error)
    } finally {
      setIsSubmittingClient(false)
    }
  }

  const handleTempClientChange = (field: keyof TempClient, value: string) => {
    setTempClient({ ...tempClient, [field]: value })
  }

  const handleSubmit = async (action: "save" | "send") => {
    // Validate client information
    if (clientMode === "existing" && !selectedClient) {
      toast({
        title: "Missing client",
        description: "Please select a client for this invoice.",
        variant: "destructive",
      })
      return
    }

    if (clientMode === "new" && (!tempClient.name || !tempClient.email)) {
      toast({
        title: "Missing client information",
        description: "Please provide at least a name and email for the client.",
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
      let clientId = selectedClient

      // If using a new client and saving to DB, create the client first
      if (clientMode === "new" && saveClientToDb) {
        const clientResult = await apiHandler(
          () =>
            clientsAPI.create({
              name: tempClient.name,
              email: tempClient.email,
              phone: tempClient.phone || undefined,
              address: tempClient.address || undefined,
            }),
          {
            successMessage: "Client saved to database!",
            errorMessage: "Failed to save client. Continuing with invoice creation.",
            showSuccessToast: true,
          },
        )

        if (clientResult) {
          clientId = clientResult.client._id
          // Add to clients list
          setClients([...clients, clientResult.client])
        }
      }

      // Create invoice
      const invoiceData = {
        clientId: clientId,
        totalAmount: calculateTotal(),
        dueDate: dueDate.toISOString(),
        lineItems: validLineItems.map(({ id, ...item }) => item), // Remove the id property
        // If using a new client without saving to DB, include client info
        ...(clientMode === "new" && !saveClientToDb
          ? {
              tempClient: {
                name: tempClient.name,
                email: tempClient.email,
                phone: tempClient.phone,
                address: tempClient.address,
              },
            }
          : {}),
        taxInfo: {
          cgstRate,
          sgstRate,
          cgstAmount: calculateCGST(),
          sgstAmount: calculateSGST(),
          taxableAmount: calculateTaxableAmount(),
        },
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
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
              <CardDescription>Select an existing client or add a new one</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={clientMode}
                onValueChange={(value) => setClientMode(value as "existing" | "new")}
                className="flex flex-col space-y-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="existing" id="existing" />
                  <Label htmlFor="existing" className="font-medium">
                    Use existing client
                  </Label>
                </div>

                {clientMode === "existing" && (
                  <div className="ml-6 space-y-4">
                    {isFetchingClients ? (
                      <div className="flex justify-center py-4">
                        <LoadingSpinner />
                      </div>
                    ) : (
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
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
                        <div className="flex items-end">
                          <Dialog open={isNewClientDialogOpen} onOpenChange={setIsNewClientDialogOpen}>
                            <DialogTrigger asChild>
                              <Button variant="outline">
                                <Plus className="mr-2 h-4 w-4" />
                                Add New Client
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                              <DialogHeader>
                                <DialogTitle>Add New Client</DialogTitle>
                                <DialogDescription>
                                  Fill in the client's details to add them to your client list.
                                </DialogDescription>
                              </DialogHeader>
                              <form onSubmit={handleCreateClient}>
                                <div className="grid gap-4 py-4">
                                  <div className="grid gap-2">
                                    <Label htmlFor="newClientName">Name</Label>
                                    <Input
                                      id="newClientName"
                                      value={newClientName}
                                      onChange={(e) => setNewClientName(e.target.value)}
                                      placeholder="John Doe"
                                      required
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="newClientEmail">Email</Label>
                                    <Input
                                      id="newClientEmail"
                                      type="email"
                                      value={newClientEmail}
                                      onChange={(e) => setNewClientEmail(e.target.value)}
                                      placeholder="john@example.com"
                                      required
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="newClientPhone">Phone (optional)</Label>
                                    <Input
                                      id="newClientPhone"
                                      value={newClientPhone}
                                      onChange={(e) => setNewClientPhone(e.target.value)}
                                      placeholder="+1 (555) 123-4567"
                                    />
                                  </div>
                                  <div className="grid gap-2">
                                    <Label htmlFor="newClientAddress">Address (optional)</Label>
                                    <Textarea
                                      id="newClientAddress"
                                      value={newClientAddress}
                                      onChange={(e) => setNewClientAddress(e.target.value)}
                                      placeholder="123 Main St, Anytown, USA"
                                      rows={3}
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    type="button"
                                    onClick={() => setIsNewClientDialogOpen(false)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button type="submit" disabled={isSubmittingClient}>
                                    {isSubmittingClient ? (
                                      <span className="flex items-center">
                                        <LoadingSpinner size="sm" className="mr-2" />
                                        Creating...
                                      </span>
                                    ) : (
                                      <span>Add Client</span>
                                    )}
                                  </Button>
                                </DialogFooter>
                              </form>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    )}

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
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="new" id="new" />
                  <Label htmlFor="new" className="font-medium">
                    Add new client information
                  </Label>
                </div>

                {clientMode === "new" && (
                  <div className="ml-6 space-y-4">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="tempClientName">Client Name</Label>
                        <Input
                          id="tempClientName"
                          value={tempClient.name}
                          onChange={(e) => handleTempClientChange("name", e.target.value)}
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="tempClientEmail">Client Email</Label>
                        <Input
                          id="tempClientEmail"
                          type="email"
                          value={tempClient.email}
                          onChange={(e) => handleTempClientChange("email", e.target.value)}
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="tempClientPhone">Client Phone (optional)</Label>
                          <Input
                            id="tempClientPhone"
                            value={tempClient.phone}
                            onChange={(e) => handleTempClientChange("phone", e.target.value)}
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="tempClientAddress">Client Address (optional)</Label>
                          <Textarea
                            id="tempClientAddress"
                            value={tempClient.address}
                            onChange={(e) => handleTempClientChange("address", e.target.value)}
                            placeholder="123 Main St, Anytown, USA"
                            rows={2}
                          />
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="saveClient" checked={saveClientToDb} onCheckedChange={setSaveClientToDb} />
                        <Label htmlFor="saveClient" className="flex items-center gap-2">
                          Save client to database
                          {saveClientToDb && <Save className="h-4 w-4 text-green-500" />}
                        </Label>
                      </div>
                    </div>
                  </div>
                )}
              </RadioGroup>
            </CardContent>
          </Card>

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
                  <div className="flex gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-1" /> Add Product
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Quick Add Products</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {productTemplates.map((template, index) => (
                          <DropdownMenuItem key={index} onClick={() => handleAddProductTemplate(template)}>
                            {template.name} - ₹{template.price}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setIsProductSelectorOpen(true)}>
                          <span className="flex items-center">Browse All Products</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/dashboard/products" className="flex items-center">
                            Manage Products <ExternalLink className="ml-2 h-3 w-3" />
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline" size="sm" onClick={handleAddLineItem}>
                      <Plus className="h-4 w-4 mr-1" /> Add Custom Item
                    </Button>
                  </div>
                </div>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-medium">Description</th>
                        <th className="text-right p-3 font-medium w-24">Quantity</th>
                        <th className="text-right p-3 font-medium w-32">Price</th>
                        <th className="text-right p-3 font-medium w-32">Amount</th>
                        <th className="text-center p-3 font-medium w-24">Taxable</th>
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
                          <td className="p-3 text-right">₹{(item.quantity * item.price).toFixed(2)}</td>
                          <td className="p-3 text-center">
                            <Switch
                              checked={item.taxable}
                              onCheckedChange={(checked) => handleLineItemChange(item.id, "taxable", checked)}
                            />
                          </td>
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
                        <td className="p-3 text-right font-medium">₹{calculateSubtotal().toFixed(2)}</td>
                        <td colSpan={2}></td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="p-3 text-right font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <span>CGST ({cgstRate}%):</span>
                            <Input
                              type="number"
                              min="0"
                              max="50"
                              value={cgstRate}
                              onChange={(e) => setCgstRate(Number(e.target.value))}
                              className="w-16 text-right"
                            />
                          </div>
                        </td>
                        <td className="p-3 text-right font-medium">₹{calculateCGST().toFixed(2)}</td>
                        <td colSpan={2}></td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="p-3 text-right font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <span>SGST ({sgstRate}%):</span>
                            <Input
                              type="number"
                              min="0"
                              max="50"
                              value={sgstRate}
                              onChange={(e) => setSgstRate(Number(e.target.value))}
                              className="w-16 text-right"
                            />
                          </div>
                        </td>
                        <td className="p-3 text-right font-medium">₹{calculateSGST().toFixed(2)}</td>
                        <td colSpan={2}></td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="p-3 text-right font-medium">
                          Total:
                        </td>
                        <td className="p-3 text-right font-bold text-lg">₹{calculateTotal().toFixed(2)}</td>
                        <td colSpan={2}></td>
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
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
              <CardDescription>Add your company information to the invoice</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyGst">GST Number</Label>
                  <Input
                    id="companyGst"
                    value={companyGst}
                    onChange={(e) => setCompanyGst(e.target.value)}
                    className="mt-1"
                    placeholder="27AADCB2230M1ZT"
                  />
                </div>
                <div>
                  <Label htmlFor="companyPan">PAN Number</Label>
                  <Input
                    id="companyPan"
                    value={companyPan}
                    onChange={(e) => setCompanyPan(e.target.value)}
                    className="mt-1"
                    placeholder="AADCB2230M"
                  />
                </div>
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
          <InvoicePreview
            invoiceData={{
              companyName,
              companyAddress,
              companyLogo,
              companySignature,
              companyGst,
              companyPan,
              clientMode,
              selectedClientData,
              tempClient,
              dueDate,
              lineItems,
              notes,
              taxInfo: {
                cgstRate,
                sgstRate,
                cgstAmount: calculateCGST(),
                sgstAmount: calculateSGST(),
                taxableAmount: calculateTaxableAmount(),
              },
            }}
            onEditClick={() => setActiveTab("details")}
          />
        </TabsContent>
      </Tabs>

      {/* Product Selector Dialog */}
      <Dialog open={isProductSelectorOpen} onOpenChange={setIsProductSelectorOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Select Product</DialogTitle>
            <DialogDescription>Choose a product from your catalog to add to the invoice</DialogDescription>
          </DialogHeader>
          <ProductSelector onSelectProduct={handleAddProduct} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
