"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Search, Filter, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "../../hooks/useToast";
import UserLayout from "../../components/layout/UserLayout";
import { getAllProducts, addToCart } from "../../lib/api/auth";
import { getUserId, isAuthenticated } from "../../lib/api/config";
import type { Product } from "../../types/index";

export default function ShopPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await getAllProducts();

      // Handle different response formats
      if (Array.isArray(response)) {
        // Direct array response
        setProducts(response);
      } else if (response.success && response.data) {
        // Response with success and data properties
        setProducts(response.data);
      } else if (response.data && Array.isArray(response.data)) {
        // Response with just data property
        setProducts(response.data);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to load products",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading products:", error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

const handleAddToCart = async (product: Product) => {
  // Check if user is authenticated
  if (!isAuthenticated()) {
    toast({
      title: "Authentication Required",
      description: "Please login to add items to cart",
      variant: "destructive",
    });
    router.push("/userLayout");
    return;
  }

  const userId = getUserId();
  if (!userId) {
    toast({
      title: "Error",
      description: "User ID not found. Please login again.",
      variant: "destructive",
    });
    router.push("/login");
    return;
  }

  try {
    setAddingToCart(product.id);

    // ✅ If this does not throw, it's a success
    await addToCart({
      userId,
      productId: product.id,
      quantity: 1,
    });

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart`,
    });

  } catch (error: any) {
    console.error("Error adding to cart:", error);

    toast({
      title: "Error",
      description:
        error?.response?.data?.message ||
        "Failed to add item to cart. Please try again.",
      variant: "destructive",
    });
  } finally {
    setAddingToCart(null);
  }
};

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  return (
    <UserLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Shop All Products
          </h1>
          <p className="text-muted-foreground">
            Discover our latest collection
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredProducts.length > 0 ? (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/products/${product.id}`)}
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <img
                    src={
                      product.images?.[0]
                        ? `https://gaushalaecommerce.runasp.net${product.images[0]}`
                        : "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400"
                    }
                    alt={product.name}
                    className="object-cover w-full h-full transition-transform group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/placeholder-product.jpg";
                    }}
                  />
                  {product.stockQty < 10 && product.stockQty > 0 && (
                    <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                      Only {product.stockQty} left
                    </span>
                  )}
                  {product.stockQty === 0 && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      Out of Stock
                    </span>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-base sm:text-lg mb-1 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {product.description}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-primary">
                    ₹ {Number(product.price).toFixed(2)}
                  </p>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button
                    className="w-full"
                    disabled={
                      product.stockQty === 0 || addingToCart === product.id
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                  >
                    {addingToCart === product.id ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : product.stockQty === 0 ? (
                      "Out of Stock"
                    ) : (
                      "Add to Cart"
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search or filters"
                : "No products available yet"}
            </p>
            <Button variant="outline" className="mt-4" onClick={loadProducts}>
              Refresh Products
            </Button>
          </div>
        )}
      </div>
    </UserLayout>
  );
}
