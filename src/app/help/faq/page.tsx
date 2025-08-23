"use client"

import Image from "next/image"

import { motion } from "framer-motion"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/app/components/ui/accordion"
import Navbar from "@/app/components/Navbar"
import { faqData } from "@/app/data/officialContent"

export default function FAQsPage() {
  return (
    <>
      <Navbar />

      <div className="bg-white text-gray-800">
        {/* Hero Section */}
        <div className="relative w-full h-64 md:h-80 lg:h-96">
          <Image
            src={faqData.hero.image}
            alt="FAQs Banner"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[5px] flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
              {faqData.hero.title}
            </h1>
            <p className="text-white text-sm md:text-md max-w-2xl">
              {faqData.hero.subtitle}
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto px-6 py-16">
          <motion.h2
            className="text-3xl font-bold text-center mb-10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Frequently Asked Questions
          </motion.h2>

          <Accordion type="single" collapsible className="space-y-4">
            {faqData.faqs.map((faq, idx) => (
              <AccordionItem
                key={idx}
                value={`item-${idx}`}
                className="border border-gray-200 rounded-sm shadow-sm"
              >
                <AccordionTrigger className="px-4 py-3 text-md font-medium hover:text-blue-500">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-4 py-3 text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>


    </>
  )
}
