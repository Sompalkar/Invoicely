import axios from "axios"
import { toast } from "@/components/ui/use-toast"

// Create axios instance
const api = axios.create({
  withCredentials: true, // Important for cookies
})

// API handler with error handling and toast notifications
export const apiHandler = async <T>(
  apiCall: () => Promise<T>,
  options: {
    successMessage?: string
    errorMessage?: string
    showSuccessToast?: boolean
    showErrorToast?: boolean
} =
{
}
): Promise<T> =>
{
  const { successMessage, errorMessage = "An error occurred", showSuccessToast = true, showErrorToast = true } = options

  try {
    const response = await apiCall()

    if (successMessage && showSuccessToast) {
      toast({
        title: "Success",
        description: successMessage,
      })
    }

    return response
  } catch (error: any) {
    const message = error.response?.data?.message || errorMessage

    if (showErrorToast) {
      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      })
    }

    throw error
  }
}

// Auth API
export const authAPI = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post("/api/auth/register", data).then((res) => res.data),

  login: (data: { email: string; password: string }) => api.post("/api/auth/login", data).then((res) => res.data),

  logout: () => api.post("/api/auth/logout").then((res) => res.data),

  getCurrentUser: () => api.get("/api/auth/me").then((res) => res.data),

  updateProfile: (data: { username?: string; email?: string }) =>
    api.put("/api/auth/profile", data).then((res) => res.data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put("/api/auth/password", data).then((res) => res.data),
}

// Clients API
export const clientsAPI = {
  getAll: () => api.get("/api/clients").then((res) => res.data),

  getById: (id: string) => api.get(`/api/clients/${id}`).then((res) => res.data),

  create: (data: any) => api.post("/api/clients", data).then((res) => res.data),

  update: (id: string, data: any) => api.put(`/api/clients/${id}`, data).then((res) => res.data),

  delete: (id: string) => api.delete(`/api/clients/${id}`).then((res) => res.data),
}

// Invoices API
export const invoicesAPI = {
  getAll: () => api.get("/api/invoices").then((res) => res.data),

  getById: (id: string) => api.get(`/api/invoices/${id}`).then((res) => res.data),

  create: (data: any) => api.post("/api/invoices", data).then((res) => res.data),

  update: (id: string, data: any) => api.put(`/api/invoices/${id}`, data).then((res) => res.data),

  delete: (id: string) => api.delete(`/api/invoices/${id}`).then((res) => res.data),
}

// Products API
export const productsAPI = {
  getAll: () => api.get("/api/products").then((res) => res.data),

  getById: (id: string) => api.get(`/api/products/${id}`).then((res) => res.data),

  create: (data: any) => api.post("/api/products", data).then((res) => res.data),

  update: (id: string, data: any) => api.put(`/api/products/${id}`, data).then((res) => res.data),

  delete: (id: string) => api.delete(`/api/products/${id}`).then((res) => res.data),
}

export default api
