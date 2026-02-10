"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation"; // Added useSearchParams
import { ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "../../hooks/useToast";
import UserLayout from "../../components/layout/UserLayout";
import { getAllProducts, addToCart } from "../../lib/api/auth";
import { getUserId, isAuthenticated } from "../../lib/api/config";
import { useCart } from "../../context/CartContext";
import type { Product } from "../../types/index";

export default function ShopPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { incrementCartCount } = useCart();
  const searchParams = useSearchParams(); // Add this

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]); // Add this
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  // Add useEffect to filter products when search params change
  useEffect(() => {
    const searchQuery = searchParams.get("search");
    if (searchQuery) {
      const filtered = products.filter((product) => {
        const searchLower = searchQuery.toLowerCase();
        return (
          product.name?.toLowerCase().includes(searchLower) ||
          product.description?.toLowerCase().includes(searchLower)
        );
      });
      setFilteredProducts(filtered);
    } else {
      // If no search query, show all products
      setFilteredProducts(products);
    }
  }, [searchParams, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await getAllProducts();

      // Handle different response formats
      if (Array.isArray(response)) {
        setProducts(response);
        setFilteredProducts(response); // Initialize filtered products
      } else if (response.success && response.data) {
        setProducts(response.data);
        setFilteredProducts(response.data); // Initialize filtered products
      } else if (response.data && Array.isArray(response.data)) {
        setProducts(response.data);
        setFilteredProducts(response.data); // Initialize filtered products
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
        description: "Please login to add items to cart",
        variant: "destructive",
      });
      router.push("/shop");
      return;
    }

    const userId = getUserId();
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID not found. Please login again.",
        variant: "destructive",
      });
      router.push("/shop");
      return;
    }

    try {
      setAddingToCart(product.id);

      await addToCart({
        userId,
        productId: product.id,
        quantity: 1,
        selectedSize: product.sizes?.[0] || "",
      });

      // Update cart count in global state
      incrementCartCount(1);

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

  // Get search query for display
  const searchQuery = searchParams.get("search");

  return (
    <UserLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header with Search Results Info */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            {searchQuery ? `Search Results for "${searchQuery}"` : "Shop All Products"}
          </h1>
          <p className="text-muted-foreground">
            {searchQuery 
              ? `Found ${filteredProducts.length} product${filteredProducts.length !== 1 ? 's' : ''}`
              : "Discover our latest collection"}
          </p>
          {/* {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2"
              onClick={() => router.push("/shop")}
            >
              Clear Search
            </Button>
          )} */}
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
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {Array.isArray(product.sizes) && product.sizes.length > 0
                      ? product.sizes.join(", ")
                      : "No sizes available"}
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
          /* Empty State - Different message for search vs no products */
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery ? "No products found" : "No products available yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? `No products found for "${searchQuery}". Try different keywords.`
                : "Check back soon for new arrivals!"}
            </p>
            {searchQuery && (
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => router.push("/shop")}
              >
                View All Products
              </Button>
            )}
            <Button variant="outline" className="mt-4 ml-2" onClick={loadProducts}>
              Refresh Products
            </Button>
          </div>
        )}
      </div>
    </UserLayout>
  );
}