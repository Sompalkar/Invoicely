"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FAQ() {
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

  const faqs = [
    {
      question: "How does Invoicely protect my data?",
      answer:
        "Invoicely is designed with privacy in mind. We don't store detailed invoice data (line items, descriptions, etc.) in our database. Only metadata like invoice ID, total amount, and status are stored. This minimizes the risk of sensitive data exposure.",
    },
    {
      question: "Can I customize my invoice templates?",
      answer:
        "Yes! Invoicely offers customizable templates where you can add your logo, change colors, and adjust layouts to match your brand identity.",
    },
    {
      question: "How do I track payments?",
      answer:
        "You can manually update the status of invoices from 'sent' to 'paid' in your dashboard. The system will track payment history and generate reports based on this data.",
    },
    {
      question: "Is Invoicely really open-source?",
      answer:
        "Yes, Invoicely is fully open-source under the MIT license. You can view, modify, and contribute to the code on GitHub. This ensures transparency and allows the community to help improve the platform.",
    },
    {
      question: "Can I integrate Invoicely with other tools?",
      answer:
        "Our Enterprise plan offers API access for custom integrations with your existing tools and workflows. For specific integration needs, please contact our sales team.",
    },
  ]

  return (
    <section id="faq" className="py-20 bg-background">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Frequently Asked Questions</h2>
          <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">
            Find answers to common questions about Invoicely.
          </p>
        </div>

        <motion.div
          ref={ref}
          variants={container}
          initial="hidden"
          animate={isInView ? "show" : "hidden"}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <motion.div key={index} variants={item}>
                <AccordionItem value={`item-${index}`}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
