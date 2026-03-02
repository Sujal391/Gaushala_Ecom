"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, Sparkles, ArrowLeft, ShoppingBag } from "lucide-react";
import UserLayout from "../../components/layout/UserLayout";
import { getNewProducts, addToCart } from "../../lib/api/auth";
import { API_BASE_URL, isAuthenticated, getUserId } from "../../lib/api/config";
import { useToast } from "../../hooks/useToast";
import { useCart } from "../../context/CartContext";
import type { Product, ProductSize } from "../../types";

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

export default function NewProductsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { incrementCartCount } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);

  useEffect(() => {
    loadNewProducts();
  }, []);

  const loadNewProducts = async () => {
    try {
      setLoading(true);
      const data = await getNewProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error loading new products:", error);
      toast({
        title: "Error",
        description: "Failed to load new products",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getProductImage = (product: Product): string => {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      const firstImage = product.images[0];
      if (typeof firstImage === 'object' && firstImage !== null && 'imageUrl' in firstImage) {
        return `${API_BASE_URL}${firstImage.imageUrl}`;
      }
      if (typeof firstImage === 'string') {
        return `${API_BASE_URL}${firstImage}`;
      }
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

  const getTotalStockQty = (product: Product): number => {
    if (!product.sizes || !Array.isArray(product.sizes)) {
      return 0;
    }
    return product.sizes.reduce((total, size) => {
      return total + (typeof size.stockQty === 'number' ? size.stockQty : 0);
    }, 0);
  };

  // Get short description - limit to 7 words
  const getShortDescription = (description: string): string => {
    if (!description) return '';
    const words = description.split(' ');
    if (words.length <= 7) return description;
    return words.slice(0, 7).join(' ') + '...';
  };

  // Cart functions
  const getGuestCart = (): GuestCartItem[] => {
    try {
      const cart = localStorage.getItem(GUEST_CART_KEY);
      if (!cart) return [];
      
      const parsedCart = JSON.parse(cart);
      
      if (Array.isArray(parsedCart)) {
        if (parsedCart.length > 0 && 'id' in parsedCart[0]) {
          const migratedCart = parsedCart.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            description: item.description || '',
            price: item.price,
            quantity: item.quantity,
            images: Array.isArray(item.images) 
              ? item.images.map((img: any) => {
                  if (typeof img === 'string') return img;
                  if (img && typeof img === 'object' && 'imageUrl' in img) {
                    return img.imageUrl;
                  }
                  return '';
                }).filter((url: string) => url !== '')
              : (item.image ? [item.image] : []),
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

    const transformImages = (images: any): string[] => {
      if (!images || !Array.isArray(images)) return [];
      
      return images.map(img => {
        if (typeof img === 'string') return img;
        if (img && typeof img === 'object' && 'imageUrl' in img) {
          return img.imageUrl;
        }
        return '';
      }).filter(url => url !== '');
    };

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
        images: transformImages(product.images),
        selectedSize: size.size,
        addedAt: Date.now()
      });
    }

    saveGuestCart(guestCart);
    return guestCart;
  };

  const handleAddToCart = async (product: Product, size: ProductSize): Promise<void> => {
    if (!isAuthenticated()) {
      try {
        setAddingToCart(product.id);
        addToGuestCart(product, size);
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

  return (
    <UserLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            <h1 className="text-3xl sm:text-4xl font-bold">New Arrivals</h1>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : products.length > 0 ? (
          /* Products Grid - Same layout as shop page */
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {products.map((product) => {
              const totalStockQty = getTotalStockQty(product);
              const availableSizes = getAvailableSizes(product);
              const hasStock = totalStockQty > 0 && availableSizes.length > 0;
              const displayPrice = getDisplayPrice(product);
              const originalPrice = getOriginalPrice(product);
              const productHasDiscount = hasDiscount(product);
              const shortDescription = getShortDescription(product.description || '');

              return (
                <Card
                  key={product.id}
                  className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col"
                  onClick={() => router.push(`/products/${product.id}`)}
                >
                  <div className="relative aspect-square overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={getProductImage(product)}
                      alt={product.name || 'Product image'}
                      className="object-contain w-full h-full transition-transform group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder-product.jpg";
                      }}
                    />
                    <span className="absolute top-2 left-2 bg-primary text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center gap-0.5 sm:gap-1 z-10">
                      <Sparkles className="h-2 w-2 sm:h-3 sm:w-3" />
                      New
                    </span>
                    {productHasDiscount && (
                      <span className="absolute top-2 left-16 sm:left-20 bg-green-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded z-10">
                        Sale
                      </span>
                    )}
                    {hasStock && totalStockQty < 10 && (
                      <span className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded z-10">
                        Only {totalStockQty} left
                      </span>
                    )}
                    {!hasStock && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded z-10">
                        Out of Stock
                      </span>
                    )}
                  </div>
                  <CardContent className="p-2 sm:p-3 lg:p-4 flex-1">
                    <h3 className="font-semibold text-xs sm:text-sm lg:text-base mb-0.5 sm:mb-1 line-clamp-1">
                      {product.name || 'Unnamed Product'}
                    </h3>
                    
                    <p className="text-[10px] sm:text-xs text-muted-foreground mb-1 sm:mb-2 line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
                      {shortDescription || 'No description available'}
                    </p>
                    
                    {/* Size Options */}
                    {product.sizes && product.sizes.length > 0 && (
                      <div className="mb-1 sm:mb-3 min-h-[1.5rem] sm:min-h-[2rem]">
                        <div className="flex flex-wrap gap-0.5 sm:gap-1.5">
                          {product.sizes.slice(0, 3).map((size) => {
                            const discountPercentage = getDiscountPercentage(size);
                            return (
                              <span
                                key={size.id}
                                className={`
                                  inline-flex items-center px-1 sm:px-2 py-0.5 sm:py-1 rounded text-[8px] sm:text-xs font-medium
                                  ${size.inStock && size.stockQty > 0
                                    ? 'bg-primary/10 text-primary border border-primary/30' 
                                    : 'bg-muted text-muted-foreground line-through'
                                  }
                                `}
                              >
                                {size.size}
                                {discountPercentage && size.inStock && (
                                  <span className="ml-0.5 sm:ml-1 text-green-600 font-bold">
                                    -{discountPercentage}%
                                  </span>
                                )}
                              </span>
                            );
                          })}
                          {product.sizes.length > 3 && (
                            <span className="text-[8px] sm:text-xs text-muted-foreground">
                              +{product.sizes.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Price Display */}
                    <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap mt-auto">
                      <p className="text-sm sm:text-lg lg:text-xl xl:text-2xl font-bold text-primary">
                        {displayPrice}
                      </p>
                      {originalPrice && productHasDiscount && (
                        <p className="text-[10px] sm:text-xs text-muted-foreground line-through">
                          {originalPrice}
                        </p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="p-2 sm:p-3 lg:p-4 pt-0 sm:pt-0 flex-shrink-0">
                    {hasStock && availableSizes.length > 0 ? (
                      <div className="w-full">
                        <Button
                          className="w-full text-[10px] sm:text-sm h-7 sm:h-9 lg:h-10 min-h-[2rem] sm:min-h-[2.5rem]"
                          size="sm"
                          disabled={addingToCart === product.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product, availableSizes[0]);
                          }}
                        >
                          {addingToCart === product.id ? (
                            <>
                              <Loader2 className="h-2 w-2 sm:h-3 sm:w-3 mr-1 animate-spin" />
                              <span className="hidden sm:inline">Adding...</span>
                              <span className="sm:hidden">...</span>
                            </>
                          ) : (
                            <>
                              <span className="hidden sm:inline">
                                Add to Cart {availableSizes.length > 1 ? `(${availableSizes[0].size})` : ''}
                              </span>
                              <span className="sm:hidden">
                                Add {availableSizes.length > 1 ? `(${availableSizes[0].size})` : ''}
                              </span>
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        className="w-full text-[10px] sm:text-sm h-7 sm:h-9 lg:h-10 min-h-[2rem] sm:min-h-[2.5rem]" 
                        size="sm"
                        disabled
                      >
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
            <h3 className="text-xl font-semibold mb-2">No new arrivals yet</h3>
            <p className="text-muted-foreground mb-4">
              Check back soon for new products!
            </p>
            <Button
              variant="outline"
              onClick={() => router.push("/shop")}
            >
              Browse All Products
            </Button>
          </div>
        )}
      </div>
    </UserLayout>
  );
}