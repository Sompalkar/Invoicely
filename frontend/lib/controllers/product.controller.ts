import { type NextRequest, NextResponse } from "next/server"
import { Product } from "@/models/product.model"
import { connectToDatabase } from "@/lib/db"
import { authMiddleware } from "@/lib/auth"

export async function getProducts(req: NextRequest): Promise<NextResponse> {
  await connectToDatabase()

  try {
    // Get user from auth middleware
    const { user, isAuthenticated } = await authMiddleware(req)

    if (!isAuthenticated || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get products for this user
    const products = await Product.find({ userId: user._id }).sort({ createdAt: -1 })

    return NextResponse.json(products)
  } catch (error) {
    console.error("Get products error:", error)
    return NextResponse.json({ message: "Failed to get products" }, { status: 500 })
  }
}

export async function getProduct(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  await connectToDatabase()

  try {
    // Get user from auth middleware
    const { user, isAuthenticated } = await authMiddleware(req)

    if (!isAuthenticated || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Get product
    const product = await Product.findOne({ _id: params.id, userId: user._id })

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Get product error:", error)
    return NextResponse.json({ message: "Failed to get product" }, { status: 500 })
  }
}

export async function createProduct(req: NextRequest): Promise<NextResponse> {
  await connectToDatabase()

  try {
    // Get user from auth middleware
    const { user, isAuthenticated } = await authMiddleware(req)

    if (!isAuthenticated || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { name, description, price, taxable } = await req.json()

    // Validate input
    if (!name || price === undefined) {
      return NextResponse.json({ message: "Name and price are required" }, { status: 400 })
    }

    // Create product
    const product = await Product.create({
      name,
      description,
      price,
      taxable: taxable !== undefined ? taxable : true,
      userId: user._id,
    })

    return NextResponse.json({
      success: true,
      product,
    })
  } catch (error) {
    console.error("Create product error:", error)
    return NextResponse.json({ message: "Failed to create product" }, { status: 500 })
  }
}

export async function updateProduct(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  await connectToDatabase()

  try {
    // Get user from auth middleware
    const { user, isAuthenticated } = await authMiddleware(req)

    if (!isAuthenticated || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const { name, description, price, taxable } = await req.json()

    // Validate input
    if (!name || price === undefined) {
      return NextResponse.json({ message: "Name and price are required" }, { status: 400 })
    }

    // Find and update product
    const product = await Product.findOneAndUpdate(
      { _id: params.id, userId: user._id },
      { name, description, price, taxable },
      { new: true },
    )

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      product,
    })
  } catch (error) {
    console.error("Update product error:", error)
    return NextResponse.json({ message: "Failed to update product" }, { status: 500 })
  }
}

export async function deleteProduct(req: NextRequest, { params }: { params: { id: string } }): Promise<NextResponse> {
  await connectToDatabase()

  try {
    // Get user from auth middleware
    const { user, isAuthenticated } = await authMiddleware(req)

    if (!isAuthenticated || !user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    // Find and delete product
    const product = await Product.findOneAndDelete({ _id: params.id, userId: user._id })

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    })
  } catch (error) {
    console.error("Delete product error:", error)
    return NextResponse.json({ message: "Failed to delete product" }, { status: 500 })
  }
}
