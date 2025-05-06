"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardNav } from "@/components/dashboard-nav"
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
import { Plus, MoreHorizontal, Search, Edit, Trash, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface Product {
  _id: string
  name: string
  description: string
  price: number
  taxable: boolean
}

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  // Form state
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState<number>(0)
  const [taxable, setTaxable] = useState(true)

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
    fetchProducts()
  }, [])

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

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setName(product.name)
      setDescription(product.description)
      setPrice(product.price)
      setTaxable(product.taxable)
    } else {
      setEditingProduct(null)
      setName("")
      setDescription("")
      setPrice(0)
      setTaxable(true)
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingProduct(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const productData = {
      name,
      description,
      price,
      taxable,
    }

    try {
      if (editingProduct) {
        // In a real implementation, we would update via API
        // await productsAPI.update(editingProduct._id, productData)

        // For demo purposes, update the local state
        setProducts(products.map((p) => (p._id === editingProduct._id ? { ...p, ...productData } : p)))

        toast({
          title: "Success",
          description: "Product updated successfully",
        })
      } else {
        // In a real implementation, we would create via API
        // const result = await productsAPI.create(productData)

        // For demo purposes, add to the local state with a fake ID
        const newProduct = {
          _id: `temp-${Date.now()}`,
          ...productData,
        }

        setProducts([...products, newProduct])

        toast({
          title: "Success",
          description: "Product created successfully",
        })
      }
      handleCloseDialog()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      try {
        // In a real implementation, we would delete via API
        // await productsAPI.delete(id)

        // For demo purposes, update the local state
        setProducts(products.filter((p) => p._id !== id))

        toast({
          title: "Success",
          description: "Product deleted successfully",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete product. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1">
        <DashboardNav />
        <main className="flex-1 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Products</h1>
              <p className="text-muted-foreground">Manage your product catalog</p>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8 w-full sm:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
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
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Taxable</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                        <TableCell>
                          <Switch checked={product.taxable} disabled />
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
                              <DropdownMenuItem onClick={() => handleOpenDialog(product)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push("/dashboard/invoices/create")}>
                                <FileText className="mr-2 h-4 w-4" />
                                Add to Invoice
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteProduct(product._id)}
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
                <DialogDescription>
                  {editingProduct
                    ? "Update the product's information below."
                    : "Fill in the product details to add it to your catalog."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Web Design"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Professional website design services"
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      placeholder="1500"
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="taxable" checked={taxable} onCheckedChange={setTaxable} />
                    <Label htmlFor="taxable">Taxable (GST applicable)</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" type="button" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <LoadingSpinner size="sm" className="mr-2" />
                        {editingProduct ? "Updating..." : "Creating..."}
                      </span>
                    ) : (
                      <span>{editingProduct ? "Update Product" : "Add Product"}</span>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  )
}
