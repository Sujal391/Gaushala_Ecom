"use client";

// Main component with Suspense wrapper
import { Suspense } from "react";
import AdminGuard from "../../../../components/guards/AdminGuard";
import { Loader2 } from "lucide-react";
import ProductReviewsContent from "./ProductReviewsPage";

export default function ProductReviewsPage() {
  return (
    <AdminGuard>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading...</span>
        </div>
      }>
        <ProductReviewsContent />
      </Suspense>
    </AdminGuard>
  );
}