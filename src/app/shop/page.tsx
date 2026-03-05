"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShoppingBag, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "../../hooks/useToast";
import UserLayout from "../../components/layout/UserLayout";
import { getAllProducts, addToCart, getAllBanners } from "../../lib/api/auth";
import { getUserId, isAuthenticated, API_BASE_URL } from "../../lib/api/config";
import { useCart } from "../../context/CartContext";
import type {
  Product,
  ProductSize,
  ApiResponse,
  Banner as ImportedBanner,
} from "../../types/index";
import NewProducts from "@/src/components/NewProducts";
import BannerSlider from "@/src/components/BannerSlider";

// Guest cart constants
const GUEST_CART_KEY = "guest_cart";

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

// Local Banner interface to match API response
interface Banner {
  id: number;
  imageUrl: string;
  createdAt: string;
}

// Type guard functions
function isProductArray(data: unknown): data is Product[] {
  return (
    Array.isArray(data) &&
    data.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "id" in item &&
        "name" in item &&
        "sizes" in item &&
        Array.isArray((item as Product).sizes)
    )
  );
}

function isApiResponse(response: unknown): response is ApiResponse<Product[]> {
  return (
    typeof response === "object" &&
    response !== null &&
    "success" in response &&
    "data" in response
  );
}

// Separate component that uses useSearchParams
function ShopContent() {
  const router = useRouter();
  const { toast } = useToast();
  const { incrementCartCount } = useCart();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [hasNewProducts, setHasNewProducts] = useState(true);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [deviceType, setDeviceType] = useState<string>('DESKTOP');

  // Refs for horizontal scroll
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Function to get device type based on screen width
  const getDeviceType = (): string => {
    if (typeof window === 'undefined') return 'DESKTOP'; // Default for SSR
    
    const width = window.innerWidth;
    if (width < 640) return 'MOBILE';
    if (width >= 640 && width < 1024) return 'TABLET';
    return 'DESKTOP';
  };

  useEffect(() => {
    loadProducts();
    
    // Set initial device type and load banners
    const initialDeviceType = getDeviceType();
    setDeviceType(initialDeviceType);
    loadBanners(initialDeviceType);

    // Handle window resize to update banners when device type changes
    const handleResize = () => {
      const newDeviceType = getDeviceType();
      if (newDeviceType !== deviceType) {
        setDeviceType(newDeviceType);
        loadBanners(newDeviceType);
      }
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
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

  const loadBanners = async (deviceType: string = 'DESKTOP') => {
    try {
      setBannersLoading(true);
      const response = await getAllBanners(deviceType);

      if (response.success && response.data && response.data.length > 0) {
        // Map the response data to match local Banner interface
        const bannerData: Banner[] = response.data.map(
          (item: ImportedBanner) => ({
            id: item.id,
            imageUrl: item.imageUrl,
            createdAt: item.createdAt || new Date().toISOString(),
          })
        );
        setBanners(bannerData);
      } else {
        // If no banners for current device type, try desktop as fallback
        if (deviceType !== 'DESKTOP') {
          console.log(`No ${deviceType} banners found, trying desktop...`);
          const desktopResponse = await getAllBanners('DESKTOP');
          if (desktopResponse.success && desktopResponse.data && desktopResponse.data.length > 0) {
            const bannerData: Banner[] = desktopResponse.data.map(
              (item: ImportedBanner) => ({
                id: item.id,
                imageUrl: item.imageUrl,
                createdAt: item.createdAt || new Date().toISOString(),
              })
            );
            setBanners(bannerData);
          } else {
            setBanners([]);
          }
        } else {
          setBanners([]);
        }
      }
    } catch (error) {
      console.error("Error loading banners:", error);
      setBanners([]);
    } finally {
      setBannersLoading(false);
    }
  };

  const getFullImageUrl = (imageUrl: string): string => {
    if (imageUrl.startsWith("http") || imageUrl.startsWith("https")) {
      return imageUrl;
    }
    return `${API_BASE_URL}${imageUrl}`;
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
          throw new Error("Invalid product data format");
        }
      } else if (
        response &&
        typeof response === "object" &&
        "data" in response
      ) {
        const possibleData = (response as any).data;
        if (isProductArray(possibleData)) {
          setProducts(possibleData);
          setFilteredProducts(possibleData);
        } else {
          throw new Error("Invalid product data format");
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
        description:
          error instanceof Error
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
        if (parsedCart.length > 0 && "id" in parsedCart[0]) {
          // Migrate old format to new format
          const migratedCart = parsedCart.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            description: item.description || "",
            price: item.price,
            quantity: item.quantity,
            images: Array.isArray(item.images)
              ? item.images
                  .map((img: any) => {
                    if (typeof img === "string") return img;
                    if (img && typeof img === "object" && "imageUrl" in img) {
                      return img.imageUrl;
                    }
                    return "";
                  })
                  .filter((url: string) => url !== "")
              : item.image
              ? [item.image]
              : [],
            selectedSize: item.selectedSize || "Default",
            addedAt:
              typeof item.addedAt === "string"
                ? Date.now()
                : item.addedAt || Date.now(),
          }));

          localStorage.setItem(GUEST_CART_KEY, JSON.stringify(migratedCart));
          return migratedCart;
        }

        if (parsedCart.length > 0 && "image" in parsedCart[0]) {
          const migratedCart = parsedCart.map((item: any) => ({
            productId: item.productId,
            productName: item.productName,
            description: item.description || "",
            price: item.price,
            quantity: item.quantity,
            images: item.image ? [item.image] : [],
            selectedSize: item.selectedSize || "Default",
            addedAt: item.addedAt || Date.now(),
          }));

          localStorage.setItem(GUEST_CART_KEY, JSON.stringify(migratedCart));
          return migratedCart;
        }

        return parsedCart;
      }

      return [];
    } catch (error) {
      console.error("Error loading guest cart:", error);
      return [];
    }
  };

  const saveGuestCart = (items: GuestCartItem[]) => {
    try {
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    } catch (error) {
      console.error("Error saving guest cart:", error);
    }
  };

  const addToGuestCart = (product: Product, size: ProductSize) => {
    const guestCart = getGuestCart();

    const existingItem = guestCart.find(
      (item) => item.productId === product.id && item.selectedSize === size.size
    );

    const transformImages = (images: any): string[] => {
      if (!images || !Array.isArray(images)) return [];

      return images
        .map((img) => {
          if (typeof img === "string") return img;
          if (img && typeof img === "object" && "imageUrl" in img) {
            return img.imageUrl;
          }
          return "";
        })
        .filter((url) => url !== "");
    };

    if (existingItem) {
      existingItem.quantity += 1;
      existingItem.addedAt = Date.now();
    } else {
      guestCart.push({
        productId: product.id,
        productName: product.name || "Unnamed Product",
        description: product.description || "",
        price: size.discountedPrice || size.price,
        quantity: 1,
        images: transformImages(product.images),
        selectedSize: size.size,
        addedAt: Date.now(),
      });
    }

    saveGuestCart(guestCart);
    return guestCart;
  };

  const handleAddToCart = async (
    product: Product,
    size: ProductSize
  ): Promise<void> => {
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

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: { data?: { message?: string } };
        };
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
    if (
      product.images &&
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      const firstImage = product.images[0];
      if (
        typeof firstImage === "object" &&
        firstImage !== null &&
        "imageUrl" in firstImage
      ) {
        return `${API_BASE_URL}${firstImage.imageUrl}`;
      }
      if (typeof firstImage === "string") {
        return `${API_BASE_URL}${firstImage}`;
      }
    }
    return "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400";
  };

  const getAvailableSizes = (product: Product): ProductSize[] => {
    return (
      product.sizes?.filter(
        (size): size is ProductSize =>
          size &&
          typeof size === "object" &&
          "inStock" in size &&
          size.inStock === true &&
          size.stockQty > 0
      ) || []
    );
  };

  const getDisplayPrice = (product: Product): string => {
    const availableSizes = getAvailableSizes(product);
    if (availableSizes.length > 0) {
      const prices = availableSizes.map((s) => s.discountedPrice || s.price);
      const minPrice = Math.min(...prices);
      return `₹ ${minPrice.toFixed(2)}`;
    }
    return `₹ ${Number(product.basePrice || 0).toFixed(2)}`;
  };

  const getOriginalPrice = (product: Product): string | null => {
    const availableSizes = getAvailableSizes(product);
    if (availableSizes.length > 0) {
      const hasDiscount = availableSizes.some(
        (s) => s.discountedPrice && s.discountedPrice < s.price
      );
      if (hasDiscount) {
        const minOriginalPrice = Math.min(
          ...availableSizes.map((s) => s.price)
        );
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
      return total + (typeof size.stockQty === "number" ? size.stockQty : 0);
    }, 0);
  };

  const hasDiscount = (product: Product): boolean => {
    const availableSizes = getAvailableSizes(product);
    return availableSizes.some(
      (s) => s.discountedPrice && s.discountedPrice < s.price
    );
  };

  const getDiscountPercentage = (size: ProductSize): number | null => {
    if (size.discountedPrice && size.discountedPrice < size.price) {
      return Math.round((1 - size.discountedPrice / size.price) * 100);
    }
    return null;
  };

  const getShortDescription = (description: string): string => {
    if (!description) return '';
    const words = description.split(' ');
    if (words.length <= 7) return description;
    return words.slice(0, 7).join(' ') + '...';
  };

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const newScroll =
        direction === "left"
          ? currentScroll - scrollAmount
          : currentScroll + scrollAmount;

      scrollContainerRef.current.scrollTo({
        left: newScroll,
        behavior: "smooth",
      });
    }
  };

  const searchQuery = searchParams.get("search");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Banner Carousel - Using BannerSlider component */}
      <section className="h-[30vh] bg-gray-100 relative overflow-hidden">
        {bannersLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : banners.length > 0 ? (
          <BannerSlider 
            banners={banners.map(banner => ({
              id: banner.id,
              imageUrl: getFullImageUrl(banner.imageUrl)
            }))}
            autoSlideInterval={4000}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="text-center">
              <p className="text-gray-500 mb-2">No banners available for {deviceType.toLowerCase()} device</p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => loadBanners(deviceType)}
                className="text-xs"
              >
                Retry
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* New Arrivals Section - Horizontal Scroll with View All */}
      {hasNewProducts && (
        <section className="h-[18vh] md:h-[30vh] bg-white border-b overflow-hidden">
          <div className="h-full container mx-auto px-4 sm:px-6 lg:px-8 py-2 md:py-4">
            <div className="flex items-center justify-between mb-1 md:mb-2">
              <h2 className="text-base md:text-lg lg:text-xl font-bold">
                New Arrivals
              </h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs md:text-sm text-primary hover:text-primary/80"
                onClick={() => router.push("/new-products")}
              >
                View All
                <ChevronRight className="h-3 w-3 md:h-4 md:w-4 ml-1" />
              </Button>
            </div>

            <div className="h-[calc(100%-2rem)] md:h-[calc(100%-2.5rem)] relative group">
              {/* Scroll Buttons - Hidden on mobile, visible on desktop hover */}
              <button
                onClick={() => handleScroll("left")}
                className="hidden md:block absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:opacity-0"
                aria-label="Scroll left"
                disabled={
                  !scrollContainerRef.current ||
                  scrollContainerRef.current.scrollLeft <= 0
                }
              >
                <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
              </button>

              <button
                onClick={() => handleScroll("right")}
                className="hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 p-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
              </button>

              {/* Horizontal Scroll Container - Native scroll on mobile, smooth scroll on desktop */}
              <div
                ref={scrollContainerRef}
                className="overflow-x-auto scrollbar-hide h-full flex gap-2 md:gap-4 pb-2"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                <Suspense
                  fallback={
                    <div className="flex items-center justify-center w-full h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  }
                >
                  <div className="flex gap-2 md:gap-4 min-w-max pb-1">
                    <NewProducts 
                      limit={10} 
                      showViewAll={false} 
                      onEmpty={() => setHasNewProducts(false)}
                    />
                  </div>
                </Suspense>
              </div>

              {/* Gradient fade indicators - Hidden on mobile */}
              <div className="hidden md:block absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              <div className="hidden md:block absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            </div>
          </div>
        </section>
      )}

      {/* Shop Products Section - Remaining height */}
      <section className="flex-1 overflow-y-auto bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
          {/* Page Header */}
          <div className="mb-4 md:mb-6">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1">
              {searchQuery
                ? `Search Results for "${searchQuery}"`
                : "Shop All Products"}
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              {searchQuery
                ? `Found ${filteredProducts.length} product${
                    filteredProducts.length !== 1 ? "s" : ""
                  }`
                : "Discover our latest collection"}
            </p>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin text-primary" />
            </div>
          ) : filteredProducts.length > 0 ? (
            /* Products Grid - 2 columns on mobile, 4 on desktop */
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
              {filteredProducts.map((product) => {
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
                        alt={product.name || "Product image"}
                        className="object-contain w-full h-full transition-transform group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder-product.jpg";
                        }}
                      />
                      {productHasDiscount && (
                        <span className="absolute top-1 left-1 md:top-2 md:left-2 bg-green-500 text-white text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded">
                          Sale
                        </span>
                      )}
                      {hasStock && totalStockQty < 10 && (
                        <span className="absolute top-1 right-1 md:top-2 md:right-2 bg-orange-500 text-white text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded">
                          Only {totalStockQty} left
                        </span>
                      )}
                      {!hasStock && (
                        <span className="absolute top-1 right-1 md:top-2 md:right-2 bg-red-500 text-white text-[10px] md:text-xs px-1.5 md:px-2 py-0.5 md:py-1 rounded">
                          Out of Stock
                        </span>
                      )}
                    </div>
                    <CardContent className="p-2 md:p-4 flex-1">
                      <h3 className="font-semibold text-xs md:text-sm lg:text-base mb-1 line-clamp-1">
                        {product.name || "Unnamed Product"}
                      </h3>

                      <p className="text-[10px] md:text-xs text-muted-foreground mb-2 line-clamp-2 min-h-[2rem] md:min-h-[2.5rem]">
                        {shortDescription || 'No description available'}
                      </p>

                      {/* Size Options */}
                      {product.sizes && product.sizes.length > 0 && (
                        <div className="mb-1 md:mb-2 min-h-[1.5rem] md:min-h-[2rem]">
                          <div className="flex flex-wrap gap-1">
                            {product.sizes.slice(0, 3).map((size) => {
                              const discountPercentage =
                                getDiscountPercentage(size);
                              return (
                                <span
                                  key={size.id}
                                  className={`
                                    inline-flex items-center px-1 md:px-1.5 py-0.5 rounded text-[8px] md:text-xs font-medium
                                    ${
                                      size.inStock && size.stockQty > 0
                                        ? "bg-primary/10 text-primary border border-primary/30"
                                        : "bg-muted text-muted-foreground line-through"
                                    }
                                  `}
                                >
                                  {size.size}
                                  {discountPercentage && size.inStock && (
                                    <span className="ml-0.5 text-[8px] md:text-xs text-green-600 font-bold">
                                      -{discountPercentage}%
                                    </span>
                                  )}
                                </span>
                              );
                            })}
                            {product.sizes.length > 3 && (
                              <span className="text-[8px] md:text-xs text-muted-foreground">
                                +{product.sizes.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Price Display */}
                      <div className="flex items-baseline gap-1 md:gap-2 mt-auto">
                        <p className="text-sm md:text-lg lg:text-xl font-bold text-primary">
                          {displayPrice}
                        </p>
                        {originalPrice && productHasDiscount && (
                          <p className="text-[10px] md:text-sm text-muted-foreground line-through">
                            {originalPrice}
                          </p>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="p-2 md:p-4 pt-0 md:pt-0 flex-shrink-0">
                      {hasStock && availableSizes.length > 0 ? (
                        <Button
                          size="sm"
                          className="w-full text-xs md:text-sm py-1 md:py-2 h-auto min-h-[2rem] md:min-h-[2.5rem]"
                          disabled={addingToCart === product.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToCart(product, availableSizes[0]);
                          }}
                        >
                          {addingToCart === product.id ? (
                            <>
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              <span className="hidden md:inline">Adding...</span>
                              <span className="md:hidden">Adding...</span>
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
                      ) : (
                        <Button
                          size="sm"
                          className="w-full text-xs md:text-sm py-1 md:py-2 h-auto min-h-[2rem] md:min-h-[2.5rem]"
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
            <div className="text-center py-6 md:py-8">
              <ShoppingBag className="h-10 w-10 md:h-12 md:w-12 mx-auto text-muted-foreground mb-2" />
              <h3 className="text-base md:text-lg font-semibold mb-1">
                {searchQuery
                  ? "No products found"
                  : "No products available yet"}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground mb-2">
                {searchQuery
                  ? `No products found for "${searchQuery}". Try different keywords.`
                  : "Check back soon for new arrivals!"}
              </p>
              <div className="flex gap-2 justify-center">
                {searchQuery && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={() => router.push("/shop")}
                  >
                    View All
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs"
                  onClick={() => {
                    loadProducts();
                    loadBanners(deviceType);
                  }}
                >
                  Refresh
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Add custom scrollbar hide styles */}
      <style jsx global>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

// Loading fallback component
function ShopLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

// Main page component with Suspense
export default function ShopPage() {
  return (
    <UserLayout>
      <Suspense fallback={<ShopLoadingFallback />}>
        <ShopContent />
      </Suspense>
    </UserLayout>
  );
}