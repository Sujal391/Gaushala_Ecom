"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Loader2,
  Image as ImageIcon,
  Calendar,
  Eye,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { getAllBanners, deleteBanner } from '../../../lib/api/auth';
import AdminGuard from '../../../components/guards/AdminGuard';
import AdminLayout from '../../../components/layout/AdminLayout';

// TypeScript Interfaces based on actual API response
interface Banner {
  id: number;
  imageUrl: string;
  createdAt: string;
}

interface GetBannersResponse {
  success: boolean;
  count: number;
  data: Banner[];
}

interface DeleteBannerResponse {
  success: boolean;
  message?: string;
}

export default function AdminBannersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [deleteBannerData, setDeleteBannerData] = useState<{ id: number; imageUrl: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await getAllBanners() as GetBannersResponse;
      
      if (response.success && Array.isArray(response.data)) {
        setBanners(response.data);
        toast.success(`Loaded ${response.count} banners`);
      } else {
        console.error('Failed to fetch banners:', response);
        toast.error('Failed to load banners: Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('Failed to load banners. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!deleteBannerData) return;
    
    setIsDeleting(true);
    try {
      const bannerId = deleteBannerData.id;
      console.log('Attempting to delete banner with ID:', bannerId);
      
      const response = await deleteBanner(bannerId.toString()) as DeleteBannerResponse;
      console.log('Delete response:', response);
      
      if (response.success) {
        // Remove the banner from the local state
        setBanners(prevBanners => prevBanners.filter(banner => banner.id !== bannerId));
        toast.success('Banner deleted successfully!');
        setDeleteBannerData(null);
      } else {
        toast.error('Failed to delete banner: ' + (response.message || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Error deleting banner:', error);
      
      if (error.message?.includes('Network Error') || error.code === 'ERR_NETWORK') {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error('Failed to delete banner. Please try again.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (banner: Banner) => {
    // Navigate to edit page with banner data
    router.push(`/admin/banner/edit/${banner.id}`);
  };

  const filteredBanners = banners.filter((banner: Banner) =>
    banner.imageUrl?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const extractFilename = (url: string): string => {
    return url.split('/').pop() || url;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const headerAction = (
    <Button onClick={() => router.push('/admin/banner/add')} className="gap-2">
      <Plus className="h-4 w-4" />
      <span className="hidden sm:inline">Add Banner</span>
      <span className="sm:hidden">Add</span>
    </Button>
  );

  return (
    <AdminGuard>
      <AdminLayout title="Banners" headerAction={headerAction}>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Total Banners</p>
                  <p className="text-xl sm:text-2xl font-bold">{banners.length}</p>
                </div>
                <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Active Banners</p>
                  <p className="text-xl sm:text-2xl font-bold">{banners.length}</p>
                </div>
                <Eye className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Last Updated</p>
                  <p className="text-sm sm:text-base font-medium">
                    {banners.length > 0 
                      ? formatDate(banners[0].createdAt).split(',')[0]
                      : 'N/A'}
                  </p>
                </div>
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Storage Used</p>
                  <p className="text-sm sm:text-base font-medium">~{banners.length * 2} MB</p>
                </div>
                <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search banners by filename..."
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                onClick={fetchBanners} 
                variant="outline" 
                size="sm"
                className="gap-2 w-full sm:w-auto"
              >
                <Loader2 className="h-4 w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading banners...</p>
          </div>
        ) : (
          <>
            {/* Banners Table */}
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Preview</TableHead>
                      <TableHead>Filename</TableHead>
                      {/* <TableHead className="hidden md:table-cell">URL Path</TableHead> */}
                      <TableHead className="hidden sm:table-cell">Uploaded</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBanners.map((banner: Banner) => (
                      <TableRow key={banner.id}>
                        <TableCell>
                          <div className="w-16 h-16 rounded-md overflow-hidden bg-muted">
                            <img
                              src={`https://gaushalaecommerce.runasp.net${banner.imageUrl}`}
                              alt={`Banner ${banner.id}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Error+Loading+Image';
                              }}
                            />
                          </div>
                        </TableCell>
                        {/* <TableCell className="font-medium">
                          {extractFilename(banner.imageUrl)}
                        </TableCell> */}
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {banner.imageUrl}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                          {formatDate(banner.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => window.open(`https://gaushalaecommerce.runasp.net${banner.imageUrl}`, '_blank')}
                              title="View full size"
                            >
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View</span>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEdit(banner)}
                              title="Edit banner"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setDeleteBannerData({ id: banner.id, imageUrl: banner.imageUrl })}
                              title="Delete"
                              disabled={isDeleting && deleteBannerData?.id === banner.id}
                            >
                              {isDeleting && deleteBannerData?.id === banner.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Empty State */}
            {filteredBanners.length === 0 && !isLoading && (
              <div className="text-center py-8 sm:py-12">
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No banners found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery ? 'Try adjusting your search query' : 'Get started by uploading your first banner'}
                </p>
                <Button onClick={() => router.push('/admin/banner/add')} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Upload Banner
                </Button>
              </div>
            )}

            {/* Results Summary */}
            {filteredBanners.length > 0 && (
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Showing {filteredBanners.length} of {banners.length} banners
              </div>
            )}
          </>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteBannerData !== null} onOpenChange={() => {
          if (!isDeleting) {
            setDeleteBannerData(null);
          }
        }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the banner:
                <br />
                <span className="font-semibold block mt-2">
                  {deleteBannerData && extractFilename(deleteBannerData.imageUrl)}
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </AdminLayout>
    </AdminGuard>
  );
}