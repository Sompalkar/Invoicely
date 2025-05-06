"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

interface Product {
  _id: string
  name: string
  description: string
  price: number
  taxable: boolean
}

interface ProductSelectorProps {
  onSelectProduct: (product: Product) => void
}

export function ProductSelector({ onSelectProduct }: ProductSelectorProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Sample products for demo
  const sampleProducts = [
    { _id: "1", name: "Web Design", description: "Professional website design services", price: 1500, taxable: true },
    { _id: "2", name: "Logo Design", description: "Custom logo design with revisions", price: 500, taxable: true },
    {
      _id: "3",
      name: "Consulting",
      description: "Professional consulting services (hourly)",
      price: 150,
      taxable: true,
    },
    { _id: "4", name: "Development", description: "Software development services", price: 2000, taxable: true },
    { _id: "5", name: "Maintenance", description: "Monthly website maintenance", price: 250, taxable: true },
    { _id: "6", name: "SEO Services", description: "Search engine optimization", price: 800, taxable: true },
    { _id: "7", name: "Content Writing", description: "Professional content creation", price: 300, taxable: true },
    { _id: "8", name: "Hosting (Non-taxable)", description: "Web hosting services", price: 120, taxable: false },
  ]

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        // In a real implementation, we would fetch from the API
        // const data = await productsAPI.getAll()
        // setProducts(data)

        // For demo purposes, we'll use sample data
        setTimeout(() => {
          setProducts(sampleProducts)
          setIsLoading(false)
        }, 500)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch products. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button asChild className="bg-purple-600 hover:bg-purple-700">
          <Link href="/dashboard/products">
            <Plus className="mr-2 h-4 w-4" />
            Add New Product
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <div className="rounded-md border max-h-[400px] overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Taxable</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No products found. Try a different search or add a new product.
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>₹{product.price.toFixed(2)}</TableCell>
                    <TableCell>{product.taxable ? "Yes" : "No"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => onSelectProduct(product)}>
                        Select
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
