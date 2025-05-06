"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { FileText, Bell, Menu, X, Plus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

export function DashboardHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleCreateInvoice = () => {
    router.push("/dashboard/invoices/create")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-purple-600" />
            <span className="font-bold text-xl">Invoicely</span>
          </Link>
          <div className="hidden md:flex items-center ml-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search..." className="w-64 pl-8 bg-muted/50" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="default"
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 hidden md:flex"
            onClick={handleCreateInvoice}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-purple-600" />
            <span className="sr-only">Notifications</span>
          </Button>
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                  <AvatarFallback>{user?.username?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user?.username}</span>
                  <span className="text-xs text-muted-foreground">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t p-4 bg-background">
          <div className="flex flex-col space-y-3">
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search..." className="w-full pl-8 bg-muted/50" />
            </div>
            <Button
              variant="default"
              className="bg-purple-600 hover:bg-purple-700 w-full"
              onClick={handleCreateInvoice}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={() => router.push("/dashboard")}>
              Dashboard
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push("/dashboard/invoices")}
            >
              Invoices
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push("/dashboard/clients")}
            >
              Clients
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push("/dashboard/settings")}
            >
              Settings
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
