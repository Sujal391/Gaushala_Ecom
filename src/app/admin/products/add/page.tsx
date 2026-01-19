"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
import { createProduct } from '../../../../lib/api/auth';
import { toast } from 'sonner';
import AdminGuard from '../../../../components/guards/AdminGuard';
import AdminLayout from '../../../../components/layout/AdminLayout';

export default function AddProductPage() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    sizes: '',
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      // Validate file sizes
      const invalidFiles = files.filter(file => file.size > 5 * 1024 * 1024);
      if (invalidFiles.length > 0) {
        toast.error('Some images are larger than 5MB');
        return;
      }

      // Validate file types
      const nonImageFiles = files.filter(file => !file.type.startsWith('image/'));
      if (nonImageFiles.length > 0) {
        toast.error('Please upload only image files');
        return;
      }

      // Append new files to existing ones
      setImageFiles(prev => [...prev, ...files]);  // Changed this line
      
      // Create previews for new images
      const previews = files.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(previews).then(results => {
        setImagePreviews(prev => [...prev, ...results]);  // Changed this line
      });
    }
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
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

    if (!formData.stock || parseInt(formData.stock) < 0) {
      toast.error('Please enter a valid stock quantity');
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();

      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('price', String(formData.price));
      formDataToSend.append('Description', formData.description.trim());
      formDataToSend.append('stockQty', String(formData.stock));
      formDataToSend.append('sizes', String(formData.sizes));

      imageFiles.forEach((file) => {
        formDataToSend.append('images', file);
      });

      const response = await createProduct(formDataToSend);

      if (response.success) {
        toast.success('Product created successfully!');
        router.push('/admin/products');
      } else {
        toast.error(response.message || 'Failed to create product');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error(`Failed to create product: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <AdminLayout title="Add Product" headerAction={headerAction}>
        <Card className="max-w-3xl mx-auto">
          <CardHeader className="px-4 sm:px-6 py-4 sm:py-5">
            <CardTitle className="text-xl sm:text-2xl">Add New Product</CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Hidden File Input */}
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={isSubmitting}
              />

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium mb-2">Product Images</label>
                <div className="border-2 border-dashed rounded-lg p-4 sm:p-6 text-center">
                  {imagePreviews.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 sm:h-48 object-contain rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8"
                              onClick={() => removeImage(index)}
                              disabled={isSubmitting}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={triggerFileInput}
                          disabled={isSubmitting}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Add more Images
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          className="flex-1"
                          onClick={() => {
                            setImagePreviews([]);
                            setImageFiles([]);
                          }}
                          disabled={isSubmitting}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remove All
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                      <p className="text-sm text-muted-foreground mb-3 sm:mb-4">
                        Click to upload or drag and drop
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={triggerFileInput}
                        disabled={isSubmitting}
                      >
                        Select Images
                      </Button>
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
                  disabled={isSubmitting}
                  className="text-sm sm:text-base"
                />
              </div>

              {/* Price and Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="size" className="block text-sm font-medium mb-2">
                    Sizes
                  </label>
                  <Input
                    id="size"
                    type="text"
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    placeholder="Enter sizes (e.g., S, M, L, XL)"
                    disabled={isSubmitting}
                    className="text-sm sm:text-base"
                  />
                </div>
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
                    disabled={isSubmitting}
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
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="0"
                    required
                    disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 py-3 sm:py-2"
                  disabled={!formData.name || !formData.price || !formData.stock || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Add Product'
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