"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Package,
  DollarSign,
  PackageOpen,
  TrendingUp,
  MessageSquare,
  ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { getAllProducts, deleteProduct } from '../../../lib/api/auth';
import AdminGuard from '../../../components/guards/AdminGuard';
import AdminLayout from '../../../components/layout/AdminLayout';

// TypeScript Interfaces
interface ProductImage {
  id: number;
  imageUrl: string;
}

interface ProductSize {
  id: number;
  size: string;
  price: number;
  discountedPrice: number | null;
  stockQty: number;
  inStock: boolean;
}

interface Product {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  basePrice: number;
  totalStockQty: number;
  sizes: ProductSize[];
  images: ProductImage[];
}

interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  message?: string;
}

type ProductsResponse = Product[] | ApiResponse<Product[]>;

// API Base URL - should be imported from config
const API_BASE_URL = 'https://gaushalaecommerce.runasp.net';

export default function AdminProductsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [products, setProducts] = useState<Product[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await getAllProducts() as ProductsResponse;
      
      // Check if response is an array (direct data) or has success property
      if (Array.isArray(response)) {
        setProducts(response);
        toast.success(`Loaded ${response.length} products`);
      } else if (response.success && response.data) {
        setProducts(response.data);
        toast.success(`Loaded ${response.data.length} products`);
      } else if (response.data && Array.isArray(response.data)) {
        setProducts(response.data);
        toast.success(`Loaded ${response.data.length} products`);
      } else {
        console.error('Failed to fetch products:', response);
        toast.error('Failed to load products: ' + ((response as ApiResponse<Product[]>).message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    setIsDeleting(true);
    try {
      const response = await deleteProduct(id) as ApiResponse<null>;
      
      if (response.success || response.message?.includes('success')) {
        setProducts(products.filter((p: Product) => p.id !== id));
        toast.success('Product deleted successfully!');
      } else {
        toast.error('Failed to delete product: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product. Please try again.');
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  // Helper function to get product image URL
  const getProductImageUrl = (product: Product): string => {
  if (!product.images || product.images.length === 0) {
    return 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400';
  }
  
  const firstImage = product.images[0];
  
  // Check if the image is a ProductImage object (has imageUrl property)
  if (firstImage && typeof firstImage === 'object' && 'imageUrl' in firstImage) {
    return `${API_BASE_URL}${firstImage.imageUrl}`;
  }
  
  // If it's a string (but according to types, it shouldn't be, so we need type assertion)
  // Or you can handle both cases if your API might return strings
  return 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400';
};

  const filteredProducts = products.filter((product: Product) =>
    product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTotalStock = (): number => {
    return products.reduce((sum: number, product: Product) => sum + (product.totalStockQty || 0), 0);
  };

  const getOutOfStockCount = (): number => {
    return products.filter((product: Product) => 
      (product.totalStockQty || 0) === 0 || 
      product.sizes?.every((size: ProductSize) => !size.inStock || size.stockQty === 0)
    ).length;
  };

  const getAveragePrice = (): string => {
    if (products.length === 0) return '0';
    const total = products.reduce((sum: number, product: Product) => sum + (product.basePrice || 0), 0);
    return (total / products.length).toFixed(2);
  };

  const getMostExpensiveProduct = (): number => {
    if (products.length === 0) return 0;
    return Math.max(...products.map((product: Product) => product.basePrice || 0));
  };

  const getAvailableSizes = (product: Product): string => {
    if (!Array.isArray(product.sizes)) return 'No sizes available';
    
    const availableSizes = product.sizes
      .filter((size: ProductSize) => size.inStock && size.stockQty > 0)
      .map((size: ProductSize) => size.size);
    
    return availableSizes.length > 0 
      ? availableSizes.join(', ')
      : 'Out of stock';
  };

  const getLowestPrice = (product: Product): number => {
    if (!Array.isArray(product.sizes) || product.sizes.length === 0) {
      return product.basePrice || 0;
    }
    
    const prices = product.sizes.map((size: ProductSize) => size.discountedPrice || size.price);
    return Math.min(...prices);
  };

  const getHighestPrice = (product: Product): number => {
    if (!Array.isArray(product.sizes) || product.sizes.length === 0) {
      return product.basePrice || 0;
    }
    
    const prices = product.sizes.map((size: ProductSize) => size.discountedPrice || size.price);
    return Math.max(...prices);
  };

  const formatPriceRange = (product: Product): string => {
    if (!Array.isArray(product.sizes) || product.sizes.length === 0) {
      return `₹ ${product.basePrice || 0}`;
    }
    
    const lowest = getLowestPrice(product);
    const highest = getHighestPrice(product);
    
    if (lowest === highest) {
      return `₹ ${lowest}`;
    }
    
    return `₹ ${lowest} - ₹ ${highest}`;
  };

  const hasDiscountedPrices = (product: Product): boolean => {
    if (!Array.isArray(product.sizes) || product.sizes.length === 0) return false;
    return product.sizes.some((size: ProductSize) => 
      size.discountedPrice !== null && 
      size.discountedPrice !== undefined && 
      size.discountedPrice < size.price
    );
  };

  const getDiscountedPriceRange = (product: Product): string | null => {
    if (!Array.isArray(product.sizes) || product.sizes.length === 0) {
      return null;
    }
    
    const discountedSizes = product.sizes.filter((size: ProductSize) => 
      size.discountedPrice !== null && 
      size.discountedPrice !== undefined && 
      size.discountedPrice < size.price
    );
    
    if (discountedSizes.length === 0) return null;
    
    const discountedPrices = discountedSizes.map((size: ProductSize) => size.discountedPrice as number);
    const minDiscounted = Math.min(...discountedPrices);
    const maxDiscounted = Math.max(...discountedPrices);
    
    if (minDiscounted === maxDiscounted) {
      return `₹ ${minDiscounted}`;
    }
    
    return `₹ ${minDiscounted} - ₹ ${maxDiscounted}`;
  };

  const getOriginalPriceRange = (product: Product): string => {
    if (!Array.isArray(product.sizes) || product.sizes.length === 0) {
      return `₹ ${product.basePrice || 0}`;
    }
    
    const originalPrices = product.sizes.map((size: ProductSize) => size.price);
    const minOriginal = Math.min(...originalPrices);
    const maxOriginal = Math.max(...originalPrices);
    
    if (minOriginal === maxOriginal) {
      return `₹ ${minOriginal}`;
    }
    
    return `₹ ${minOriginal} - ₹ ${maxOriginal}`;
  };

  const headerAction = (
    <Button onClick={() => router.push('/admin/products/add')} className="gap-2">
      <Plus className="h-4 w-4" />
      <span className="hidden sm:inline">Add Product</span>
      <span className="sm:hidden">Add</span>
    </Button>
  );

  return (
    <AdminGuard>
      <AdminLayout title="Products" headerAction={headerAction}>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Products</p>
                  <p className="text-xl sm:text-2xl font-bold">{products.length}</p>
                </div>
                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Stock</p>
                  <p className="text-xl sm:text-2xl font-bold">{getTotalStock()}</p>
                </div>
                <PackageOpen className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Avg Base Price</p>
                  <p className="text-xl sm:text-2xl font-bold">₹ {getAveragePrice()}</p>
                </div>
                <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Out of Stock</p>
                  <p className="text-xl sm:text-2xl font-bold">{getOutOfStockCount()}</p>
                </div>
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search products by name or description..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                onClick={fetchProducts} 
                variant="outline" 
                size="sm"
                className="gap-2 w-full sm:w-auto"
              >
                <Loader2 className="h-4 w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {filteredProducts.map((product: Product) => (
                <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square relative overflow-hidden bg-muted group">
                    <img
                      src={getProductImageUrl(product)}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400';
                      }}
                    />
                    
                    {/* Image count badge */}
                    {product.images && product.images.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                        <ImageIcon className="h-3 w-3" />
                        {product.images.length}
                      </div>
                    )}
                    
                    {/* Image navigation dots for multiple images (optional enhancement) */}
                    {product.images && product.images.length > 1 && (
                      <div className="absolute bottom-2 left-2 flex gap-1">
                        {product.images.slice(0, 3).map((_, index) => (
                          <div
                            key={index}
                            className={`h-1.5 w-1.5 rounded-full ${
                              index === 0 ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                        {product.images.length > 3 && (
                          <span className="text-xs text-white/70">+{product.images.length - 3}</span>
                        )}
                      </div>
                    )}
                    
                    {(product.totalStockQty || 0) === 0 && (
                      <div className="absolute top-2 right-2">
                        <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-base sm:text-lg mb-1 truncate">{product.name}</h3>
                    {/* Scrollable Description Container with preserved formatting */}
                    <div className="mb-2">
                      <div className="max-h-[80px] overflow-y-auto pr-1 text-xs sm:text-sm text-muted-foreground scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 whitespace-pre-wrap break-words">
                        {product.description || 'No description available'}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2 min-h-[40px]">
                      {getAvailableSizes(product)}
                    </p>
                    <div className="flex flex-col gap-1 mb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          {hasDiscountedPrices(product) ? (
                            <>
                              <span className="text-lg sm:text-xl font-bold text-primary">
                                {getDiscountedPriceRange(product)}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                {getOriginalPriceRange(product)}
                              </span>
                            </>
                          ) : (
                            <span className="text-lg sm:text-xl font-bold text-primary">
                              {formatPriceRange(product)}
                            </span>
                          )}
                        </div>
                        <span className={(product.totalStockQty || 0) === 0 ? 'text-destructive text-xs sm:text-sm' : 'text-muted-foreground text-xs sm:text-sm'}>
                          Stock: {product.totalStockQty || 0}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      {/* Edit + Delete row */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2 text-xs sm:text-sm"
                          onClick={() => router.push(`/admin/products/edit/${product.id}`)}
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          Edit
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1 gap-2 text-xs sm:text-sm"
                          onClick={() => setDeleteId(product.id)}
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          Delete
                        </Button>
                      </div>

                      {/* Reviews button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 text-xs sm:text-sm"
                        onClick={() => router.push(`/admin/products/reviews?productId=${product.id}&productName=${encodeURIComponent(product.name)}`)}
                      >
                        <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                        Reviews
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && !isLoading && (
              <div className="text-center py-8 sm:py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery ? 'Try adjusting your search query' : 'Get started by adding your first product'}
                </p>
                <Button onClick={() => router.push('/admin/products/add')} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Product
                </Button>
              </div>
            )}

            {/* Results Summary */}
            {filteredProducts.length > 0 && (
              <div className="mt-6 text-center text-sm text-muted-foreground">
                Showing {filteredProducts.length} of {products.length} products
              </div>
            )}
          </>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the product.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => deleteId !== null && handleDelete(deleteId)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </AdminGuard>
  );
}