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
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UserLayout from "../../components/layout/UserLayout";

const FAQPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const faqCategories = [
    {
      id: "orders",
      title: "Orders & Shipping",
      icon: Package,
      questions: [
        {
          q: "How long does shipping take?",
          a: "Standard shipping takes 3-5 business days. Express shipping is available for 1-2 business day delivery. International shipping typically takes 7-14 business days depending on the destination."
        },
        {
          q: "Do you ship internationally?",
          a: "Yes, we ship to over 50 countries worldwide. Shipping rates and delivery times vary by location. You can see the exact shipping cost at checkout before completing your purchase."
        },
        {
          q: "How can I track my order?",
          a: "Once your order ships, you'll receive a tracking number via email. You can also track your order by logging into your account and visiting the 'My Orders' section."
        },
        {
          q: "What shipping carriers do you use?",
          a: "We work with multiple carriers including UPS, FedEx, and USPS for domestic orders, and DHL for international shipments. The carrier is selected based on the most efficient and eco-friendly option for your location."
        }
      ]
    },
    {
      id: "returns",
      title: "Returns & Refunds",
      icon: RefreshCw,
      questions: [
        {
          q: "What is your return policy?",
          a: "We offer a 30-day return policy for unopened and unused products. Items must be in their original packaging with all seals intact. Returns are free within the US."
        },
        {
          q: "How do I initiate a return?",
          a: "Log into your account, go to 'My Orders', select the order you want to return, and click 'Return Item'. Follow the instructions to print your return label and schedule a pickup or drop off."
        },
        {
          q: "How long does it take to process a refund?",
          a: "Once we receive your return, it takes 3-5 business days to inspect the items and process your refund. You'll receive an email confirmation once your refund has been issued."
        },
        {
          q: "Do you offer exchanges?",
          a: "Yes, we offer exchanges for different products or sizes. Please initiate a return for the original item and place a new order for the item you want. For expedited exchanges, contact our customer service team."
        }
      ]
    },
    {
      id: "products",
      title: "Products & Ingredients",
      icon: Leaf,
      questions: [
        {
          q: "Are your products cruelty-free?",
          a: "Absolutely! All Untapped Nature products are 100% cruelty-free. We never test on animals and all our ingredients are ethically sourced."
        },
        {
          q: "Are your products vegan?",
          a: "Most of our products are vegan. Products containing animal-derived ingredients are clearly marked on the product page. We're constantly working to make our entire line 100% vegan."
        },
        {
          q: "Where are your ingredients sourced from?",
          a: "We source our ingredients from sustainable farms around the world, prioritizing organic and fair-trade suppliers. Each product page details the origin of key ingredients."
        },
        {
          q: "Do you use synthetic fragrances?",
          a: "No, all our fragrances come from natural essential oils and botanical extracts. We never use synthetic fragrances, parabens, sulfates, or phthalates in any of our products."
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
          a: "We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, Apple Pay, Google Pay, and Shop Pay for your convenience."
        },
        {
          q: "Is my payment information secure?",
          a: "Yes, we use industry-standard SSL encryption to protect your payment information. We never store complete credit card numbers on our servers."
        },
        {
          q: "Do you offer gift cards?",
          a: "Yes! You can purchase digital gift cards in any amount from $25 to $500. They're delivered instantly via email and never expire."
        },
        {
          q: "Can I split my payment between two methods?",
          a: "Currently, we only accept one payment method per order. However, you can use gift cards combined with another payment method."
        }
      ]
    },
    {
      id: "account",
      title: "Account & Subscription",
      icon: Shield,
      questions: [
        {
          q: "How do I reset my password?",
          a: "Click 'Forgot Password' on the login page. Enter your email address and we'll send you a password reset link. The link expires in 24 hours for security."
        },
        {
          q: "Can I change my subscription frequency?",
          a: "Yes, you can modify your subscription at any time. Log into your account, go to 'My Subscriptions', and adjust the frequency, products, or skip a delivery."
        },
        {
          q: "How do I cancel my subscription?",
          a: "You can cancel your subscription at any time without penalty. Log into your account, go to 'My Subscriptions', and click 'Cancel Subscription'. You'll continue to receive shipments until the end of your current billing cycle."
        },
        {
          q: "Is there a loyalty program?",
          a: "Yes! Our Nature Points program rewards you for purchases, reviews, and referrals. Earn points that can be redeemed for discounts on future orders."
        }
      ]
    },
    {
      id: "general",
      title: "General Questions",
      icon: HelpCircle,
      questions: [
        {
          q: "What makes Untapped Nature different?",
          a: "We're committed to 100% natural ingredients, sustainable packaging, and ethical sourcing. Our products are developed with environmental scientists and dermatologists to ensure effectiveness without compromise."
        },
        {
          q: "Are your packaging materials eco-friendly?",
          a: "Yes, all our packaging is 100% recyclable or compostable. We use post-consumer recycled materials and minimize plastic use whenever possible."
        },
        {
          q: "Do you offer wholesale or bulk orders?",
          a: "Yes, we have a wholesale program for retailers and bulk orders for corporate gifting. Contact our business team at wholesale@untappednature.com for pricing and minimums."
        },
        {
          q: "How can I contact customer service?",
          a: "You can reach us via email at info@untappednature.com, chat with us on our website during business hours, or call us at 1-800-UNTAPPED (868-2773). Our team is available Monday-Friday, 9am-6pm EST."
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
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
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Live Chat</p>
                    <p className="text-sm text-muted-foreground">Available 9am-6pm EST</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Response Time</p>
                    <p className="text-sm text-muted-foreground">Within 24 hours</p>
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
                <a href="tel:1-800-UNTAPPED">
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
              { title: "Shipping Information", icon: Truck, href: "#orders" },
              { title: "Return Instructions", icon: RefreshCw, href: "#returns" },
              { title: "Product Ingredients", icon: Leaf, href: "#products" },
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