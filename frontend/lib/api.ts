import { toast } from "@/components/ui/use-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Helper function for API requests
 




async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${url}`, {
    credentials: 'include',        // send/receive cookies
    headers: { "Content-Type": "application/json" },
    ...options,
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.message || `${response.status} ${response.statusText}`)
  }

  // Return null for 204 No Content
  return response.status === 204 ? null : response.json()
}





export const authAPI = {
  register: (data: { username: string; email: string; password: string }) =>
    fetchWithAuth('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    fetchWithAuth('/auth/login', { method: 'POST', body: JSON.stringify(data) }),

  logout: () =>
    fetchWithAuth('/auth/logout', { method: 'POST' }),

  getCurrentUser: () =>
    fetchWithAuth('/auth/me')
}




































// Clients API
export const clientsAPI = {
  getAll: async () => {
    return fetchWithAuth("/clients")
  },

  getById: async (id: string) => {
    return fetchWithAuth(`/clients/${id}`)
  },

  create: async (clientData: { name: string; email: string; address?: string; phone?: string }) => {
    return fetchWithAuth("/clients", {
      method: "POST",
      body: JSON.stringify(clientData),
    })
  },

  update: async (id: string, clientData: { name: string; email: string; address?: string; phone?: string }) => {
    return fetchWithAuth(`/clients/${id}`, {
      method: "PUT",
      body: JSON.stringify(clientData),
    })
  },

  delete: async (id: string) => {
    return fetchWithAuth(`/clients/${id}`, {
      method: "DELETE",
    })
  },
}

// Products API
export const productsAPI = {
  getAll: async () => {
    return fetchWithAuth("/products")
  },

  getById: async (id: string) => {
    return fetchWithAuth(`/products/${id}`)
  },

  create: async (productData: { name: string; description: string; price: number; taxable: boolean }) => {
    return fetchWithAuth("/products", {
      method: "POST",
      body: JSON.stringify(productData),
    })
  },

  update: async (id: string, productData: { name: string; description: string; price: number; taxable: boolean }) => {
    return fetchWithAuth(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    })
  },

  delete: async (id: string) => {
    return fetchWithAuth(`/products/${id}`, {
      method: "DELETE",
    })
  },
}

// Invoices API
export const invoicesAPI = {
  getAll: async (filters = {}) => {
    const queryParams = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value) queryParams.append(key, String(value))
    })
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""
    return fetchWithAuth(`/invoices${queryString}`)
  },

  getById: async (id: string) => {
    return fetchWithAuth(`/invoices/${id}`)
  },

  create: async (invoiceData: {
    clientId: string
    totalAmount: number
    dueDate: string
    lineItems: Array<{ description: string; quantity: number; price: number; taxable: boolean }>
    taxInfo?: {
      cgstRate: number
      sgstRate: number
      cgstAmount: number
      sgstAmount: number
      taxableAmount: number
    }
  }) => {
    return fetchWithAuth("/invoices", {
      method: "POST",
      body: JSON.stringify(invoiceData),
    })
  },

  send: async (id: string) => {
    return fetchWithAuth(`/invoices/${id}/send`, {
      method: "POST",
    })
  },

  updateStatus: async (id: string, status: "draft" | "sent" | "paid" | "overdue" | "cancelled") => {
    return fetchWithAuth(`/invoices/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    })
  },
}

// Reports API
export const reportsAPI = {
  getRevenue: async (startDate?: string, endDate?: string) => {
    const queryParams = new URLSearchParams()
    if (startDate) queryParams.append("startDate", startDate)
    if (endDate) queryParams.append("endDate", endDate)
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : ""
    return fetchWithAuth(`/reports/revenue${queryString}`)
  },

  getOutstanding: async () => {
    return fetchWithAuth("/reports/outstanding")
  },

  getStatusSummary: async () => {
    return fetchWithAuth("/reports/status-summary")
  },
}

 

export async function apiHandler<T>(
  apiCall: () => Promise<T>,
  { successMessage, errorMessage = "An error occurred", showSuccessToast = true, showErrorToast = true } = {}
): Promise<T | null> {
  try {
    const result = await apiCall()
    if (successMessage && showSuccessToast) {
      toast({ title: 'Success', description: successMessage })
    }
    return result
  } catch (error:any) {
    if (showErrorToast) {
      toast({ title: 'Error', description: error.message || errorMessage, variant: 'destructive' })
    }
    return null
  }
}