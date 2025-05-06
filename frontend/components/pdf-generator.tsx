"use client"

import type React from "react"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface PdfGeneratorProps {
  contentRef: React.RefObject<HTMLDivElement>
  fileName?: string
}

export function PdfGenerator({ contentRef, fileName = "invoice" }: PdfGeneratorProps) {
  const generatePdf = async () => {
    if (!contentRef.current) return

    try {
      const canvas = await html2canvas(contentRef.current, {
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
      pdf.save(`${fileName}.pdf`)

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
    <Button variant="outline" onClick={generatePdf}>
      <Download className="mr-2 h-4 w-4" />
      Download PDF
    </Button>
  )
}
