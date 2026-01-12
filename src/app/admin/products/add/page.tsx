"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  TagIcon,
  Clock,
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
import { createProduct } from '../../../../lib/api/auth'; // Update this path
import AdminGuard from '../../../../components/guards/AdminGuard';
import { removeAuthToken } from '../../../../lib/api/config';

export default function AddProductPage() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImageFiles(files);
      
      // Create previews for all selected images
      const previews = files.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(previews).then(results => {
        setImagePreviews(results);
      });
    }
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.name || !formData.price || !formData.stock) {
    alert('Please fill in all required fields');
    return;
  }

  setIsSubmitting(true);

  try {
    const formDataToSend = new FormData();

    formDataToSend.append('name', formData.name);         // ✅ added
    formDataToSend.append('price', String(formData.price));        // ✅ string
    formDataToSend.append('Description', formData.description);
    formDataToSend.append('stockQty', String(formData.stock));     // ✅ string

    imageFiles.forEach((file) => {
      formDataToSend.append('images', file);                       // ✅ File
    });

    const response = await createProduct(formDataToSend);

    if (response.success) {
      alert('Product created successfully!');
      router.push('/admin/products');
    } else {
      alert(response.message || 'Failed to create product');
    }
  } catch (error) {
    console.error('Error creating product:', error);
    alert('Failed to create product. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};


  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: Package, label: 'Products', href: '/admin/products' },
    { icon: ShoppingCart, label: 'Orders', href: '/admin/orders' },
    { icon: Clock, label: 'Pending Orders', href: '/admin/pending' },
    { icon: TagIcon, label: 'Offers', href: '/admin/offer' },
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
              <CardTitle className="text-xl sm:text-2xl">Add New Product</CardTitle>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 pb-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2">Product Images</label>
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    {imagePreviews.length > 0 ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6"
                                onClick={() => removeImage(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="max-w-xs mx-auto"
                        />
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground mb-4">
                          Click to upload or drag and drop (Multiple images supported)
                        </p>
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="max-w-xs mx-auto"
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
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="stock" className="block text-sm font-medium mb-2">
                      Stock Quantity *
                    </label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="0"
                      required
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
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push('/admin/products')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={!formData.name || !formData.price || !formData.stock || isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Add Product'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
    </AdminGuard>
  );
}