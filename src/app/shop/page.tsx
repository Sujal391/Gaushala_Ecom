"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShoppingBag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "../../hooks/useToast";
import UserLayout from "../../components/layout/UserLayout";
import BannerSlider from "../../components/BannerSlider";
import { getAllProducts, addToCart } from "../../lib/api/auth";
import { getUserId, isAuthenticated, API_BASE_URL } from "../../lib/api/config";
import { useCart } from "../../context/CartContext";
import type { Product, ProductSize, ApiResponse } from "../../types/index";

// Guest cart constants
const GUEST_CART_KEY = 'guest_cart';

interface GuestCartItem {
  productId: number;
  productName: string;
  description: string;
  price: number;
  quantity: number;
  images: string[];
  selectedSize: string;
  addedAt: number;
}

// Type guard functions
function isProductArray(data: unknown): data is Product[] {
  return Array.isArray(data) && data.every(item => 
    typeof item === 'object' && 
    item !== null && 
    'id' in item && 
    'name' in item &&
    'sizes' in item &&
    Array.isArray((item as Product).sizes)
  );
}

function isApiResponse(response: unknown): response is ApiResponse<Product[]> {
  return typeof response === 'object' && 
    response !== null && 
    'success' in response && 
    'data' in response;
}

export default function ShopPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { incrementCartCount } = useCart();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [showBanner, setShowBanner] = useState(true); // Always true on mount

  useEffect(() => {
    loadProducts();
  }, []);

  // Filter products when search params change
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
      setFilteredProducts(products);
    }
  }, [searchParams, products]);

  const handleCloseBanner = () => {
    setShowBanner(false);
  };

  const loadProducts = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await getAllProducts();

      if (isProductArray(response)) {
        setProducts(response);
        setFilteredProducts(response);
      } else if (isApiResponse(response)) {
        const productData = response.data;
        if (isProductArray(productData)) {
          setProducts(productData);
          setFilteredProducts(productData);
        } else {
          throw new Error('Invalid product data format');
        }
      } else if (response && typeof response === 'object' && 'data' in response) {
        const possibleData = (response as any).data;
        if (isProductArray(possibleData)) {
          setProducts(possibleData);
          setFilteredProducts(possibleData);
        } else {
          throw new Error('Invalid product data format');
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to load products: Invalid response format",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading products:", error);
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "Failed to load products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Guest cart functions
  const getGuestCart = (): GuestCartItem[] => {
    try {
      const cart = localStorage.getItem(GUEST_CART_KEY);
      if (!cart) return [];
      
      const parsedCart = JSON.parse(cart);
      
      // Handle legacy cart formats
      if (Array.isArray(parsedCart)) {
        if (parsedCart.length > 0 && 'id' in parsedCart[0]) {
          // Migrate old format to new format
          const migratedCart = parsedCart.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            description: item.description || '',
            price: item.price,
            quantity: item.quantity,
            images: Array.isArray(item.images) ? item.images : (item.image ? [item.image] : []),
            selectedSize: item.selectedSize || 'Default',
            addedAt: typeof item.addedAt === 'string' ? Date.now() : (item.addedAt || Date.now())
          }));
          
          localStorage.setItem(GUEST_CART_KEY, JSON.stringify(migratedCart));
          return migratedCart;
        }
        
        if (parsedCart.length > 0 && 'image' in parsedCart[0]) {
          const migratedCart = parsedCart.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            description: item.description || '',
            price: item.price,
            quantity: item.quantity,
            images: item.image ? [item.image] : [],
            selectedSize: item.selectedSize || 'Default',
            addedAt: item.addedAt || Date.now()
          }));
          
          localStorage.setItem(GUEST_CART_KEY, JSON.stringify(migratedCart));
          return migratedCart;
        }
        
        return parsedCart;
      }
      
      return [];
    } catch (error) {
      console.error('Error loading guest cart:', error);
      return [];
    }
  };

  const saveGuestCart = (items: GuestCartItem[]) => {
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving guest cart:', error);
    }
  };

  const addToGuestCart = (product: Product, size: ProductSize) => {
    const guestCart = getGuestCart();
    
    const existingItem = guestCart.find(
      item => item.productId === product.id && item.selectedSize === size.size
    );

    if (existingItem) {
      existingItem.quantity += 1;
      existingItem.addedAt = Date.now();
    } else {
      guestCart.push({
        productId: product.id,
        productName: product.name || 'Unnamed Product',
        description: product.description || '',
        price: size.discountedPrice || size.price,
        quantity: 1,
        images: product.images || [],
        selectedSize: size.size,
        addedAt: Date.now()
      });
    }

    saveGuestCart(guestCart);
    return guestCart;
  };

  const handleAddToCart = async (product: Product, size: ProductSize): Promise<void> => {
    if (!isAuthenticated()) {
      // Guest cart handling
      try {
        setAddingToCart(product.id);
        
        // Add to guest cart
        addToGuestCart(product, size);
        
        // Update cart count in context
        incrementCartCount(1);
        
        toast({
          title: "Added to guest cart",
          description: `${product.name} (${size.size}) has been added to your guest cart`,
        });
      } catch (error) {
        console.error("Error adding to guest cart:", error);
        toast({
          title: "Error",
          description: "Failed to add item to cart. Please try again.",
          variant: "destructive",
        });
      } finally {
        setAddingToCart(null);
      }
      return;
    }

    // Authenticated user handling
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
        selectedSize: size.size,
      });

      incrementCartCount(1);

      toast({
        title: "Added to cart",
        description: `${product.name} (${size.size}) has been added to your cart`,
      });
    } catch (error: unknown) {
      console.error("Error adding to cart:", error);
      
      let errorMessage = "Failed to add item to cart. Please try again.";
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        errorMessage = axiosError.response?.data?.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setAddingToCart(null);
    }
  };

  const getProductImage = (product: Product): string => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0 && product.images[0]) {
      return `${API_BASE_URL}${product.images[0]}`;
    }
    return "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400";
  };

  const getAvailableSizes = (product: Product): ProductSize[] => {
    return product.sizes?.filter((size): size is ProductSize => 
      size && 
      typeof size === 'object' && 
      'inStock' in size && 
      size.inStock === true &&
      size.stockQty > 0
    ) || [];
  };

  const getDisplayPrice = (product: Product): string => {
    const availableSizes = getAvailableSizes(product);
    if (availableSizes.length > 0) {
      const prices = availableSizes.map(s => s.discountedPrice || s.price);
      const minPrice = Math.min(...prices);
      return `₹ ${minPrice.toFixed(2)}`;
    }
    return `₹ ${Number(product.basePrice || 0).toFixed(2)}`;
  };

  const getOriginalPrice = (product: Product): string | null => {
    const availableSizes = getAvailableSizes(product);
    if (availableSizes.length > 0) {
      const hasDiscount = availableSizes.some(s => 
        s.discountedPrice && s.discountedPrice < s.price
      );
      if (hasDiscount) {
        const minOriginalPrice = Math.min(...availableSizes.map(s => s.price));
        return `₹ ${minOriginalPrice.toFixed(2)}`;
      }
    }
    return null;
  };

  const getTotalStockQty = (product: Product): number => {
    if (!product.sizes || !Array.isArray(product.sizes)) {
      return 0;
    }
    return product.sizes.reduce((total, size) => {
      return total + (typeof size.stockQty === 'number' ? size.stockQty : 0);
    }, 0);
  };

  const hasDiscount = (product: Product): boolean => {
    const availableSizes = getAvailableSizes(product);
    return availableSizes.some(s => 
      s.discountedPrice && s.discountedPrice < s.price
    );
  };

  const getDiscountPercentage = (size: ProductSize): number | null => {
    if (size.discountedPrice && size.discountedPrice < size.price) {
      return Math.round((1 - size.discountedPrice / size.price) * 100);
    }
    return null;
  };

  const searchQuery = searchParams.get("search");

  return (
    <UserLayout>
      {/* Banner Popup - Always shows on mount until closed */}
      {showBanner && <BannerSlider onClose={handleCloseBanner} />}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Guest Mode Banner */}
        {!isAuthenticated() && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 text-sm">
              🛒 You're shopping as a guest. Items will be saved to your browser.
              <Button
                variant="link"
                className="text-blue-600 hover:text-blue-800 px-2"
                onClick={() => router.push('/login')}
              >
                Login to save your cart permanently
              </Button>
            </p>
          </div>
        )}

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
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredProducts.length > 0 ? (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => {
              const totalStockQty = getTotalStockQty(product);
              const availableSizes = getAvailableSizes(product);
              const hasStock = totalStockQty > 0 && availableSizes.length > 0;
              const displayPrice = getDisplayPrice(product);
              const originalPrice = getOriginalPrice(product);
              const productHasDiscount = hasDiscount(product);

              return (
                <Card
                  key={product.id}
                  className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/products/${product.id}`)}
                >
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                      src={getProductImage(product)}
                      alt={product.name || 'Product image'}
                      className="object-cover w-full h-full transition-transform group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "/placeholder-product.jpg";
                      }}
                    />
                    {productHasDiscount && (
                      <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                        Sale
                      </span>
                    )}
                    {hasStock && totalStockQty < 10 && (
                      <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                        Only {totalStockQty} left
                      </span>
                    )}
                    {!hasStock && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        Out of Stock
                      </span>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-base sm:text-lg mb-1 line-clamp-1">
                      {product.name || 'Unnamed Product'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {product.description || 'No description available'}
                    </p>
                    
                    {/* Size Options */}
                    {product.sizes && product.sizes.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1.5">
                          {product.sizes.map((size) => {
                            const discountPercentage = getDiscountPercentage(size);
                            return (
                              <span
                                key={size.id}
                                className={`
                                  inline-flex items-center px-2 py-1 rounded text-xs font-medium
                                  ${size.inStock && size.stockQty > 0
                                    ? 'bg-primary/10 text-primary border border-primary/30' 
                                    : 'bg-muted text-muted-foreground line-through'
                                  }
                                `}
                              >
                                {size.size}
                                {discountPercentage && size.inStock && (
                                  <span className="ml-1 text-green-600 font-bold">
                                    -{discountPercentage}%
                                  </span>
                                )}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Price Display */}
                    <div className="flex items-baseline gap-2">
                      <p className="text-xl sm:text-2xl font-bold text-primary">
                        {displayPrice}
                      </p>
                      {originalPrice && productHasDiscount && (
                        <p className="text-sm text-muted-foreground line-through">
                          {originalPrice}
                        </p>
                      )}
                    </div>
                    
                    {/* Starting from text if multiple sizes */}
                    {availableSizes.length > 1 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Starting from {displayPrice}
                      </p>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    {hasStock && availableSizes.length > 0 ? (
                      <div className="w-full space-y-2">
                        <Button
                          className="w-full"
                          disabled={addingToCart === product.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product, availableSizes[0]);
                          }}
                        >
                          {addingToCart === product.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Adding...
                            </>
                          ) : (
                            `Add to Cart ${availableSizes.length > 1 ? `(${availableSizes[0].size})` : ''}`
                          )}
                        </Button>
                        {availableSizes.length > 1 && (
                          <p className="text-xs text-center text-muted-foreground">
                            More sizes available • Click to select
                          </p>
                        )}
                      </div>
                    ) : (
                      <Button className="w-full" disabled>
                        Out of Stock
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Empty State */
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