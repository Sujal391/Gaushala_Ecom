"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  Upload,
  X,
  ShoppingBag,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { updateProduct, getProductById } from '../../../../../lib/api/auth';
import { toast } from 'sonner';
import AdminGuard from '../../../../../components/guards/AdminGuard';
import { removeAuthToken } from '../../../../../lib/api/config';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stockQty: '',
    description: '',
    image: '',
  });
  const [imagePreview, setImagePreview] = useState('');

  // Fetch product data from API on component mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        console.log('Fetching product with ID:', params.id); // Debug log
        
        // Call the getProductById API
        const response = await getProductById(params.id);
        
        console.log('API Response:', response); // Debug log
        
        // Check if response is valid and has data
        if (response && (response.id || response.data)) {
          const product = response.data || response;
          console.log('Product data for form:', product); // Debug log
          
          // Map API response to form fields
          setFormData({
            name: product.name || '',
            price: product.price?.toString() || '',
            stockQty: product.stockQty?.toString() || '',
            description: product.description || '',
            image: product.images?.[0] || '', // Take first image from array
          });
          setImagePreview(
            product.images?.[0]
              ? `https://gaushalaecommerce.runasp.net${product.images[0]}`
              : ''
          );
        } else {
          console.error('Invalid response format:', response);
          toast.error('Failed to load product details: Invalid response format');
          router.push('/admin/products');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error(`Failed to load product details: ${error.message}`);
        router.push('/admin/products');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    } else {
      toast.error('No product ID provided');
      router.push('/admin/products');
    }
  }, [params.id, router]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload a valid image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    if (!formData.stockQty || parseInt(formData.stockQty) < 0) {
      toast.error('Please enter a valid stock quantity');
      return;
    }

    setSubmitting(true);

    try {
      // Prepare payload for API
      const payload = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        stockQty: parseInt(formData.stockQty),
        description: formData.description.trim(),
        image: formData.image,
      };

      console.log('Updating product with payload:', payload); // Debug log
      
      // Call the updateProduct API
      const response = await updateProduct(params.id, payload);

      console.log('Update response:', response); // Debug log
      
      // Check if update was successful
      if (response && (response.success || response.data || !response.error)) {
        toast.success('Product updated successfully!');
        // Redirect to products list after successful update
        router.push('/admin/products');
      } else {
        toast.error(response?.message || response?.error || 'Failed to update product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(`An error occurred while updating the product: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: Package, label: 'Products', href: '/admin/products' },
    { icon: ShoppingCart, label: 'Orders', href: '/admin/orders' },
    { icon: Users, label: 'Customers', href: '/admin/customers' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
  ];

  const Sidebar = ({ isMobile = false }) => (
    <div className={`${isMobile ? 'w-full' : 'w-64'} bg-card border-r flex flex-col h-full`}>
      <div className="p-4 sm:p-6 border-b">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-8 w-8 text-primary" />
          <span className="text-xl sm:text-2xl font-bold">StyleHub Admin</span>
        </div>
      </div>

      <nav className="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.label}
            variant={item.href === '/admin/products' ? 'secondary' : 'ghost'}
            className="w-full justify-start gap-3 text-sm sm:text-base py-2 sm:py-3 h-auto"
            onClick={() => {
              router.push(item.href);
              if (isMobile) setIsSidebarOpen(false);
            }}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Button>
        ))}
      </nav>

      <div className="p-3 sm:p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sm sm:text-base text-destructive hover:text-destructive hover:bg-destructive/10 py-2 sm:py-3 h-auto"
          onClick={() => {
            removeAuthToken();
            router.push('/shop');
          }}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <AdminGuard>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading product...</p>
          </div>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block fixed left-0 top-0 h-full z-40">
          <Sidebar />
        </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-[280px] sm:w-[320px]">
                  <Sidebar isMobile={true} />
                </SheetContent>
              </Sheet>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/admin/products')}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back to Products</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Card className="max-w-3xl mx-auto">
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-5">
              <CardTitle className="text-xl sm:text-2xl">Edit Product</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-6">
              <div className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">Product Image</label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-h-64 mx-auto rounded-lg object-contain"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setImagePreview('');
                            setFormData({ ...formData, image: '' });
                          }}
                          disabled={submitting}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground mb-4">
                          Click to upload or drag and drop
                        </p>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="max-w-xs mx-auto"
                          disabled={submitting}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Product Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Product Name *
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter product name"
                    required
                    disabled={submitting}
                  />
                </div>

                {/* Price and Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium mb-2">
                      Price (₹) *
                    </label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label htmlFor="stock" className="block text-sm font-medium mb-2">
                      Stock Quantity *
                    </label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={formData.stockQty}
                      onChange={(e) => setFormData({ ...formData, stockQty: e.target.value })}
                      placeholder="0"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter product description"
                    rows={4}
                    disabled={submitting}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push('/admin/products')}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="flex-1"
                    onClick={handleSubmit}
                    disabled={submitting || !formData.name || !formData.price || !formData.stockQty}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Product'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
    </AdminGuard>
  );
}