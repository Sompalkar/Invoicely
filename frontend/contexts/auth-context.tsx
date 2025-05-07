// "use client"

// import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
// import { useRouter } from "next/navigation"
// import { authAPI } from "@/lib/api"
// import { LoadingSpinner } from "@/components/loading-spinner"

// interface User {
//   id: string
//   username: string
//   email: string
// }

// interface AuthContextType {
//   user: User | null
//   isLoading: boolean
//   isAuthenticated: boolean
//   login: (email: string, password: string) => Promise<boolean>
//   register: (username: string, email: string, password: string) => Promise<boolean>
//   logout: () => void
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined)

// export function AuthProvider({ children }: { children: ReactNode }) {
//   const [user, setUser] = useState<User | null>(null)
//   const [isLoading, setIsLoading] = useState(true)
//   const router = useRouter()

//   useEffect(() => {
//     // Check if user is logged in on initial load
//     const checkAuthStatus = async () => {
//       const token = localStorage.getItem("token")
//       if (!token) {
//         setIsLoading(false)
//         return
//       }

//       try {
//         const userData = await authAPI.getCurrentUser()
//         setUser(userData)
//       } catch (error) {
//         // Token is invalid or expired
//         localStorage.removeItem("token")
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     checkAuthStatus()
//   }, [])

//   const login = async (email: string, password: string) => {
//     setIsLoading(true)
//     try {
//       const response = await authAPI.login({ email, password })
//       localStorage.setItem("token", response.token)
//       setUser(response.user)
//       return true
//     } catch (error) {
//       return false
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const register = async (username: string, email: string, password: string) => {
//     setIsLoading(true)
//     try {
//       const response = await authAPI.register({ username, email, password })
//       localStorage.setItem("token", response.token)
//       setUser(response.user)
//       return true
//     } catch (error) {
//       return false
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const logout = () => {
//     localStorage.removeItem("token")
//     setUser(null)
//     router.push("/login")
//   }

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         isLoading,
//         isAuthenticated: !!user,
//         login,
//         register,
//         logout,
//       }}
//     >
//       {isLoading ? (
//         <div className="flex h-screen items-center justify-center">
//           <LoadingSpinner size="lg" />
//         </div>
//       ) : (
//         children
//       )}
//     </AuthContext.Provider>
//   )
// }

// export function useAuth() {
//   const context = useContext(AuthContext)
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider")
//   }
//   return context
// }








"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authAPI } from "@/lib/api"
import { LoadingSpinner } from "@/components/loading-spinner"

interface User {
  id: string
  username: string
  email: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (username: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // On mount, fetch current user (cookie auth)
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const userData = await authAPI.getCurrentUser()
        setUser(userData)
      } catch {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    checkAuthStatus()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await authAPI.login({ email, password })
      // HTTP-only cookie set by backend
      setUser(response.user)
      return true
    } catch {
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await authAPI.register({ username, email, password })
      // HTTP-only cookie set by backend
      setUser(response.user)
      return true
    } catch {
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    await authAPI.logout()
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, register, logout }}
    >
      {isLoading ? (
        <div className="flex h-screen items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}