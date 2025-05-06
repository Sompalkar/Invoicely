"use client"

import { useRef } from "react"
import { format } from "date-fns"
import { Eye, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { PdfGenerator } from "@/components/pdf-generator"

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
    }>
    notes: string
  }
  onEditClick: () => void
}

export function InvoicePreview({ invoiceData, onEditClick }: InvoicePreviewProps) {
  const invoiceRef = useRef<HTMLDivElement>(null)
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
  } = invoiceData

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.quantity * item.price, 0)
  }

  const calculateGst = () => {
    return calculateSubtotal() * 0.18 // 18% GST
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateGst()
  }

  const clientData = clientMode === "existing" ? selectedClientData : tempClient

  return (
    <Card>
      <CardContent className="p-6">
        <div ref={invoiceRef} className="border rounded-lg p-8 bg-background shadow-sm">
          <div className="flex justify-between items-start mb-8">
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
            <div className="text-right">
              <h1 className="text-3xl font-bold text-purple-600 mb-2">INVOICE</h1>
              <p className="text-sm text-muted-foreground">Date: {format(new Date(), "PPP")}</p>
              <p className="text-sm text-muted-foreground">Due Date: {dueDate ? format(dueDate, "PPP") : "Not set"}</p>
              <p className="text-sm text-muted-foreground">Invoice No: INV-{Date.now().toString().slice(-6)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
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
                {lineItems.map((item) => (
                  <tr key={item.id} className="border-b">
                    <td className="p-3">{item.description || "Item description"}</td>
                    <td className="p-3 text-right">{item.quantity}</td>
                    <td className="p-3 text-right">₹{item.price.toFixed(2)}</td>
                    <td className="p-3 text-right">₹{(item.quantity * item.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="p-3 text-right font-medium">
                    Subtotal:
                  </td>
                  <td className="p-3 text-right font-medium">₹{calculateSubtotal().toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="p-3 text-right font-medium">
                    GST (18%):
                  </td>
                  <td className="p-3 text-right font-medium">₹{calculateGst().toFixed(2)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="p-3 text-right font-medium">
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
            <div className="flex justify-between items-end">
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
        <PdfGenerator contentRef={invoiceRef} fileName={`Invoice-${Date.now().toString().slice(-6)}`} />
        <Button variant="default" className="bg-purple-600 hover:bg-purple-700" onClick={onEditClick}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit Invoice
        </Button>
      </CardFooter>
    </Card>
  )
}
