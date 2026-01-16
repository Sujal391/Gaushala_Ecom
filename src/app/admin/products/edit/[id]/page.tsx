"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Upload,
  X,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { updateProduct, getProductById } from '../../../../../lib/api/auth';
import { toast } from 'sonner';
import AdminGuard from '../../../../../components/guards/AdminGuard';
import AdminLayout from '../../../../../components/layout/AdminLayout';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
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
        console.log('Fetching product with ID:', params.id);
        
        const response = await getProductById(params.id);
        
        console.log('API Response:', response);
        
        if (response && (response.id || response.data)) {
          const product = response.data || response;
          console.log('Product data for form:', product);
          
          setFormData({
            name: product.name || '',
            price: product.price?.toString() || '',
            stockQty: product.stockQty?.toString() || '',
            description: product.description || '',
            image: product.images?.[0] || '',
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
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

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
      const payload = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        stockQty: parseInt(formData.stockQty),
        description: formData.description.trim(),
        image: formData.image,
      };

      console.log('Updating product with payload:', payload);
      
      const response = await updateProduct(params.id, payload);

      console.log('Update response:', response);
      
      if (response && (response.success || response.data || !response.error)) {
        toast.success('Product updated successfully!');
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

  const headerAction = (
    <Button
      variant="outline"
      size="sm"
      onClick={() => router.push('/admin/products')}
      className="gap-2"
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="hidden sm:inline">Back to Products</span>
      <span className="sm:hidden">Back</span>
    </Button>
  );

  return (
    <AdminGuard>
      <AdminLayout title="Edit Product" headerAction={headerAction}>
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="px-4 sm:px-6 py-4 sm:py-5">
            <CardTitle className="text-xl sm:text-2xl">Edit Product</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Product Image</label>
                <div className="border-2 border-dashed rounded-lg p-4 sm:p-6 text-center">
                  {imagePreview ? (
                    <div className="relative max-w-md mx-auto">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 sm:h-64 mx-auto rounded-lg object-contain"
                      />
                      <div className="flex flex-col sm:flex-row gap-2 mt-4">
                        <label className="cursor-pointer flex-1">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            disabled={submitting}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Change Image
                          </Button>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={submitting}
                          />
                        </label>
                        <Button
                          type="button"
                          variant="destructive"
                          className="flex-1"
                          onClick={() => {
                            setImagePreview('');
                            setFormData({ ...formData, image: '' });
                          }}
                          disabled={submitting}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                      <p className="text-sm text-muted-foreground mb-3 sm:mb-4">
                        Click to upload or drag and drop
                      </p>
                      <label className="cursor-pointer">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full sm:w-auto"
                          disabled={submitting}
                        >
                          Select Image
                        </Button>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={submitting}
                        />
                      </label>
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
                  className="text-sm sm:text-base"
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
                    className="text-sm sm:text-base"
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
                    className="text-sm sm:text-base"
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
                  className="text-sm sm:text-base resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 py-3 sm:py-2"
                  onClick={() => router.push('/admin/products')}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 py-3 sm:py-2"
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
            </form>
          </CardContent>
        </Card>
      </AdminLayout>
    </AdminGuard>
  );
}