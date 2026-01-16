// app/admin/products/reviews/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Star,
  Search,
  Filter,
  Download,
  MessageSquare,
  Calendar,
  User,
  ArrowLeft,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Package,
  BarChart,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFeedbackByProduct } from "../../../../lib/api/auth";
import AdminGuard from "../../../../components/guards/AdminGuard";
import AdminLayout from "../../../../components/layout/AdminLayout";
import { toast } from "sonner";
import Link from "next/link";

interface ProductFeedback {
  rating: number;
  review: string;
  createdAt: string;
  customerName: string;
}

interface FeedbackApiResponse {
  success: boolean;
  data: ProductFeedback[];
  message?: string;
  error?: string;
}

export default function ProductReviewsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get product details from URL params
  const productId = searchParams.get("productId");
  const productName = searchParams.get("productName") || "Product";

  const [loading, setLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState<ProductFeedback[]>([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<ProductFeedback[]>(
    []
  );

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!productId) {
      toast.error("Product ID is required");
      router.push("/admin/products");
      return;
    }

    if (productId && productId !== "undefined") {
      loadFeedbacks();
    }
  }, [productId]);

  useEffect(() => {
    filterAndSortFeedbacks();
  }, [feedbacks, searchQuery, ratingFilter, sortBy]);

  const loadFeedbacks = async () => {
    if (!productId) return;

    try {
      setLoading(true);
      const numericProductId = parseInt(productId);

      if (isNaN(numericProductId)) {
        toast.error("Invalid product ID");
        return;
      }

      const response: FeedbackApiResponse = await getFeedbackByProduct(
        numericProductId
      );

      if (response.success && response.data) {
        setFeedbacks(response.data);
        toast.success(
          `Loaded ${response.data.length} reviews for ${productName}`
        );
      } else {
        toast.error(response.message || "Failed to load feedback");
        setFeedbacks([]);
      }
    } catch (error) {
      console.error("Error loading feedback:", error);
      toast.error("Failed to load feedback data");
      setFeedbacks([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortFeedbacks = () => {
    let filtered = [...feedbacks];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (feedback) =>
          feedback.customerName?.toLowerCase().includes(query) ||
          feedback.review?.toLowerCase().includes(query)
      );
    }

    // Apply rating filter
    if (ratingFilter !== "all") {
      const rating = parseInt(ratingFilter);
      filtered = filtered.filter((feedback) => feedback.rating === rating);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      switch (sortBy) {
        case "newest":
          return dateB - dateA;
        case "oldest":
          return dateA - dateB;
        case "highest":
          return b.rating - a.rating;
        case "lowest":
          return a.rating - b.rating;
        default:
          return dateB - dateA;
      }
    });

    setFilteredFeedbacks(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getRatingColor = (rating: number) => {
    switch (rating) {
      case 5:
        return "bg-green-100 text-green-800 border-green-200";
      case 4:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case 3:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case 2:
        return "bg-orange-100 text-orange-800 border-orange-200";
      case 1:
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${
            i <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  const calculateRatingStats = () => {
    const total = feedbacks.length;
    if (total === 0) return { average: 0, distribution: {} };

    const sum = feedbacks.reduce((acc, f) => acc + f.rating, 0);
    const average = sum / total;

    const distribution: Record<number, number> = {};
    for (let i = 1; i <= 5; i++) {
      distribution[i] = feedbacks.filter((f) => f.rating === i).length;
    }

    return { average, distribution };
  };

  const exportFeedback = () => {
    if (filteredFeedbacks.length === 0) {
      toast.warning("No feedback to export");
      return;
    }

    // Simple CSV export
    const csvContent = [
      ["Customer Name", "Rating", "Review", "Date"],
      ...filteredFeedbacks.map((f) => [
        f.customerName,
        f.rating,
        `"${f.review.replace(/"/g, '""')}"`,
        formatDate(f.createdAt),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feedback-product-${productId}-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Feedback exported successfully");
  };

  const handleBack = () => {
    router.push("/admin/products");
  };

  const handleEditProduct = () => {
    if (productId) {
      router.push(`/admin/products/edit/${productId}`);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredFeedbacks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFeedbacks = filteredFeedbacks.slice(startIndex, endIndex);

  const { average, distribution } = calculateRatingStats();

  const headerAction = (
    <Button variant="outline" size="sm" onClick={handleBack} className="gap-2">
      <ArrowLeft className="h-4 w-4" />
      <span className="hidden sm:inline">Back to Products</span>
      <span className="sm:hidden">Back</span>
    </Button>
  );

  return (
    <AdminGuard>
      <AdminLayout title={`Product Reviews`} headerAction={headerAction}>
        <Card className="max-w-6xl mx-auto">
          <CardHeader className="px-4 sm:px-6 py-4 sm:py-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <Package className="h-6 w-6 text-primary" />
                  <CardTitle className="text-xl sm:text-2xl">
                    Product Reviews
                  </CardTitle>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    Product:{" "}
                    <span className="font-semibold text-foreground">
                      {productName}
                    </span>
                  </p>
                  <Separator orientation="vertical" className="h-4" />
                  <p className="text-sm text-muted-foreground">
                    ID:{" "}
                    <span className="font-semibold text-foreground">
                      {productId}
                    </span>
                  </p>
                  {productId && (
                    <>
                      <Separator orientation="vertical" className="h-4" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleEditProduct}
                        className="h-7 gap-1 text-xs"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Edit Product
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadFeedbacks}
                  disabled={loading}
                  className="gap-2"
                >
                  <Loader2
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportFeedback}
                  disabled={filteredFeedbacks.length === 0}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export CSV</span>
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-4 sm:px-6 pb-6">
            {/* Product Summary */}
            <div className="mb-6 p-4 bg-muted/30 rounded-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">Rating Summary</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <BarChart className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">Total Reviews:</span>
                      <Badge variant="secondary">{feedbacks.length}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                      <span className="font-medium">Average Rating:</span>
                      <Badge variant="outline" className="text-lg font-bold">
                        {average.toFixed(1)}/5
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="min-w-[200px]">
                  <h4 className="font-medium text-sm mb-2">
                    Rating Distribution
                  </h4>
                  <div className="space-y-1">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div
                        key={rating}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div className="w-8 flex items-center gap-1">
                          {rating}
                          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                        </div>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-yellow-400 h-2 rounded-full"
                            style={{
                              width: `${
                                feedbacks.length > 0
                                  ? (distribution[rating] / feedbacks.length) *
                                    100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                        <span className="w-8 text-right">
                          {distribution[rating] || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter Section */}
            <div className="space-y-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search reviews by customer or content..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select value={ratingFilter} onValueChange={setRatingFilter}>
                    <SelectTrigger className="w-full">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder="Filter by Rating" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="highest">Highest Rating</SelectItem>
                      <SelectItem value="lowest">Lowest Rating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="font-normal">
                  Total: {feedbacks.length} reviews
                </Badge>
                <Badge variant="outline" className="font-normal">
                  Showing: {filteredFeedbacks.length} reviews
                </Badge>
                {searchQuery && (
                  <Badge variant="secondary">
                    Search: "{searchQuery}"
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => setSearchQuery("")}
                    >
                      ✕
                    </Button>
                  </Badge>
                )}
              </div>
            </div>

            {/* Feedback List */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading reviews...</span>
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="text-center py-12 border rounded-lg">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                <p className="text-muted-foreground mb-4">
                  This product hasn't received any reviews yet.
                </p>
                <Button variant="outline" onClick={handleBack}>
                  Back to Products
                </Button>
              </div>
            ) : currentFeedbacks.length === 0 ? (
              <div className="text-center py-12 border rounded-lg">
                <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No matching reviews
                </h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setRatingFilter("all");
                    setSortBy("newest");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {currentFeedbacks.map((feedback, index) => (
                    <Card
                      key={index}
                      className="overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex flex-col gap-4">
                          {/* Header with customer info and date */}
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="flex flex-col gap-2">
                              {/* Customer Name - Moved to top */}
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span className="font-medium text-foreground">
                                  {feedback.customerName}
                                </span>
                              </div>

                              {/* Star Rating */}
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  {renderStars(feedback.rating)}
                                  <Badge
                                    variant="outline"
                                    className={`ml-2 ${getRatingColor(
                                      feedback.rating
                                    )}`}
                                  >
                                    {feedback.rating}.0
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Date - Right side */}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(feedback.createdAt)}</span>
                            </div>
                          </div>

                          {/* Review Content */}
                          <div className="bg-muted/20 rounded-lg p-4">
                            <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                              {feedback.review}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Showing {startIndex + 1}-
                      {Math.min(endIndex, filteredFeedbacks.length)} of{" "}
                      {filteredFeedbacks.length} reviews
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <Button
                                key={pageNum}
                                variant={
                                  currentPage === pageNum
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => setCurrentPage(pageNum)}
                              >
                                {pageNum}
                              </Button>
                            );
                          }
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </AdminLayout>
    </AdminGuard>
  );
}
