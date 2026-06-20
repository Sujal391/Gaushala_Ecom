"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Upload,
  X,
  ArrowLeft,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { updateBanner, getBannerById } from '../../../../../lib/api/auth';
import { compressImage } from '../../../../../lib/compressImage';
import { API_BASE_URL } from '../../../../../lib/api/config'; // Import API_BASE_URL
import { toast } from 'sonner';
import AdminGuard from '../../../../../components/guards/AdminGuard';
import AdminLayout from '../../../../../components/layout/AdminLayout';

// Define Banner type based on API response
interface Banner {
  id: number;
  imageUrl: string;
  deviceType: string; // Comes as "DESKTOP", "MOBILE", "TABLET" (uppercase)
  createdAt: string;
}

export default function EditBannerPage() {
  const router = useRouter();
  const params = useParams();
  const bannerId = Number(params.id);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentBanner, setCurrentBanner] = useState<Banner | null>(null);
  const [deviceType, setDeviceType] = useState<string>('');
  const [imageError, setImageError] = useState(false);

  // Device options for dropdown (lowercase values for API)
  const deviceOptions = [
    { value: 'desktop', label: 'Desktop' },
    { value: 'mobile', label: 'Mobile' },
    { value: 'tablet', label: 'Tablet' },
  ];

  // Helper function to get full image URL - matching the list page pattern
  const getFullImageUrl = (imageUrl: string): string => {
    if (!imageUrl) return '';
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // If it's a data URL (from file upload), return as is
    if (imageUrl.startsWith('data:')) {
      return imageUrl;
    }
    
    // Use the same pattern as the list page
    return `${API_BASE_URL}${imageUrl}`;
  };

  // Helper function to convert API deviceType (uppercase) to form value (lowercase)
  const apiToFormDeviceType = (apiDeviceType: string): string => {
    if (!apiDeviceType) return '';
    return apiDeviceType.toLowerCase();
  };

  // Helper function to convert form value (lowercase) to API deviceType (uppercase)
  const formToApiDeviceType = (formDeviceType: string): string | undefined => {
    if (!formDeviceType || formDeviceType === ' ') return undefined;
    return formDeviceType.toUpperCase();
  };

  // Fetch banner data on component mount
  useEffect(() => {
    fetchBannerData();
  }, [bannerId]);

  const fetchBannerData = async () => {
    setIsLoading(true);
    try {
      const response = await getBannerById(bannerId);
      
      if (response.success && response.data) {
        setCurrentBanner(response.data);
        // Set the current image preview from the API
        if (response.data.imageUrl) {
          const fullImageUrl = getFullImageUrl(response.data.imageUrl);
          console.log('Setting image preview to:', fullImageUrl);
          setImagePreview(fullImageUrl);
        }
        // Set the current device type (convert from uppercase to lowercase for dropdown)
        if (response.data.deviceType) {
          setDeviceType(apiToFormDeviceType(response.data.deviceType));
        }
      } else {
        toast.error(response.message || 'Failed to load banner data');
        router.push('/admin/banner');
      }
    } catch (error) {
      console.error('Error fetching banner:', error);
      toast.error('Failed to load banner data');
      router.push('/admin/banner');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      setImageFile(file);
      setImageError(false); // Reset error state when new image is selected
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImageError(false);
    // If we have a current banner, revert to its image
    if (currentBanner?.imageUrl) {
      const fullImageUrl = getFullImageUrl(currentBanner.imageUrl);
      setImagePreview(fullImageUrl);
    } else {
      setImagePreview(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const validateForm = () => {
    // Form is valid even without a new image (can update only device type)
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let fileToUpload = imageFile as File | undefined;
      if (fileToUpload) {
        let maxWidth = 1920;
        let maxHeight = 1080;
        const normalizedDevice = (deviceType || '').trim().toLowerCase();
        if (normalizedDevice === 'mobile') {
          maxWidth = 750;
          maxHeight = 500;
        } else if (normalizedDevice === 'tablet') {
          maxWidth = 1024;
          maxHeight = 600;
        }
        try {
          fileToUpload = await compressImage(fileToUpload, maxWidth, maxHeight, 0.8);
        } catch (err) {
          console.error('Failed to compress image:', err);
        }
      }

      // Only pass imageFile if a new image was selected
      const response = await updateBanner(
        bannerId, 
        fileToUpload as File, // This will be undefined if no new image
        formToApiDeviceType(deviceType) // Convert to uppercase for API
      );

      if (response.success) {
        toast.success('Banner updated successfully!');
        router.push('/admin/banner');
      } else {
        toast.error(response.message || 'Failed to update banner');
      }
    } catch (error) {
      console.error('Error updating banner:', error);
      toast.error('Failed to update banner. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageError = () => {
    setImageError(true);
    console.error('Failed to load image:', imagePreview);
  };

  const headerAction = (
    <Button
      variant="outline"
      size="sm"
      onClick={() => router.push('/admin/banner')}
      className="gap-2"
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="hidden sm:inline">Back to Banners</span>
      <span className="sm:hidden">Back</span>
    </Button>
  );

  if (isLoading) {
    return (
      <AdminGuard>
        <AdminLayout title="Edit Banner" headerAction={headerAction}>
          <Card className="max-w-4xl mx-auto">
            <CardContent className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        </AdminLayout>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <AdminLayout title="Edit Banner" headerAction={headerAction}>
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="px-4 sm:px-6 py-4 sm:py-5">
            <CardTitle className="text-xl sm:text-2xl">Update Banner #{bannerId}</CardTitle>
            {currentBanner?.createdAt && (
              <p className="text-sm text-muted-foreground mt-1">
                Created: {new Date(currentBanner.createdAt).toLocaleString()}
              </p>
            )}
          </CardHeader>
          <CardContent className="px-4 sm:px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Hidden File Input */}
              <Input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isSubmitting}
              />

              {/* Banner Image Upload */}
              <div>
                <Label className="text-base">Banner Image</Label>
                <div className="border-2 border-dashed rounded-lg p-4 sm:p-6 text-center mt-2">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <div className="relative">
                        {imageError ? (
                          <div className="w-full h-[200px] flex items-center justify-center bg-gray-100 rounded-lg border">
                            <div className="text-center">
                              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                              <p className="text-sm text-muted-foreground">Failed to load image</p>
                              <p className="text-xs text-muted-foreground mt-1 break-all px-4">{imagePreview}</p>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={imagePreview}
                            alt="Banner preview"
                            className="w-full max-h-[300px] object-contain rounded-lg border"
                            onError={handleImageError}
                          />
                        )}
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8"
                          onClick={removeImage}
                          disabled={isSubmitting}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={triggerFileInput}
                          disabled={isSubmitting}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {imageFile ? 'Change Image' : 'Replace Image'}
                        </Button>
                      </div>
                      {!imageFile && (
                        <p className="text-xs text-muted-foreground">
                          Current image shown. Click "Replace Image" to upload a new one.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <ImageIcon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                      <p className="text-sm text-muted-foreground mb-3 sm:mb-4">
                        No image available
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={triggerFileInput}
                        disabled={isSubmitting}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Select Image
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Supported formats: JPG, PNG, GIF. Max size: 5MB
                </p>
              </div>

              {/* Device Type Dropdown */}
              <div>
                <Label htmlFor="deviceType" className="text-base">
                  Device Type (Optional)
                </Label>
                <Select
                  value={deviceType}
                  onValueChange={setDeviceType}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full mt-2">
                    <SelectValue placeholder="Select device type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" ">None</SelectItem>
                    {deviceOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  Select the target device type for this banner (optional)
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 py-3 sm:py-2"
                  onClick={() => router.push('/admin/banner')}
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
                      Updating...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Update Banner
                    </>
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