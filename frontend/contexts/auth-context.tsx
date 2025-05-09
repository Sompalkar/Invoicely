"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authAPI, apiHandler } from "@/lib/api"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useAuth0 } from "@auth0/auth0-react"

interface User {
  id: string
  username: string
  email: string
  picture?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (username: string, email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  loginWithGoogle: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const {
    isAuthenticated: isAuth0Authenticated,
    user: auth0User,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
    isLoading: isAuth0Loading,
  } = useAuth0()

  // On mount, fetch current user (cookie auth or Auth0)
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // If Auth0 is still loading, wait
        if (isAuth0Loading) return

        // If Auth0 is authenticated, use that user info
        if (isAuth0Authenticated && auth0User) {
          try {
            // Get the access token
            const token = await getAccessTokenSilently()

            // Set the token as a cookie via API call
            await fetch("/api/auth/set-auth0-cookie", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ token }),
            })

            // Try to get user from our backend
            try {
              const userData = await apiHandler(() => authAPI.getCurrentUser(), {
                showErrorToast: false,
                showSuccessToast: false,
              })
              setUser(userData)
            } catch (error) {
              // If user not in database yet, create a user object from Auth0 data
              setUser({
                id: auth0User.sub || "",
                username: auth0User.name || auth0User.nickname || auth0User.email?.split("@")[0] || "",
                email: auth0User.email || "",
                picture: auth0User.picture,
              })
            }
          } catch (error) {
            console.error("Error getting Auth0 token:", error)
            setUser(null)
          }
        } else {
          // Otherwise try cookie-based auth
          try {
            const userData = await apiHandler(() => authAPI.getCurrentUser(), {
              showErrorToast: false,
              showSuccessToast: false,
            })
            setUser(userData)
          } catch (error) {
            // Handle error silently - user is not authenticated
            setUser(null)
          }
        }
      } catch (error) {
        console.error("Auth check error:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()
  }, [isAuth0Authenticated, auth0User, isAuth0Loading, getAccessTokenSilently])

  const loginWithGoogle = async () => {
    try {
      await loginWithRedirect({
        appState: {
          returnTo: "/dashboard",
        },
      })
    } catch (error) {
      console.error("Google login error:", error)
      throw error
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Traditional login
      const response = await apiHandler(() => authAPI.login({ email, password }), {
        showSuccessToast: false,
      })

      if (response) {
        setUser(response.user)
        router.push("/dashboard")
        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      // Traditional registration
      const response = await apiHandler(() => authAPI.register({ username, email, password }), {
        showSuccessToast: false,
      })

      if (response) {
        setUser(response.user)
        router.push("/dashboard")
        return true
      }
      return false
    } catch (error) {
      console.error("Registration error:", error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    // Clear all cookies first
    await fetch("/api/auth/clear-all-cookies", {
      method: "POST",
    })

    // Then handle Auth0 logout if needed
    if (isAuth0Authenticated) {
      auth0Logout({
        logoutParams: {
          returnTo: window.location.origin,
        },
      })
    } else {
      // Traditional logout
      try {
        await apiHandler(() => authAPI.logout(), {
          successMessage: "Logged out successfully",
          showErrorToast: false,
        })
      } catch (error) {
        console.error("Logout error:", error)
      }
    }

    // Clear user state
    setUser(null)

    // Force a hard refresh to clear any cached state
    window.location.href = "/"
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user || isAuth0Authenticated,
        login,
        register,
        logout,
        loginWithGoogle,
      }}
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
