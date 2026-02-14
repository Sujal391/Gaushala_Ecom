"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  X,
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createProduct, uploadProductImages } from '../../../../lib/api/auth'; // Add uploadProductImages import
import { toast } from 'sonner';
import AdminGuard from '../../../../components/guards/AdminGuard';
import AdminLayout from '../../../../components/layout/AdminLayout';
import { API_BASE_URL, API_ENDPOINTS } from '../../../../lib/api/config';

interface SizeItem {
  size: string;
  price: string;
  discountedPrice: string;
  stockQty: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [sizes, setSizes] = useState<SizeItem[]>([
    { size: '', price: '', discountedPrice: '', stockQty: '' }
  ]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setImageFiles(prev => [...prev, ...files]);
      
      // Create previews for new images
      const previews = files.map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(previews).then(results => {
        setImagePreviews(prev => [...prev, ...results]);
      });
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSizeChange = (index: number, field: keyof SizeItem, value: string) => {
    const updatedSizes = [...sizes];
    updatedSizes[index] = { ...updatedSizes[index], [field]: value };
    setSizes(updatedSizes);
  };

  const addSize = () => {
    setSizes([...sizes, { size: '', price: '', discountedPrice: '', stockQty: '' }]);
  };

  const removeSize = (index: number) => {
    if (sizes.length > 1) {
      setSizes(sizes.filter((_, i) => i !== index));
    } else {
      // Reset the single size if trying to remove the last one
      setSizes([{ size: '', price: '', discountedPrice: '', stockQty: '' }]);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return false;
    }

    // Validate sizes
    for (let i = 0; i < sizes.length; i++) {
      const sizeItem = sizes[i];
      
      if (!sizeItem.size.trim()) {
        toast.error(`Size name is required for size ${i + 1}`);
        return false;
      }

      if (!sizeItem.price || parseFloat(sizeItem.price) <= 0) {
        toast.error(`Please enter a valid price for ${sizeItem.size || `size ${i + 1}`}`);
        return false;
      }

      if (sizeItem.discountedPrice && parseFloat(sizeItem.discountedPrice) >= parseFloat(sizeItem.price)) {
        toast.error(`Discounted price must be less than original price for ${sizeItem.size}`);
        return false;
      }

      if (!sizeItem.stockQty || parseInt(sizeItem.stockQty) < 0) {
        toast.error(`Please enter a valid stock quantity for ${sizeItem.size || `size ${i + 1}`}`);
        return false;
      }
    }

    return true;
  };

  const uploadImages = async (productId: string | number) => {
  if (imageFiles.length === 0) {
    console.log('No images to upload');
    return true;
  }

  try {
    const formDataToSend = new FormData();
    
    // Add images
    imageFiles.forEach((file) => {
      formDataToSend.append('images', file);
    });

    console.log('=== IMAGE UPLOAD DEBUG INFO ===');
    console.log('Product ID:', productId);
    console.log('Number of images:', imageFiles.length);
    
    // Debug the API endpoint
    console.log('API_ENDPOINTS.PRODUCTS.UPLOAD_IMAGE is a function');
    
    // Since UPLOAD_IMAGE is a function, call it with the product ID
    const uploadEndpoint = API_ENDPOINTS.PRODUCTS.UPLOAD_IMAGE;
    
    if (typeof uploadEndpoint === 'function') {
      const endpoint = uploadEndpoint(productId.toString());
      console.log('Generated endpoint:', endpoint);
    } else {
      console.error('UPLOAD_IMAGE is not a function:', uploadEndpoint);
      toast.error('Image upload configuration error');
      return false;
    }
    
    // Call the API utility function
    console.log('Calling uploadProductImages API...');
    const response = await uploadProductImages(productId, formDataToSend);
    
    console.log('Image upload API response:', response);
    
    if (response.success) {
      toast.success('Images uploaded successfully!');
      return true;
    } else {
      console.error('Image upload failed:', response);
      toast.error(response.message || 'Failed to upload images');
      return false;
    }
  } catch (error) {
    console.error('Error uploading images:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    toast.error('Failed to upload product images');
    return false;
  }
};

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) {
    return;
  }

  setIsSubmitting(true);

  try {
    // Step 1: Create the product with basic info
    const productData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      sizes: sizes.map(sizeItem => ({
        size: sizeItem.size.trim(),
        price: parseFloat(sizeItem.price),
        discountedPrice: sizeItem.discountedPrice ? parseFloat(sizeItem.discountedPrice) : 0,
        stockQty: parseInt(sizeItem.stockQty)
      }))
    };

    // Create product first
    const createResponse = await createProduct(productData);

    if (!createResponse.success) {
      toast.error(createResponse.message || 'Failed to create product');
      setIsSubmitting(false);
      return;
    }

    // Debug log to see the actual response
    console.log('Product creation response:', createResponse);

    // Get the created product ID from the response
    // Try different possible fields based on API response
    const productId = createResponse.data?.productId;

if (!productId) {
  console.error('Product ID not found in response:', createResponse);
  toast.error('Product created but could not get product ID from response');
  setIsSubmitting(false);
  return;
}

    
    if (!productId) {
      console.error('Product ID not found in response:', createResponse);
      toast.error('Product created but could not get product ID from response');
      setIsSubmitting(false);
      return;
    }

    console.log('Extracted product ID:', productId);

    // Step 2: Upload images if any
    if (imageFiles.length > 0) {
      toast.info('Uploading images...');
      const uploadSuccess = await uploadImages(productId);
      if (!uploadSuccess) {
        // Even if image upload fails, product was created successfully
        toast.warning('Product created but image upload failed');
      }
    }

    // Success message
    toast.success('Product created successfully!');
    router.push('/admin/products');
    
  } catch (error) {
    console.error('Error creating product:', error);
    toast.error(`Failed to create product: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        <Card className="max-w-4xl mx-auto">
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
                <Label>Product Images (Optional - Can be added later)</Label>
                <div className="border-2 border-dashed rounded-lg p-4 sm:p-6 text-center mt-2">
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
                <Label htmlFor="name">
                  Product Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter product name"
                  required
                  disabled={isSubmitting}
                  className="text-sm sm:text-base mt-2"
                />
              </div>

              {/* Sizes Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-lg">Sizes & Pricing *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSize}
                    disabled={isSubmitting}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Size
                  </Button>
                </div>

                <div className="space-y-4">
                  {sizes.map((sizeItem, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <Label className="text-base">Size {index + 1}</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSize(index)}
                          disabled={isSubmitting || sizes.length === 1}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div>
                          <Label htmlFor={`size-${index}`} className="text-sm">
                            Size Name *
                          </Label>
                          <Input
                            id={`size-${index}`}
                            type="text"
                            value={sizeItem.size}
                            onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                            placeholder="e.g., S, M, L, XL"
                            required
                            disabled={isSubmitting}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`price-${index}`} className="text-sm">
                            Price (₹) *
                          </Label>
                          <Input
                            id={`price-${index}`}
                            type="number"
                            step="0.01"
                            min="0"
                            value={sizeItem.price}
                            onChange={(e) => handleSizeChange(index, 'price', e.target.value)}
                            placeholder="0.00"
                            required
                            disabled={isSubmitting}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`discountedPrice-${index}`} className="text-sm">
                            Discounted Price (₹)
                          </Label>
                          <Input
                            id={`discountedPrice-${index}`}
                            type="number"
                            step="0.01"
                            min="0"
                            value={sizeItem.discountedPrice}
                            onChange={(e) => handleSizeChange(index, 'discountedPrice', e.target.value)}
                            placeholder="0.00"
                            disabled={isSubmitting}
                            className="mt-2"
                          />
                        </div>

                        <div>
                          <Label htmlFor={`stockQty-${index}`} className="text-sm">
                            Stock Quantity *
                          </Label>
                          <Input
                            id={`stockQty-${index}`}
                            type="number"
                            min="0"
                            value={sizeItem.stockQty}
                            onChange={(e) => handleSizeChange(index, 'stockQty', e.target.value)}
                            placeholder="0"
                            required
                            disabled={isSubmitting}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter product description"
                  rows={4}
                  disabled={isSubmitting}
                  className="text-sm sm:text-base resize-none mt-2"
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
                  disabled={isSubmitting}
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