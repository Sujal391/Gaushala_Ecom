"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Upload,
  X,
  ArrowLeft,
  Loader2,
  Plus,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import AdminGuard from '../../../../../components/guards/AdminGuard';
import AdminLayout from '../../../../../components/layout/AdminLayout';
import { API_BASE_URL, getAuthToken } from '@/src/lib/api/config';

// Import auth helpers from config
import {
  getProductById,  // Add this import
  deleteProductImages,
  uploadProductImages
} from '../../../../../lib/api/auth';

// Types
interface ProductSize {
  size: string;
  price: number;
  discountedPrice: number;
  stockQty: number;
}

interface Product {
  id: number;
  name: string;
  description: string | null;
  sizes: ProductSize[] | null;
  images: {
    id: number;
    imageUrl: string;
  }[];
}

interface ExistingImage {
  id: number;
  url: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  
  // Sizes state
  const [sizes, setSizes] = useState<ProductSize[]>([]);
  
  // Images state
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]);

  // Fetch product data from API on component mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        console.log('Fetching product with ID:', params.id);
        
        // Use getProductById from auth.ts
        const response = await getProductById(params.id as string);
        
        console.log('API Response:', response);
        
        if (response.success && response.data) {
          const product = response.data;
          
          setFormData({
            name: product.name || '',
            description: product.description || '',
          });
          
          // Set sizes
          if (product.sizes && Array.isArray(product.sizes)) {
            setSizes(product.sizes);
          }
          
          // Map existing images with IDs
          const imagesWithIds: ExistingImage[] = [];
          const previewUrls: string[] = [];
          
          if (product.images && Array.isArray(product.images)) {
            console.log('Processing images:', product.images);
            
            product.images.forEach((img: any) => {
              // Extract URL and ID from the object format
              if (img && typeof img === 'object') {
                const imageUrl = img.imageUrl || '';
                const imageId = img.id || 0;
                
                console.log('Processing image:', { id: imageId, imageUrl });
                
                if (imageUrl) {
                  imagesWithIds.push({
                    id: imageId,
                    url: imageUrl
                  });
                  
                  // Build full image URL for preview
                  let fullImageUrl = imageUrl;
                  
                  // Check if it's already a complete URL
                  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
                    fullImageUrl = imageUrl;
                  } else {
                    // Remove leading slash if present and construct full URL
                    const baseUrl = API_BASE_URL.replace(/\/$/, '');
                    const imagePath = imageUrl.replace(/^\//, '');
                    fullImageUrl = `${baseUrl}/${imagePath}`;
                  }
                  
                  console.log('Full image URL:', fullImageUrl);
                  previewUrls.push(fullImageUrl);
                }
              }
            });
          }
          
          console.log('Final imagesWithIds:', imagesWithIds);
          console.log('Final previewUrls:', previewUrls);
          
          setExistingImages(imagesWithIds);
          setImagePreviews(previewUrls);
        } else {
          toast.error(response.message || 'Failed to load product details');
          router.push('/admin/products');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error(`Failed to load product details: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  // Size management functions
  const addSize = () => {
    setSizes([
      ...sizes,
      {
        size: '',
        price: 0,
        discountedPrice: 0,
        stockQty: 0
      }
    ]);
  };

  const updateSize = (index: number, field: keyof ProductSize, value: string | number) => {
    const updatedSizes = [...sizes];
    
    if (field === 'size') {
      updatedSizes[index][field] = value as string;
    } else {
      updatedSizes[index][field] = value === '' ? 0 : Number(value);
    }
    
    setSizes(updatedSizes);
  };

  const removeSize = (index: number) => {
    setSizes(sizes.filter((_, i) => i !== index));
  };

  // Image management functions
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

      // Append new files
      setNewImageFiles(prev => [...prev, ...files]);
      
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
    const totalExistingImages = existingImages.length;
    
    if (index < totalExistingImages) {
      // Removing an existing image - track its ID for deletion
      const removedImage = existingImages[index];
      setImagesToDelete(prev => [...prev, removedImage.id]);
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

  // Validation functions
  const validateSizes = (): boolean => {
    if (sizes.length === 0) {
      toast.error('At least one size is required');
      return false;
    }

    for (let i = 0; i < sizes.length; i++) {
      const size = sizes[i];
      
      if (!size.size.trim()) {
        toast.error(`Size #${i + 1}: Size name is required`);
        return false;
      }
      
      if (size.price <= 0) {
        toast.error(`Size #${i + 1}: Price must be greater than 0`);
        return false;
      }
      
      if (size.discountedPrice < 0 || size.discountedPrice > size.price) {
        toast.error(`Size #${i + 1}: Discounted price must be between 0 and ${size.price}`);
        return false;
      }
      
      if (size.stockQty < 0) {
        toast.error(`Size #${i + 1}: Stock quantity cannot be negative`);
        return false;
      }
    }

    return true;
  };

  // Main submit handler with proper API workflow
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }

    if (!validateSizes()) {
      return;
    }

    setSubmitting(true);

    try {
      const token = getAuthToken();
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        router.push('/login');
        return;
      }

      // STEP 1: Delete images if any are marked for deletion
      if (imagesToDelete.length > 0) {
        console.log('Deleting images with IDs:', imagesToDelete);
        const deleteResult = await deleteProductImages(params.id as string, imagesToDelete);
        
        if (!deleteResult.success) {
          throw new Error(`Failed to delete images: ${deleteResult.message}`);
        }
        console.log('Images deleted successfully');
      }

      // STEP 2: Upload new images if any
      if (newImageFiles.length > 0) {
        console.log('Uploading new images:', newImageFiles.length);
        const uploadFormData = new FormData();
        newImageFiles.forEach((file) => {
          uploadFormData.append('images', file);
        });

        const uploadResult = await uploadProductImages(params.id as string, uploadFormData);
        
        if (!uploadResult.success) {
          throw new Error(`Failed to upload images: ${uploadResult.message}`);
        }
        console.log('Images uploaded successfully');
      }

      // STEP 3: Update product details
      console.log('Updating product details');
      
      // Prepare the update payload according to the API spec
      const updatePayload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        sizes: sizes
      };

      const updateResponse = await fetch(`${API_BASE_URL}/api/products/${params.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error('Error response:', errorText);
        
        if (updateResponse.status === 401) {
          toast.error('Your session has expired. Please log in again.');
          router.push('/login');
          return;
        }
        
        throw new Error(`Failed to update product details. Status: ${updateResponse.status}`);
      }

      toast.success('Product updated successfully!');
      router.push('/admin/products');
      
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(`An error occurred while updating the product: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
        <Card className="max-w-4xl mx-auto">
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

              {/* Image Upload Section */}
              <div>
                <label className="block text-sm font-medium mb-2">Product Images</label>
                <div className="border-2 border-dashed rounded-lg p-4 sm:p-6 text-center">
                  {imagePreviews.length > 0 ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            {preview && (
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 sm:h-48 object-contain rounded-lg border"
                                onError={(e) => {
                                  // Fallback for broken images
                                  (e.target as HTMLImageElement).src = '/placeholder-image.png';
                                }}
                              />
                            )}
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(index)}
                              disabled={submitting}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            {index < existingImages.length && (
                              <span className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                Existing
                              </span>
                            )}
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
                            // Mark all existing images for deletion
                            setImagesToDelete(prev => [...prev, ...existingImages.map(img => img.id)]);
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

              {/* Sizes Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium">
                    Product Sizes *
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSize}
                    disabled={submitting}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Size
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {sizes.map((size, index) => (
                    <Card key={index} className="relative">
                      <CardContent className="p-4">
                        <div className="absolute top-2 right-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeSize(index)}
                            disabled={submitting}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                          <div className="lg:col-span-1">
                            <label className="block text-xs font-medium mb-1">
                              Size *
                            </label>
                            <Input
                              type="text"
                              value={size.size}
                              onChange={(e) => updateSize(index, 'size', e.target.value)}
                              placeholder="S, M, L, XL"
                              required
                              disabled={submitting}
                              className="text-sm"
                            />
                          </div>
                          
                          <div className="lg:col-span-1">
                            <label className="block text-xs font-medium mb-1">
                              Price (₹) *
                            </label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={size.price || ''}
                              onChange={(e) => updateSize(index, 'price', e.target.value)}
                              placeholder="0.00"
                              required
                              disabled={submitting}
                              className="text-sm"
                            />
                          </div>
                          
                          <div className="lg:col-span-1">
                            <label className="block text-xs font-medium mb-1">
                              Discounted Price (₹)
                            </label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={size.discountedPrice || ''}
                              onChange={(e) => updateSize(index, 'discountedPrice', e.target.value)}
                              placeholder="0.00"
                              disabled={submitting}
                              className="text-sm"
                            />
                          </div>
                          
                          <div className="lg:col-span-1">
                            <label className="block text-xs font-medium mb-1">
                              Stock Quantity *
                            </label>
                            <Input
                              type="number"
                              min="0"
                              value={size.stockQty || ''}
                              onChange={(e) => updateSize(index, 'stockQty', e.target.value)}
                              placeholder="0"
                              required
                              disabled={submitting}
                              className="text-sm"
                            />
                          </div>
                          
                          <div className="lg:col-span-1 flex items-end">
                            <div className="text-xs text-muted-foreground">
                              {size.discountedPrice > 0 && size.price > 0 && (
                                <span className="text-green-600">
                                  {Math.round(((size.price - size.discountedPrice) / size.price) * 100)}% off
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {sizes.length === 0 && (
                    <div className="text-center py-8 border-2 border-dashed rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        No sizes added yet. Click "Add Size" to add product variants.
                      </p>
                    </div>
                  )}
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
                  disabled={submitting || !formData.name || sizes.length === 0}
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