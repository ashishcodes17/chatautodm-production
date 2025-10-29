"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function FAQ() {
  const faqs = [
    {
      question: "Will using ChatAutoDM get my social account locked?",
      answer:
        "No. ChatAutoDM is built to work within Instagram's guidelines and rate limits. We implement protective measures to ensure your account remains in good standing while using our automation tools.",
    },
    {
      question: "What are the main uses of ChatAutoDM?",
      answer:
        "InstaAutoDM is primarily used for automating responses to comments on your Instagram posts, sending personalized DMs based on triggers, delivering lead magnets automatically, capturing contact information, and nurturing leads through automated conversation flows.",
    },

   // {
     // question: "Will using automations make conversations sound like a robot, or can it mimic my voice?",
     // answer:
      //  "Our platform allows you to create highly personalized messages that match your brand voice. You can create custom templates with your unique tone and style, and even use AI-powered responses that sound natural and conversational.",
   // },
    {
      question: "Do I need to know how to code to set up the automations?",
      answer:
        "Absolutely not! ChatAutoDM features a user-friendly visual builder that requires zero coding knowledge. You can create sophisticated automation flows with our intuitive drag-and-drop interface.",
    },
    {
      question: "How quickly will DMs be sent after a comment?",
      answer:
        "Our system checks for new comments every minute. Once a matching comment is detected, the DM is sent immediately, subject to Instagram's rate limits to protect your account.",
    },
    {
      question: "Can I use this for multiple Instagram accounts?",
      answer:
        "Yes! Our Platform supports up to 10 Instagram accounts. Each account can have its own set of automations.",
    },
    {
      question: "What happens if I reach my monthly DM limit?",
      answer:
        "If you reach your monthly DM limit, your automations will pause until your next billing cycle. You'll receive notifications as you approach your limit, and you can upgrade your plan at any time to increase your limit.",
    },
    {
      question: "Is there a free trial available?",
      answer:
        "Yes, all paid plans include a 14-day free trial. You can test all features without entering payment information. After the trial period, you can choose to subscribe or downgrade to our free plan.",
    },
  ]

  return (
    <section className="w-full py-20 bg-black text-white">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center mb-4">
            <span className="text-orange-500 text-4xl">🤔</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold">Frequently asked questions</h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-zinc-800">
                <AccordionTrigger className="text-xl py-6 text-left hover:text-pink-500">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-zinc-400 text-lg pb-6">{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
