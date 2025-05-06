"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { FileText, Send, CreditCard, BarChart4, Shield, Zap, CheckCircle, Clock, Palette } from "lucide-react"

export function Features() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, amount: 0.2 })

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  const features = [
    {
      icon: <FileText className="h-10 w-10 text-purple-600" />,
      title: "Professional Invoices",
      description: "Create beautiful, customizable invoices with your branding in seconds.",
    },
    {
      icon: <Send className="h-10 w-10 text-purple-600" />,
      title: "Email Delivery",
      description: "Send invoices directly to clients via email with automated reminders.",
    },
    {
      icon: <CreditCard className="h-10 w-10 text-purple-600" />,
      title: "Payment Tracking",
      description: "Track payment status and get notified when clients pay.",
    },
    {
      icon: <BarChart4 className="h-10 w-10 text-purple-600" />,
      title: "Financial Reports",
      description: "Generate detailed reports on revenue, outstanding payments, and more.",
    },
    {
      icon: <Shield className="h-10 w-10 text-purple-600" />,
      title: "Privacy Focused",
      description: "We don't store sensitive invoice details, only the metadata you need.",
    },
    {
      icon: <Zap className="h-10 w-10 text-purple-600" />,
      title: "Fast & Efficient",
      description: "Streamlined workflow to save you time and reduce errors.",
    },
  ]

  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Powerful Features</h2>
          <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to create, send, and track invoices efficiently.
          </p>
        </div>

        <motion.div
          ref={ref}
          variants={container}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={item}
              className="bg-background rounded-xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow"
            >
              <div className="mb-4 rounded-full w-16 h-16 flex items-center justify-center bg-purple-100 dark:bg-purple-900/20">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Enhanced Feature Showcase */}
        <div className="mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <div className="order-2 lg:order-1">
              <h3 className="text-2xl font-bold mb-4">Customizable Invoice Templates</h3>
              <p className="text-lg text-muted-foreground mb-6">
                Create professional invoices that reflect your brand identity with our customizable templates.
              </p>
              <ul className="space-y-3">
                {[
                  "Add your company logo and signature",
                  "Choose from multiple color schemes",
                  "Customize fields and layout",
                  "Save templates for future use",
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 lg:order-2 bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 p-6 rounded-2xl shadow-lg">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-border shadow-sm">
                <div className="absolute inset-0 bg-white dark:bg-gray-800">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-6">
                      <div className="h-10 w-32 bg-purple-200 dark:bg-purple-800/30 rounded-md"></div>
                      <div className="text-2xl font-bold text-purple-600">INVOICE</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Bill To:</div>
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                        <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-1"></div>
                        <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                      <div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-sm text-muted-foreground">Invoice #:</div>
                          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          <div className="text-sm text-muted-foreground">Date:</div>
                          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                          <div className="text-sm text-muted-foreground">Due Date:</div>
                          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                      </div>
                    </div>
                    <div className="mb-4">
                      <div className="grid grid-cols-12 gap-2 bg-purple-100 dark:bg-purple-900/30 p-2 rounded-t-md">
                        <div className="col-span-6 text-sm font-medium">Description</div>
                        <div className="col-span-2 text-sm font-medium">Qty</div>
                        <div className="col-span-2 text-sm font-medium">Price</div>
                        <div className="col-span-2 text-sm font-medium">Amount</div>
                      </div>
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="grid grid-cols-12 gap-2 p-2 border-b">
                          <div className="col-span-6 h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                          <div className="col-span-2 h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                          <div className="col-span-2 h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                          <div className="col-span-2 h-4 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end">
                      <div className="w-1/3">
                        <div className="flex justify-between mb-2">
                          <div className="text-sm font-medium">Subtotal:</div>
                          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                        <div className="flex justify-between mb-2">
                          <div className="text-sm font-medium">Tax:</div>
                          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                        <div className="flex justify-between font-bold">
                          <div>Total:</div>
                          <div className="h-5 w-24 bg-purple-200 dark:bg-purple-800/30 rounded"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-24"
          >
            <div className="bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 p-6 rounded-2xl shadow-lg">
              <div className="relative aspect-video rounded-lg overflow-hidden border border-border shadow-sm">
                <div className="absolute inset-0 bg-white dark:bg-gray-800">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-xl font-bold">Payment Analytics</div>
                      <div className="flex space-x-2">
                        <div className="h-8 w-20 bg-purple-200 dark:bg-purple-800/30 rounded-md"></div>
                        <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mb-6">
                      {[
                        { label: "Total", color: "bg-purple-200 dark:bg-purple-800/30" },
                        { label: "Paid", color: "bg-green-200 dark:bg-green-800/30" },
                        { label: "Pending", color: "bg-yellow-200 dark:bg-yellow-800/30" },
                        { label: "Overdue", color: "bg-red-200 dark:bg-red-800/30" },
                      ].map((item, i) => (
                        <div key={i} className={`p-4 rounded-lg ${item.color}`}>
                          <div className="text-sm text-muted-foreground mb-1">{item.label}</div>
                          <div className="text-xl font-bold">$12,345</div>
                        </div>
                      ))}
                    </div>
                    <div className="h-40 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg relative">
                      <div className="absolute bottom-0 left-0 w-full h-full flex items-end">
                        <div className="w-1/12 h-[20%] bg-purple-300 dark:bg-purple-700 mx-1"></div>
                        <div className="w-1/12 h-[30%] bg-purple-400 dark:bg-purple-600 mx-1"></div>
                        <div className="w-1/12 h-[25%] bg-purple-500 dark:bg-purple-500 mx-1"></div>
                        <div className="w-1/12 h-[40%] bg-purple-600 dark:bg-purple-400 mx-1"></div>
                        <div className="w-1/12 h-[60%] bg-purple-700 dark:bg-purple-300 mx-1"></div>
                        <div className="w-1/12 h-[45%] bg-purple-600 dark:bg-purple-400 mx-1"></div>
                        <div className="w-1/12 h-[70%] bg-purple-500 dark:bg-purple-500 mx-1"></div>
                        <div className="w-1/12 h-[80%] bg-purple-400 dark:bg-purple-600 mx-1"></div>
                        <div className="w-1/12 h-[65%] bg-purple-300 dark:bg-purple-700 mx-1"></div>
                        <div className="w-1/12 h-[90%] bg-purple-400 dark:bg-purple-600 mx-1"></div>
                        <div className="w-1/12 h-[75%] bg-purple-500 dark:bg-purple-500 mx-1"></div>
                        <div className="w-1/12 h-[50%] bg-purple-600 dark:bg-purple-400 mx-1"></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-24 bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                        <div className="text-sm font-medium mb-2">Payment Methods</div>
                        <div className="flex items-center space-x-1">
                          <div className="h-12 w-12 rounded-full bg-purple-200 dark:bg-purple-800/30"></div>
                          <div className="h-12 w-12 rounded-full bg-blue-200 dark:bg-blue-800/30"></div>
                          <div className="h-12 w-12 rounded-full bg-green-200 dark:bg-green-800/30"></div>
                        </div>
                      </div>
                      <div className="h-24 bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                        <div className="text-sm font-medium mb-2">Top Clients</div>
                        <div className="space-y-2">
                          <div className="h-3 w-full bg-gray-200 dark:bg-gray-600 rounded-full">
                            <div className="h-3 w-3/4 bg-purple-500 rounded-full"></div>
                          </div>
                          <div className="h-3 w-full bg-gray-200 dark:bg-gray-600 rounded-full">
                            <div className="h-3 w-1/2 bg-purple-500 rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-4">Real-time Analytics & Reporting</h3>
              <p className="text-lg text-muted-foreground mb-6">
                Get valuable insights into your business with comprehensive analytics and reporting tools.
              </p>
              <ul className="space-y-3">
                {[
                  "Track payment status in real-time",
                  "Visualize revenue trends with interactive charts",
                  "Identify top clients and payment patterns",
                  "Export reports for accounting and tax purposes",
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <BarChart4 className="h-5 w-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-24"
          >
            <div className="order-2 lg:order-1">
              <h3 className="text-2xl font-bold mb-4">Privacy-First Approach</h3>
              <p className="text-lg text-muted-foreground mb-6">
                We prioritize your data privacy by minimizing storage of sensitive information.
              </p>
              <ul className="space-y-3">
                {[
                  "No storage of detailed invoice line items",
                  "Only essential metadata is saved in the database",
                  "Temporary PDF generation with immediate cleanup",
                  "Secure email delivery with encryption",
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <Shield className="h-5 w-5 text-purple-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="order-1 lg:order-2 bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 p-6 rounded-2xl shadow-lg">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-border shadow-sm">
                <div className="absolute inset-0 bg-white dark:bg-gray-800 p-6">
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
                        <Shield className="h-10 w-10 text-purple-600" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Privacy-First Design</h3>
                      <p className="text-muted-foreground mb-6 max-w-md">
                        Your sensitive data is never stored permanently. We only keep what's necessary for your business
                        operations.
                      </p>
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <Clock className="h-5 w-5 text-purple-500 mr-3" />
                          <div className="text-sm">Temporary processing only</div>
                        </div>
                        <div className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <Palette className="h-5 w-5 text-purple-500 mr-3" />
                          <div className="text-sm">Minimal data storage</div>
                        </div>
                        <div className="flex items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-purple-500 mr-3" />
                          <div className="text-sm">Compliant with privacy regulations</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
