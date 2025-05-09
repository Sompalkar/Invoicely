"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Users,
  ShoppingBag,
  BarChart,
  Settings,
  HelpCircle,
  ChevronRight,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Invoices",
    href: "/dashboard/invoices/create",
    icon: FileText,
  },
  {
    title: "Clients",
    href: "/dashboard/clients",
    icon: Users,
  },
  {
    title: "Products",
    href: "/dashboard/products",
    icon: ShoppingBag,
  },

  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    title: "Help",
    href: "/dashboard",
    icon: HelpCircle,
  },
];

export function DashboardNav() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.div
      initial={{ width: 240 }}
      animate={{ width: isCollapsed ? 80 : 240 }}
      className={cn(
        "h-screen sticky top-0 border-r bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm overflow-hidden",
        isCollapsed ? "w-20" : "w-60"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex justify-end p-2">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
          >
            <motion.div
              animate={{ rotate: isCollapsed ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronRight className="h-4 w-4 text-purple-600" />
            </motion.div>
          </button>
        </div>
        <nav className="flex-1 px-2 py-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.title}>
                <Link href={item.href}>
                  <motion.div
                    whileHover={{ x: 5 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-lg transition-colors",
                      pathname === item.href ||
                        pathname.startsWith(`${item.href}/`)
                        ? "bg-gradient-to-r from-purple-500/10 to-violet-500/10 text-purple-700 dark:text-purple-300"
                        : "hover:bg-purple-100 dark:hover:bg-purple-900/30 text-gray-700 dark:text-gray-300"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-5 w-5 mr-3",
                        pathname === item.href ||
                          pathname.startsWith(`${item.href}/`)
                          ? "text-purple-600"
                          : "text-gray-500 dark:text-gray-400"
                      )}
                    />
                    {!isCollapsed && <span>{item.title}</span>}
                  </motion.div>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
      </div>
    </motion.div>
  );
}
