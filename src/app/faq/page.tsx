// app/faq/page.tsx
"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Truck,
  RefreshCw,
  CreditCard,
  Shield,
  Package,
  Leaf,
  MessageSquare,
  Clock,
  Search,
  Phone,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserLayout from "../../components/layout/UserLayout";

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const faqCategories = [
    {
      id: "general",
      title: "General Questions",
      icon: HelpCircle,
      questions: [
        {
          q: "What is Untapped Nature?",
          a: "Untapped Nature is committed to offering high-quality natural and organic products made from carefully selected ingredients. We believe in promoting healthier lifestyles through nature-inspired solutions."
        },
        {
          q: "Are your products 100% natural?",
          a: "Yes. Our products are made using carefully sourced natural ingredients and are free from harmful chemicals, artificial colors, and unnecessary additives whenever possible. Each product page provides detailed ingredient information."
        },
        {
          q: "Are your products safe for daily use?",
          a: "Our products are formulated using natural ingredients and are generally safe when used as directed. If you have allergies, sensitive skin, or any medical condition, please review the ingredient list and consult your healthcare professional before use."
        }
      ]
    },
    {
      id: "orders",
      title: "Orders & Shipping",
      icon: Package,
      questions: [
        {
          q: "How long does delivery take?",
          a: "Orders are typically delivered within 3–7 business days across India. Delivery times may vary depending on your location. Once your order is shipped, you'll receive a tracking link via SMS or email."
        },
        {
          q: "How can I track my order?",
          a: "After your order is dispatched, you'll receive a tracking link via email or SMS. You can also log in to your account and track your order anytime from the My Orders section."
        },
        {
          q: "Can I cancel or modify my order?",
          a: "Yes. You can request to cancel or modify your order before it has been shipped. Once the order has been dispatched, cancellations or modifications may no longer be possible. If you need assistance, please contact our customer support team as soon as possible."
        }
      ]
    },
    {
      id: "payment",
      title: "Payment & Security",
      icon: CreditCard,
      questions: [
        {
          q: "What payment methods do you accept?",
          a: "We accept UPI, Credit Cards, Debit Cards, Net Banking, and Digital Wallets. Cash on Delivery (COD) is currently not available. All payments are processed through secure and encrypted payment gateways."
        }
      ]
    },
    {
      id: "support",
      title: "Customer Support",
      icon: MessageSquare,
      questions: [
        {
          q: "How can I contact Untapped Nature's customer support?",
          a: "You can reach our customer support team through the Contact Us page, email at info@untappednature.com, or call us at +91 70967 12340. We're here to assist you with product inquiries, orders, returns, and any other questions you may have."
        }
      ]
    }
  ];

  // Filter questions based on search query
  const filteredCategories = searchQuery
    ? faqCategories.map(category => ({
      ...category,
      questions: category.questions.filter(q =>
        q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(category => category.questions.length > 0)
    : faqCategories;

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <UserLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="h-8 w-8 text-primary" />
            <h1 className="text-3xl sm:text-4xl font-bold">
              Frequently Asked Questions
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Find quick answers to common questions about our products, orders, and policies.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-6 text-base"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Browse by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {faqCategories.map((category) => (
              <a
                key={category.id}
                href={`#${category.id}`}
                className="flex flex-col items-center justify-center p-4 border rounded-lg hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <category.icon className="h-6 w-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-center">{category.title}</span>
              </a>
            ))}
          </div>
        </div>

        {/* FAQ Content */}
        <div className="space-y-12">
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category, categoryIndex) => (
              <div key={category.id} id={category.id} className="scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
                  <category.icon className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold">{category.title}</h2>
                </div>

                <div className="space-y-4">
                  {category.questions.map((item, index) => {
                    const globalIndex = categoryIndex * 100 + index;
                    const isOpen = openIndex === globalIndex;

                    return (
                      <div
                        key={index}
                        className="border rounded-lg overflow-hidden transition-all hover:border-primary/50"
                      >
                        <button
                          onClick={() => toggleQuestion(globalIndex)}
                          className="w-full flex items-center justify-between p-4 md:p-6 text-left bg-background hover:bg-muted/50 transition-colors"
                        >
                          <span className="font-medium text-base md:text-lg pr-4">{item.q}</span>
                          <div className="flex-shrink-0 ml-2">
                            {isOpen ? (
                              <ChevronUp className="h-5 w-5 text-primary" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </button>

                        {isOpen && (
                          <div className="p-4 md:p-6 pt-0 bg-background">
                            <div className="pl-0 md:pl-4 border-l-2 border-primary">
                              <p className="text-muted-foreground leading-relaxed">{item.a}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground mb-6">
                Try searching with different keywords or browse the categories above.
              </p>
              <Button onClick={() => setSearchQuery("")} variant="outline">
                Clear Search
              </Button>
            </div>
          )}
        </div>

        {/* Still Have Questions Section */}
        <div className="mt-16 p-6 md:p-8 border-2 border-primary/20 rounded-xl bg-gradient-to-br from-primary/5 to-background">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="md:flex-1">
              <h3 className="text-xl md:text-2xl font-bold mb-3">Still have questions?</h3>
              <p className="text-muted-foreground mb-4">
                Can't find the answer you're looking for? Our customer support team is here to help.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Email Us</p>
                    <p className="text-sm text-muted-foreground">info@untappednature.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Working Hours</p>
                    <p className="text-sm text-muted-foreground">Mon–Sat, 9am–6pm IST</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild size="lg">
                <a href="mailto:info@untappednature.com">
                  Email Support
                </a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="tel:+917096712340">
                  Call Us
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Popular Topics */}
        <div className="mt-12">
          <h3 className="text-xl font-bold mb-6">Popular Topics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "Track My Order", icon: Truck, href: "#orders" },
              { title: "Cancel or Modify Order", icon: RefreshCw, href: "#orders" },
              { title: "Natural Ingredients", icon: Leaf, href: "#products" },
              { title: "Payment Methods", icon: CreditCard, href: "#payment" },
            ].map((topic, index) => (
              <a
                key={index}
                href={topic.href}
                className="flex items-center gap-3 p-4 border rounded-lg hover:border-primary hover:bg-primary/5 transition-all group"
              >
                <topic.icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                <span className="font-medium">{topic.title}</span>
                <ChevronDown className="h-4 w-4 ml-auto text-muted-foreground group-hover:text-primary rotate-270" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default FAQPage;
