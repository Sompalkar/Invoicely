"use client"

import { useRef } from "react"
import { format } from "date-fns"
import { Pencil, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { motion } from "framer-motion"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { toast } from "@/components/ui/use-toast"

interface InvoicePreviewProps {
  invoiceData: {
    companyName: string
    companyAddress: string
    companyLogo: string | null
    companySignature: string | null
    companyGst: string
    companyPan: string
    clientMode: "existing" | "new"
    selectedClientData?: {
      name: string
      email: string
      address?: string
      phone?: string
    } | null
    tempClient: {
      name: string
      email: string
      address?: string
      phone?: string
    }
    dueDate?: Date
    lineItems: Array<{
      id: string
      description: string
      quantity: number
      price: number
      taxable: boolean
    }>
    notes: string
    taxInfo: {
      cgstRate: number
      sgstRate: number
      cgstAmount: number
      sgstAmount: number
      taxableAmount: number
    }
  }
  onEditClick: () => void
}

export function InvoicePreview({ invoiceData, onEditClick }: InvoicePreviewProps) {
  const invoiceRef = useRef<HTMLDivElement>(null)
  const printableInvoiceRef = useRef<HTMLDivElement>(null)
  const {
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
    taxInfo,
  } = invoiceData

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.quantity * item.price, 0)
  }

  const calculateTotal = () => {
    return calculateSubtotal() + taxInfo.cgstAmount + taxInfo.sgstAmount


    
  }

  const clientData = clientMode === "existing" ? selectedClientData : tempClient

  const handleDownloadPdf = async () => {
    if (!printableInvoiceRef.current) return

    try {
      const canvas = await html2canvas(printableInvoiceRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
      })

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Calculate dimensions to fit the content properly
      const imgWidth = 210 // A4 width in mm (portrait)
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
      pdf.save(`Invoice-${Date.now().toString().slice(-6)}.pdf`)

      toast({
        title: "Success",
        description: "Invoice downloaded successfully",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="border-purple-100 dark:border-purple-800/30 shadow-lg shadow-purple-500/5">
      <CardContent className="p-6">
        <div ref={invoiceRef} className="border rounded-lg p-8 bg-background shadow-sm">
          <div ref={printableInvoiceRef}>
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-8 gap-4">
              <div className="space-y-2">
                {companyLogo ? (
                  <img
                    src={companyLogo || "/placeholder.svg"}
                    alt="Company Logo"
                    className="max-h-20 max-w-[200px] object-contain mb-2"
                  />
                ) : (
                  <div className="h-16 w-40 bg-muted rounded-md"></div>
                )}
                <h3 className="font-bold text-lg">{companyName}</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{companyAddress}</p>
                {companyGst && (
                  <p className="text-sm">
                    <span className="font-medium">GST No:</span> {companyGst}
                  </p>
                )}
                {companyPan && (
                  <p className="text-sm">
                    <span className="font-medium">PAN:</span> {companyPan}
                  </p>
                )}
              </div>
              <div className="text-left md:text-right">
                <h1 className="text-2xl md:text-3xl font-bold text-purple-600 mb-2">INVOICE</h1>
                <p className="text-sm text-muted-foreground">Date: {format(new Date(), "PPP")}</p>
                <p className="text-sm text-muted-foreground">
                  Due Date: {dueDate ? format(dueDate, "PPP") : "Not set"}
                </p>
                <p className="text-sm text-muted-foreground">Invoice No: INV-{Date.now().toString().slice(-6)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="font-medium text-muted-foreground mb-2">Bill To:</h3>
                {clientData ? (
                  <div>
                    <p className="font-medium">{clientData.name}</p>
                    <p className="text-sm text-muted-foreground">{clientData.email}</p>
                    {clientData.address && <p className="text-sm text-muted-foreground">{clientData.address}</p>}
                    {clientData.phone && <p className="text-sm text-muted-foreground">{clientData.phone}</p>}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No client selected</p>
                )}
              </div>
              <div>
                <h3 className="font-medium text-muted-foreground mb-2">Payment Details:</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <p className="text-sm">Bank Name:</p>
                  <p className="text-sm font-medium">HDFC Bank</p>
                  <p className="text-sm">Account No:</p>
                  <p className="text-sm font-medium">XXXXXXXXXXXX</p>
                  <p className="text-sm">IFSC Code:</p>
                  <p className="text-sm font-medium">HDFC0000XXX</p>
                </div>
              </div>
            </div>

            <div className="mb-8 overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-purple-100 dark:bg-purple-900/30 text-left">
                    <th className="p-3 rounded-tl-md">Description</th>
                    <th className="p-3 text-right">Quantity</th>
                    <th className="p-3 text-right">Price</th>
                    <th className="p-3 text-right">Taxable</th>
                    <th className="p-3 text-right rounded-tr-md">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-3">{item.description || "Item description"}</td>
                      <td className="p-3 text-right">{item.quantity}</td>
                      <td className="p-3 text-right">₹{item.price.toFixed(2)}</td>
                      <td className="p-3 text-right">{item.taxable ? "Yes" : "No"}</td>
                      <td className="p-3 text-right">₹{(item.quantity * item.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4} className="p-3 text-right font-medium">
                      Subtotal:
                    </td>
                    <td className="p-3 text-right font-medium">₹{calculateSubtotal().toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="p-3 text-right font-medium">
                      CGST ({taxInfo.cgstRate}%):
                    </td>
                    <td className="p-3 text-right font-medium">₹{taxInfo.cgstAmount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="p-3 text-right font-medium">
                      SGST ({taxInfo.sgstRate}%):
                    </td>
                    <td className="p-3 text-right font-medium">₹{taxInfo.sgstAmount.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="p-3 text-right font-medium">
                      Total:
                    </td>
                    <td className="p-3 text-right font-bold text-lg">₹{calculateTotal().toFixed(2)}</td>
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
              <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-4">Thank you for your business!</p>
                  <p className="text-xs text-muted-foreground">
                    Please make payment by the due date to the account details provided.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    This is a computer-generated invoice and does not require a physical signature.
                  </p>
                </div>
                {companySignature && (
                  <div className="text-left md:text-right mt-4 md:mt-0">
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
        </div>
      </CardContent>
      
    </Card>
  )
}
