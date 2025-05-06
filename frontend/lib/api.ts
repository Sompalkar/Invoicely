import { toast } from "@/components/ui/use-toast"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Helper function for API requests
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Get token from localStorage if available
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  try {
    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers,
    })

    // Handle non-2xx responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.message || `Error: ${response.status} ${response.statusText}`
      throw new Error(errorMessage)
    }

    // Return null for 204 No Content
    if (response.status === 204) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error("API request failed:", error)
    throw error
  }
}

// Auth API
export const authAPI = {
  register: async (userData: { username: string; email: string; password: string }) => {
    return fetchWithAuth("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  },

  login: async (credentials: { email: string; password: string }) => {
    return fetchWithAuth("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  },

  getCurrentUser: async () => {
    return fetchWithAuth("/auth/me")
  },
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
    lineItems: Array<{ item?: string; description: string; quantity: number; price: number }>
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

// Error handling wrapper for API calls
export async function apiHandler<T>(
  apiCall: () => Promise<T>,
  {
    successMessage,
    errorMessage = "An error occurred. Please try again.",
    showSuccessToast = true,
    showErrorToast = true,
  }: {
    successMessage?: string
    errorMessage?: string
    showSuccessToast?: boolean
    showErrorToast?: boolean
  } = {},
): Promise<T | null> {
  try {
    const result = await apiCall()
    if (successMessage && showSuccessToast) {
      toast({
        title: "Success",
        description: successMessage,
        variant: "default",
      })
    }
    return result
  } catch (error) {
    const message = error instanceof Error ? error.message : errorMessage
    if (showErrorToast) {
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    }
    return null
  }
}
