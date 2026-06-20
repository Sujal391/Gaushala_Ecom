"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Upload,
  X,
  ArrowLeft,
  Loader2,
  Image as ImageIcon,
  Smartphone,
  Monitor,
  Tablet,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createBanner } from '../../../../lib/api/auth';
import { compressImage } from '../../../../lib/compressImage';
import { toast } from 'sonner';
import AdminGuard from '../../../../components/guards/AdminGuard';
import AdminLayout from '../../../../components/layout/AdminLayout';

// Device recommendations (for display only, no validation)
const DEVICE_RECOMMENDATIONS = {
  DESKTOP: {
    recommendedDimensions: '1920 x 400-600px',
    aspectRatio: '16:9 or 3:1',
    suggestedSize: '1MB',
  },
  MOBILE: {
    recommendedDimensions: '750 x 300-400px',
    aspectRatio: '16:9',
    suggestedSize: '300KB',
  },
  TABLET: {
    recommendedDimensions: '1024 x 400px',
    aspectRatio: '16:9',
    suggestedSize: '400KB',
  },
};

export default function AddBannerPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [deviceType, setDeviceType] = useState<string>('DESKTOP');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Only validate file type, not size
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      setImageFile(file);
      
      // Create preview and get dimensions
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        
        // Get image dimensions (for display only)
        const img = new Image();
        img.onload = () => {
          setImageDimensions({ width: img.width, height: img.height });
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageDimensions(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const validateForm = () => {
    if (!imageFile) {
      toast.error('Please upload a banner image');
      return false;
    }
    if (!deviceType) {
      toast.error('Please select a device type');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let fileToUpload = imageFile as File;
      let maxWidth = 1920;
      let maxHeight = 1080;
      const normalizedDevice = (deviceType || '').trim().toUpperCase();
      if (normalizedDevice === 'MOBILE') {
        maxWidth = 750;
        maxHeight = 500;
      } else if (normalizedDevice === 'TABLET') {
        maxWidth = 1024;
        maxHeight = 600;
      }
      try {
        fileToUpload = await compressImage(fileToUpload, maxWidth, maxHeight, 0.8);
      } catch (err) {
        console.error('Failed to compress image:', err);
      }

      const response = await createBanner(fileToUpload, deviceType);

      if (response.success) {
        toast.success('Banner uploaded successfully!');
        router.push('/admin/banner');
      } else {
        toast.error(response.message || 'Failed to upload banner');
      }
    } catch (error) {
      console.error('Error uploading banner:', error);
      toast.error('Failed to upload banner. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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

  const currentRecommendation = DEVICE_RECOMMENDATIONS[deviceType as keyof typeof DEVICE_RECOMMENDATIONS];

  return (
    <AdminGuard>
      <AdminLayout title="Add Banner" headerAction={headerAction}>
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="px-4 sm:px-6 py-4 sm:py-5">
            <CardTitle className="text-xl sm:text-2xl">Upload Banner Image</CardTitle>
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

              {/* Device Type Selection */}
              <div>
                <Label htmlFor="deviceType" className="text-base">
                  Device Type *
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
                    <SelectItem value="DESKTOP">
                      <div className="flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        <span>Desktop</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="MOBILE">
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        <span>Mobile</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="TABLET">
                      <div className="flex items-center gap-2">
                        <Tablet className="h-4 w-4" />
                        <span>Tablet</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Device-specific recommendations (informational only) */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <div className="text-sm">
                    <p className="font-medium mb-1">Recommended specifications for {deviceType.toLowerCase()}:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Dimensions: {currentRecommendation.recommendedDimensions}</li>
                      <li>Aspect ratio: {currentRecommendation.aspectRatio}</li>
                      <li>Suggested file size: {currentRecommendation.suggestedSize}</li>
                    </ul>
                    <p className="text-xs mt-2 text-muted-foreground">
                      Note: These are recommendations only. No strict size limits are enforced.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Banner Image Upload */}
              <div>
                <Label className="text-base">Banner Image *</Label>
                <div className="border-2 border-dashed rounded-lg p-4 sm:p-6 text-center mt-2">
                  {imagePreview ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Banner preview"
                          className="w-full max-h-[300px] object-contain rounded-lg border"
                        />
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
                      
                      {/* Image details (informational only) */}
                      {imageDimensions && (
                        <div className="text-sm text-muted-foreground bg-muted p-2 rounded-md">
                          <p>Dimensions: {imageDimensions.width} x {imageDimensions.height}px</p>
                          <p>File size: {(imageFile!.size / 1024).toFixed(2)}KB</p>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={triggerFileInput}
                          disabled={isSubmitting}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Change Image
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <ImageIcon className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                      <p className="text-sm text-muted-foreground mb-3 sm:mb-4">
                        Click to upload banner image
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
                  Supported formats: JPG, PNG, GIF, WebP
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
                  disabled={isSubmitting || !imageFile || !deviceType}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Banner
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