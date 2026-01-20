"use client";

import { useState, useEffect, useRef } from 'react';
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
import { getProductById } from '../../../../../lib/api/auth';
import { toast } from 'sonner';
import AdminGuard from '../../../../../components/guards/AdminGuard';
import AdminLayout from '../../../../../components/layout/AdminLayout';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    sizes: '',
    price: '',
    stockQty: '',
    description: '',
  });
  const [existingImages, setExistingImages] = useState([]); // URLs from server
  const [newImageFiles, setNewImageFiles] = useState([]); // New files to upload
  const [imagePreviews, setImagePreviews] = useState([]); // All previews for display

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
            sizes: Array.isArray(product.sizes) 
              ? product.sizes.join(', ') 
              : product.sizes || '',
            price: product.price?.toString() || '',
            stockQty: product.stockQty?.toString() || '',
            description: product.description || '',
          });
          
          const imageUrls = product.images || [];
          setExistingImages(imageUrls);
          setImagePreviews(
            imageUrls.map(img => `https://gaushalaecommerce.runasp.net${img}`)
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

      // Append new files
      setNewImageFiles(prev => [...prev, ...files]);
      
      // Create previews for new images
      const previews = files.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(previews).then(results => {
        setImagePreviews(prev => [...prev, ...results]);
      });
    }
  };

  const removeImage = (index) => {
    const totalExistingImages = existingImages.length;
    
    if (index < totalExistingImages) {
      // Removing an existing image
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      // Removing a new image
      const newImageIndex = index - totalExistingImages;
      setNewImageFiles(prev => prev.filter((_, i) => i !== newImageIndex));
    }
    
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

    if (!formData.stockQty || parseInt(formData.stockQty) < 0) {
      toast.error('Please enter a valid stock quantity');
      return;
    }

    setSubmitting(true);

    try {
      // Parse sizes
      const sizesArray = formData.sizes
        .split(',')
        .map(size => size.trim())
        .filter(Boolean);

      // Create FormData object
      const formDataObj = new FormData();

      // Fetch existing images and convert to blobs
      const existingImageBlobs = await Promise.all(
        existingImages.map(async (imageUrl) => {
          try {
            const fullUrl = `https://gaushalaecommerce.runasp.net${imageUrl}`;
            const response = await fetch(fullUrl);
            const blob = await response.blob();
            const filename = imageUrl.split('/').pop() || 'existing-image.jpg';
            return new File([blob], filename, { type: blob.type });
          } catch (error) {
            console.error('Error fetching existing image:', imageUrl, error);
            return null;
          }
        })
      );

      // Filter out any failed image fetches
      const validExistingImages = existingImageBlobs.filter(img => img !== null);

      // Add all images (existing + new) to FormData
      validExistingImages.forEach((file) => {
        formDataObj.append('Images', file);
      });

      newImageFiles.forEach((file) => {
        formDataObj.append('Images', file);
      });

      // Build query parameters
      const queryParams = new URLSearchParams({
        Name: formData.name.trim(),
        Price: parseFloat(formData.price).toString(),
        StockQty: parseInt(formData.stockQty).toString(),
        Description: formData.description.trim(),
      });

      // Add sizes as array parameters
      sizesArray.forEach(size => {
        queryParams.append('Sizes', size);
      });

      // Build the URL with query parameters
      const url = `https://gaushalaecommerce.runasp.net/api/products/${params.id}?${queryParams.toString()}`;

      console.log('Updating product with URL:', url);
      console.log('Total images:', validExistingImages.length + newImageFiles.length);

      // Get auth token
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        router.push('/login');
        return;
      }

      // Make the API call directly
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Don't set Content-Type - let browser set it with boundary for multipart/form-data
        },
        body: formDataObj,
      });

      console.log('Update response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      // Try to parse response
      const contentType = response.headers.get('content-type');
      let result;
      
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        result = { success: true };
      }

      console.log('Update result:', result);
      
      toast.success('Product updated successfully!');
      router.push('/admin/products');
      
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
              {/* Hidden File Input */}
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={submitting}
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
                              disabled={submitting}
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
                          disabled={submitting}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Add More Images
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          className="flex-1"
                          onClick={() => {
                            setImagePreviews([]);
                            setNewImageFiles([]);
                            setExistingImages([]);
                          }}
                          disabled={submitting}
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
                        disabled={submitting}
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
                  disabled={submitting}
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
                    placeholder="S, M, L, XL"
                    disabled={submitting}
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