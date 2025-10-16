import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function SupportPage() {
  const faqs = [
    {
      question: "What is Fraud Guardian?",
      answer: "Fraud Guardian is an AI-powered platform that analyzes financial transactions in real-time to detect and prevent fraudulent activities. It uses advanced machine learning models to score transactions and provide detailed explanations for its decisions.",
    },
    {
      question: "How do I analyze a transaction?",
      answer: "The system automatically analyzes transactions as they are processed. You can view the results on the Dashboard and Transactions pages. To get a detailed AI explanation for a flagged transaction, use the 'AI Decision Explanation' card on the Dashboard.",
    },
    {
      question: "What do the different risk scores mean?",
      answer: "Risk scores range from 0 to 100. A lower score indicates a safe transaction, while a higher score suggests a higher probability of fraud. Transactions with scores above a certain threshold are automatically flagged for review.",
    },
    {
        question: "How are the AI models trained?",
        answer: "The AI models are trained on historical transaction data using Huawei's ModelArts platform. You can initiate new training jobs from the 'Model Management' page to keep the models updated with the latest fraud patterns."
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground/90 sm:text-3xl">
        Support
      </h1>
      <p className="text-muted-foreground">
        Find answers to common questions or get in touch with our support team.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                    <CardDescription>Find quick answers to common questions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                            <AccordionTrigger>{faq.question}</AccordionTrigger>
                            <AccordionContent>{faq.answer}</AccordionContent>
                        </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-1">
             <Card>
                <CardHeader>
                    <CardTitle>Contact Support</CardTitle>
                    <CardDescription>Can't find an answer? Reach out to us directly.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="Your Name" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="your.email@example.com" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea id="message" placeholder="How can we help you?" />
                    </div>
                    <Button className="w-full">Send Message</Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
