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

// Import auth helpers from config
import {
  getAuthToken,
  API_BASE_URL
} from '../../../../../lib/api/config';

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
  images: string[];
}

interface UpdateProductQueryParams {
  Name: string;
  Description?: string;
  Sizes?: ProductSize[];
  RemovalImageIds?: number[];
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
  const [removalImageIds, setRemovalImageIds] = useState<number[]>([]);

  // Function to fetch product by ID
  const fetchProductById = async (id: string): Promise<Product | null> => {
    const token = getAuthToken();
    
    if (!token) {
      toast.error('Authentication token not found');
      router.push('/login');
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  };

  // Fetch product data from API on component mount
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        console.log('Fetching product with ID:', params.id);
        
        const product = await fetchProductById(params.id as string);
        
        console.log('API Response:', product);
        
        if (product) {
          setFormData({
            name: product.name || '',
            description: product.description || '',
          });
          
          // Set sizes
          if (product.sizes && Array.isArray(product.sizes)) {
            setSizes(product.sizes);
          }
          
          // Map existing images with IDs
          const imagesWithIds: ExistingImage[] = Array.isArray(product.images) 
            ? product.images.map((img: any, index: number) => ({
                id: img.id || index,
                url: typeof img === 'string' ? img : img.url
              }))
            : [];
          
          setExistingImages(imagesWithIds);
          
          // Build full image URLs for previews
          setImagePreviews(
            imagesWithIds.map(img => {
              if (img.url.startsWith('http')) {
                return img.url;
              }
              const baseUrl = API_BASE_URL.replace(/\/$/, '');
              const imagePath = img.url.replace(/^\//, '');
              return `${baseUrl}/${imagePath}`;
            })
          );
        } else {
          toast.error('Failed to load product details: Invalid response format');
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
      // Removing an existing image - track its ID for removal
      const removedImage = existingImages[index];
      setRemovalImageIds(prev => [...prev, removedImage.id]);
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
      // Create FormData object for request body
      const formDataObj = new FormData();

      // Add new image files to FormData
      newImageFiles.forEach((file) => {
        formDataObj.append('Images', file);
      });

      // Build query parameters according to API spec
      const queryParams: UpdateProductQueryParams = {
        Name: formData.name.trim(),
      };

      // Add optional description
      if (formData.description.trim()) {
        queryParams.Description = formData.description.trim();
      }

      // Add sizes array of objects
      if (sizes.length > 0) {
        queryParams.Sizes = sizes;
      }

      // Add removal image IDs if any
      if (removalImageIds.length > 0) {
        queryParams.RemovalImageIds = removalImageIds;
      }

      // Build the URL with query parameters
      const baseUrl = `${API_BASE_URL}/api/products/${params.id}`;
      const url = new URL(baseUrl);
      
      // Append query parameters
      Object.entries(queryParams).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          // Handle array parameters
          value.forEach(item => {
            if (typeof item === 'object') {
              // For Sizes array of objects - stringify each object
              url.searchParams.append(key, JSON.stringify(item));
            } else {
              // For RemovalImageIds array of integers
              url.searchParams.append(key, item.toString());
            }
          });
        } else {
          // Handle string parameters
          url.searchParams.append(key, value);
        }
      });

      console.log('Updating product with URL:', url.toString());
      console.log('Query params:', queryParams);
      console.log('New images:', newImageFiles.length);
      console.log('Removal image IDs:', removalImageIds);

      // Get auth token
      const token = getAuthToken();
      
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        router.push('/login');
        return;
      }

      // Make the PUT API call
      const response = await fetch(url.toString(), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataObj,
      });

      console.log('Update response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        if (response.status === 401) {
          toast.error('Your session has expired. Please log in again.');
          router.push('/login');
          return;
        }
        
        throw new Error(`Failed to update product. Status: ${response.status}`);
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
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-32 sm:h-48 object-contain rounded-lg border"
                            />
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
                            setRemovalImageIds(prev => [...prev, ...existingImages.map(img => img.id)]);
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