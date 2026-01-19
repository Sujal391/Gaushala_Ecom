"use client";

import { useState, useEffect } from 'react';
import { Loader2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { requestSample, getAllProducts } from '../../../lib/api/auth';
import { getUserId } from '../../../lib/api/config';

interface Product {
  productId: number;
  productName: string;
  categoryName?: string;
  price?: number;
}

interface SampleRequestPayload {
  userId: number;
  productId: number;
  productName: string; // Required by API
  houseNo: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}

interface CreateSampleRequestProps {
  onSuccess: () => void;
}

export default function CreateSampleRequest({ onSuccess }: CreateSampleRequestProps) {
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<Omit<SampleRequestPayload, 'userId'>>({
    productId: 0,
    productName: '', // Required by API
    houseNo: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await getAllProducts();
      
      let productsData: Product[] = [];
      
      // Transform API response to match your Product interface
      if (response && Array.isArray(response)) {
        productsData = response.map(item => ({
          productId: item.id,
          productName: item.name,
          price: item.price,
          categoryName: item.category || item.type || undefined,
        }));
      } else if (response && response.data && Array.isArray(response.data)) {
        productsData = response.data.map(item => ({
          productId: item.id,
          productName: item.name,
          price: item.price,
          categoryName: item.category || item.type || undefined,
        }));
      }
      
      // Filter out any invalid products
      const validProducts = productsData.filter(
        (product): product is Product => 
          product && 
          typeof product.productId === 'number' && 
          typeof product.productName === 'string'
      );
      
      setProducts(validProducts);
      
      if (validProducts.length === 0) {
        toast.error('No products available');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleProductChange = (productId: string) => {
    const id = parseInt(productId);
    const selectedProduct = products.find(p => p.productId === id);
    
    if (selectedProduct) {
      setFormData(prev => ({
        ...prev,
        productId: id,
        productName: selectedProduct.productName
      }));
    }
  };

  const handleInputChange = (field: keyof Omit<SampleRequestPayload, 'userId' | 'productName'>, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.productId || formData.productId === 0) {
      toast.error('Please select a product');
      return false;
    }
    if (!formData.productName.trim()) {
      toast.error('Please select a valid product');
      return false;
    }
    if (!formData.houseNo.trim()) {
      toast.error('Please enter house number');
      return false;
    }
    if (!formData.street.trim()) {
      toast.error('Please enter street');
      return false;
    }
    if (!formData.city.trim()) {
      toast.error('Please enter city');
      return false;
    }
    if (!formData.state.trim()) {
      toast.error('Please enter state');
      return false;
    }
    if (!formData.pincode.trim()) {
      toast.error('Please enter pincode');
      return false;
    }
    if (!/^\d{6}$/.test(formData.pincode.trim())) {
      toast.error('Please enter a valid 6-digit pincode');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const userId = getUserId();

      if (!userId) {
        toast.error('Please login to request samples');
        return;
      }

      const payload: SampleRequestPayload = {
        userId,
        ...formData
      };

      console.log('Submitting payload:', payload); // Debug log

      const response = await requestSample(payload);

      if (response && response.success) {
        toast.success('Sample request submitted successfully!');
        onSuccess();
      } else {
        toast.error(response?.message || 'Failed to submit sample request');
      }
    } catch (error) {
      console.error('Error creating sample request:', error);
      toast.error('Failed to submit sample request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProducts) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading products...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      {/* Product Selection */}
      <div className="space-y-2">
        <Label htmlFor="product">
          Product <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.productId ? formData.productId.toString() : ""}
          onValueChange={handleProductChange}
        >
          <SelectTrigger id="product">
            <SelectValue placeholder="Select a product" />
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem
                key={product.productId}
                value={product.productId.toString()}
              >
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>{product.productName}</span>
                  {product.price && (
                    <span className="text-xs text-muted-foreground">
                      (₹{product.price})
                    </span>
                  )}
                  {product.categoryName && (
                    <span className="text-xs text-muted-foreground">
                      ({product.categoryName})
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Address Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="houseNo">
            House No <span className="text-red-500">*</span>
          </Label>
          <Input
            id="houseNo"
            value={formData.houseNo}
            onChange={(e) => handleInputChange('houseNo', e.target.value)}
            placeholder="Enter house number"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="street">
            Street <span className="text-red-500">*</span>
          </Label>
          <Input
            id="street"
            value={formData.street}
            onChange={(e) => handleInputChange('street', e.target.value)}
            placeholder="Enter street name"
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="landmark">Landmark (Optional)</Label>
        <Input
          id="landmark"
          value={formData.landmark}
          onChange={(e) => handleInputChange('landmark', e.target.value)}
          placeholder="Enter nearby landmark"
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">
            City <span className="text-red-500">*</span>
          </Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="Enter city"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">
            State <span className="text-red-500">*</span>
          </Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
            placeholder="Enter state"
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pincode">
          Pincode <span className="text-red-500">*</span>
        </Label>
        <Input
          id="pincode"
          value={formData.pincode}
          onChange={(e) => handleInputChange('pincode', e.target.value)}
          placeholder="Enter 6-digit pincode"
          maxLength={6}
          disabled={loading}
        />
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            'Submit Request'
          )}
        </Button>
      </div>
    </form>
  );
}