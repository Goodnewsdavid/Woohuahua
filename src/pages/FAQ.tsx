import { ChevronDown } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { faqData } from '@/data/mockData';

export default function FAQ() {
  return (
    <Layout>
      <div className="container py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="font-display text-4xl font-bold text-foreground">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Find answers to common questions about microchipping and our services
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="space-y-4">
            {faqData.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="rounded-xl border-2 border-border bg-card px-6 data-[state=open]:border-primary/30"
              >
                <AccordionTrigger className="py-4 text-left font-semibold hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Still have questions */}
          <div className="mt-12 rounded-2xl bg-gradient-surface p-8 text-center">
            <h2 className="font-display text-xl font-bold text-foreground">
              Still have questions?
            </h2>
            <p className="mt-2 text-muted-foreground">
              Can't find the answer you're looking for? Contact our support team.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <a
                href="/contact"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Contact Support
              </a>
              <a
                href="/ai-call-centre"
                className="inline-flex items-center justify-center rounded-lg border-2 border-border bg-card px-6 py-3 font-semibold text-foreground transition-colors hover:bg-muted"
              >
                Talk to AI Assistant
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
