"use client"

import type React from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { Auth0Provider } from "@auth0/auth0-react"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"

export function Providers({ children }: { children: React.ReactNode }) {
  // Get the Auth0 configuration from environment variables
  const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN || "opstechie.au.auth0.com"
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || "sdp48834i3WEUb33qtrCupEGyZ6YOqn7"
  const audience = process.env.NEXT_PUBLIC_AUTH0_AUDIENCE || "http://localhost:5000"

  // Get the redirect URI - this must match what's in Auth0 dashboard
  const redirectUri = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience: audience,
        scope: "openid profile email",
      }}
      useRefreshTokens={true}
      cacheLocation="localstorage"
      onRedirectCallback={(appState) => {
        // Handle redirect after login
        window.history.replaceState({}, document.title, appState?.returnTo || window.location.pathname)
      }}
    >
      <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </AuthProvider>
    </Auth0Provider>
  )
}
