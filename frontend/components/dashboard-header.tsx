"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { FileText, Bell, Search, LogOut, User, Settings, Menu } from "lucide-react"
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
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { motion } from "framer-motion"

export function DashboardHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden mr-2 hover:bg-purple-100 dark:hover:bg-purple-900/30"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <Menu className="h-5 w-5 text-purple-600" />
          </Button>
          <Link href="/dashboard" className="flex items-center gap-2">
            <motion.div whileHover={{ rotate: 5 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
              <FileText className="h-6 w-6 text-purple-600" />
            </motion.div>
            <motion.span
              className="font-bold text-xl bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              Invoicely
            </motion.span>
          </Link>
          <div className="hidden md:flex items-center ml-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-64 pl-8 bg-muted/30 border-purple-100 dark:border-purple-900/30 focus-visible:ring-purple-500 transition-all duration-300 focus:w-80"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="ghost" size="icon" className="relative hover:bg-purple-100 dark:hover:bg-purple-900/30">
              <Bell className="h-5 w-5 text-purple-600" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-purple-600" />
              <span className="sr-only">Notifications</span>
            </Button>
          </motion.div>
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/30"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Avatar className="h-8 w-8 border-2 border-purple-200 dark:border-purple-800">
                    {user?.picture ? (
                      <AvatarImage src={user.picture || "/placeholder.svg"} alt={user?.username || "User"} />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-600 text-white">
                        {user?.username?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </motion.div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-purple-100 dark:border-purple-800/30">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.username || "User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email || "No email"}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800">
          <div className="p-4">
            <Input
              type="search"
              placeholder="Search..."
              className="w-full bg-muted/30 border-purple-100 dark:border-purple-900/30 focus-visible:ring-purple-500"
              prefix={<Search className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
        </div>
      )}
    </header>
  )
}
