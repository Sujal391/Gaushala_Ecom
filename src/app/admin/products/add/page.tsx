"use client";

import { useState } from 'react';
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
import AdminGuard from '../../../../components/guards/AdminGuard';
import AdminLayout from '../../../../components/layout/AdminLayout';

export default function AddProductPage() {
  const router = useRouter();
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

      formDataToSend.append('name', formData.name);
      formDataToSend.append('price', String(formData.price));
      formDataToSend.append('Description', formData.description);
      formDataToSend.append('stockQty', String(formData.stock));

      imageFiles.forEach((file) => {
        formDataToSend.append('images', file);
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
                              className="w-full h-24 sm:h-32 object-cover rounded-lg"
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
                      <div className="flex flex-col sm:flex-row items-center gap-3">
                        <label className="cursor-pointer">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full sm:w-auto"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Add More Images
                          </Button>
                          <Input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-xs text-muted-foreground">
                          {imagePreviews.length} image(s) selected
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                      <p className="text-sm text-muted-foreground mb-3 sm:mb-4">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        Multiple images supported
                      </p>
                      <label className="cursor-pointer">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full sm:w-auto"
                        >
                          Select Images
                        </Button>
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className="hidden"
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