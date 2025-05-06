"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronDown, Sparkles, Zap, FileText } from "lucide-react"
import { motion } from "framer-motion"
import { useRef, useState } from "react"
import { useInView } from "framer-motion"

export function HeroSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.3 })
  const [isHovered, setIsHovered] = useState(false)

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  }

  return (
    <section className="relative py-20 md:py-32 overflow-hidden bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-background">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-80 h-80 bg-violet-400/10 dark:bg-violet-600/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-400/10 dark:bg-indigo-600/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
      </div>

      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02]" />

      <div className="container px-4 md:px-6 relative z-10">
        <motion.div
          ref={ref}
          variants={container}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="flex flex-col items-center text-center space-y-8 md:space-y-12"
        >
          <motion.div variants={item} className="space-y-4 max-w-3xl">
            <div className="flex justify-center mb-6">
              <motion.div
                className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-sm font-medium"
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                <span>Open Source Invoicing</span>
              </motion.div>
            </div>

            <motion.h1
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter gradient-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Simplify Your{" "}
              <span className="relative inline-block dark:text-purple-300 text-purple-800">
                Invoicing
                <motion.div
                  className="absolute -bottom-2 left-0 h-2 w-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.8, delay: 1 }}
                />
              </span>{" "}
              Process
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Create professional invoices, send them via email, and track payments with our privacy-focused,
              open-source solution.
            </motion.p>
          </motion.div>

          <motion.div variants={item} className="flex flex-col sm:flex-row gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                asChild
                size="lg"
                className="font-medium rounded-full px-8 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 shadow-lg shadow-purple-500/20"
              >
                <Link href="/register">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button asChild variant="outline" size="lg" className="font-medium rounded-full px-8 border-2">
                <Link href="#features">
                  <Zap className="mr-2 h-4 w-4" />
                  See Features
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            variants={item}
            className="relative w-full max-w-5xl mx-auto mt-8 md:mt-16"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-violet-500/20 rounded-xl blur-xl"
              animate={{
                scale: isHovered ? 1.05 : 1,
              }}
              transition={{ duration: 0.5 }}
            />

            <motion.div
              className="relative perspective-card"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="perspective-card-inner bg-background/80 backdrop-blur-sm border border-border rounded-xl shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-violet-500" />

                <div className="p-4 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded-full bg-red-500" />
                      <div className="h-3 w-3 rounded-full bg-yellow-500" />
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5 text-purple-500" />
                      <span className="font-medium">invoicely.app</span>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">Invoice Dashboard</h3>
                        <p className="text-muted-foreground text-sm">
                          Track and manage all your invoices with our intuitive dashboard.
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <div className="flex items-center px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-xs font-medium">
                          <span>$5.2K</span>
                          <span className="ml-1">Revenue</span>
                        </div>
                        <div className="flex items-center px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300 rounded-full text-xs font-medium">
                          <span>24</span>
                          <span className="ml-1">Invoices</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-background rounded-lg p-4 border border-border/50 shadow-sm">
                          <div className="flex justify-between items-center mb-3">
                            <div className="h-2 w-20 bg-purple-200 dark:bg-purple-800/30 rounded-full" />
                            <div className="h-6 w-6 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                              <div className="h-3 w-3 rounded-full bg-violet-500" />
                            </div>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full mb-2" />
                          <div className="h-2 w-2/3 bg-muted rounded-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div variants={item} className="flex flex-wrap justify-center gap-8 mt-12">
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center text-white">
                <span className="text-xl font-bold">5K+</span>
              </div>
              <span className="text-muted-foreground">Invoices Created</span>
            </motion.div>
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center text-white">
                <span className="text-xl font-bold">10K+</span>
              </div>
              <span className="text-muted-foreground">Active Users</span>
            </motion.div>
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center text-white">
                <span className="text-xl font-bold">99.9%</span>
              </div>
              <span className="text-muted-foreground">Uptime</span>
            </motion.div>
          </motion.div>

          <motion.div
            variants={item}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden md:block"
          >
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              <ChevronDown className="h-6 w-6" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
