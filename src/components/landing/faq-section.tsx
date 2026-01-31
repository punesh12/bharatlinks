"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What is BharatLinks?",
    answer:
      "BharatLinks is a smart link management platform designed for Indian businesses. It helps you create short links that open directly in apps like WhatsApp, UPI payment apps, and more. Track every click, capture leads, and accept UPI payments seamlessly.",
  },
  {
    question: "Is there a free plan?",
    answer:
      "Yes! We offer a Free Forever plan that includes 50 links per month, basic analytics, QR codes, UTM templates, and tags & search. No credit card required to get started.",
  },
  {
    question: "How do UPI Express links work?",
    answer:
      "UPI Express links allow you to create payment links that open directly in UPI apps like PhonePe, Google Pay, Paytm, etc. When users click your link, it automatically opens their preferred UPI app with pre-filled payment details, making transactions seamless.",
  },
  {
    question: "Can I customize my short links?",
    answer:
      "Yes! With our Starter and Pro plans, you can use custom domains for your short links. This allows you to create branded links like yourbrand.com/offer instead of generic short URLs.",
  },
  {
    question: "What analytics do you provide?",
    answer:
      "Our analytics include click counts, geographic location data, device information, referral sources, and campaign tracking. Pro plans include advanced analytics with unlimited data retention, while free plans include basic click tracking with 7 days retention.",
  },
  {
    question: "Can I use QR codes with my links?",
    answer:
      "Absolutely! All plans include QR code generation. With Starter and Pro plans, you can customize your QR codes with your branding. The best part? You can update the destination URL anytime without needing to reprint the QR code.",
  },
  {
    question: "Do you support team collaboration?",
    answer:
      "Yes! Pro plans include support for up to 3 team members, allowing you to collaborate on link management. Organization plans offer unlimited team members with advanced features like SSO support.",
  },
  {
    question: "Is my data stored in India?",
    answer:
      "Yes, all data is stored locally in India, ensuring compliance with Indian data protection regulations. We use servers located in Mumbai and Bangalore for fast performance across the country.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes, you can cancel your subscription at any time. There are no long-term contracts, and you'll continue to have access to your plan features until the end of your billing period. We also offer a 14-day money-back guarantee.",
  },
  {
    question: "Do you offer API access?",
    answer:
      "API access is available with our Organization plan. This allows you to integrate BharatLinks with your existing systems and automate link creation and management.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="w-full py-20 bg-slate-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Everything you need to know about BharatLinks.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-slate-200 overflow-hidden transition-all hover:shadow-md"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
              >
                <span className="text-base font-semibold text-slate-900 pr-8">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-slate-500 shrink-0 transition-transform duration-200",
                    openIndex === index && "transform rotate-180"
                  )}
                />
              </button>
              <div
                className={cn(
                  "overflow-hidden transition-all duration-300 ease-in-out",
                  openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <div className="px-6 pb-4">
                  <p className="text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-slate-600 mb-4">Still have questions? We're here to help.</p>
          <a
            href="mailto:support@bharatlinks.in"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            Contact Support →
          </a>
        </div>
      </div>
    </section>
  );
}
