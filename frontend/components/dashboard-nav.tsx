"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { FileText, Users, BarChart4, Settings, HelpCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

export function DashboardNav() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const routes = [
    {
      href: "/dashboard",
      icon: BarChart4,
      title: "Dashboard",
    },
    {
      href: "/dashboard/invoices",
      icon: FileText,
      title: "Invoices",
    },
    {
      href: "/dashboard/clients",
      icon: Users,
      title: "Clients",
    },
    {
      href: "/dashboard/reports",
      icon: BarChart4,
      title: "Reports",
    },
    {
      href: "/dashboard/settings",
      icon: Settings,
      title: "Settings",
    },
  ]

  return (
    <div
      className={cn(
        "group border-r bg-muted/40 transition-all duration-300 ease-in-out relative",
        isCollapsed ? "w-[70px]" : "w-[240px]",
      )}
    >
      <div className="absolute right-[-12px] top-6 z-10">
        <Button
          variant="outline"
          size="icon"
          className="h-6 w-6 rounded-full bg-background"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          <span className="sr-only">Toggle navigation</span>
        </Button>
      </div>
      <nav className="flex flex-col gap-2 p-4">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
              pathname === route.href && "bg-muted text-foreground",
              isCollapsed && "justify-center px-2",
            )}
          >
            <route.icon className={cn("h-5 w-5", pathname === route.href && "text-purple-600")} />
            {!isCollapsed && <span>{route.title}</span>}
          </Link>
        ))}
      </nav>
      <div className="mt-auto p-4">
        <div className={cn("rounded-lg bg-muted p-4", isCollapsed && "flex justify-center p-2")}>
          {!isCollapsed ? (
            <>
              <h4 className="mb-2 font-medium">Need help?</h4>
              <p className="mb-4 text-sm text-muted-foreground">Check our documentation or contact support</p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/help">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  Help Center
                </Link>
              </Button>
            </>
          ) : (
            <HelpCircle className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </div>
    </div>
  )
}
