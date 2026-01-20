"use client";

import { useState, useEffect } from 'react';
import { Loader2, Package, MapPin, Calendar, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { getUserId } from '../../../lib/api/config';
import { getUserSampleRequests } from '../../../lib/api/auth';

interface SampleRequest {
  sampleRequestId: number;
  productId: number;
  productName: string;
  houseNo: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  status: string;
  requestedAt: string;
  approvedDate?: string;
  shippedDate?: string;
  adminRemark?: string;
}

interface MySampleRequestsProps {
  refreshTrigger: number;
}

export default function MySampleRequests({ refreshTrigger }: MySampleRequestsProps) {
  const [requests, setRequests] = useState<SampleRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSampleRequests();
  }, [refreshTrigger]);

  const loadSampleRequests = async () => {
    try {
      setLoading(true);
      const userId = getUserId();

      if (!userId) {
        toast.error('Please login to view your sample requests');
        return;
      }

      const response = await getUserSampleRequests(userId);
      
      let requestsData = [];
      if (response && response.success && response.data) {
        requestsData = response.data;
      } else if (response && Array.isArray(response)) {
        requestsData = response;
      } else if (response && response.data) {
        requestsData = response.data;
      }

      // Sort by request date (latest first)
      const sortedRequests = requestsData.sort((a: SampleRequest, b: SampleRequest) => {
        const dateA = new Date(a.requestedAt).getTime();
        const dateB = new Date(b.requestedAt).getTime();
        return dateB - dateA;
      });

      setRequests(sortedRequests);
    } catch (error) {
      console.error('Error loading sample requests:', error);
      toast.error('Failed to load sample requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status: string) => {
    const normalizedStatus = status.toUpperCase();
    const statusColors: { [key: string]: string } = {
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'APPROVED': 'bg-blue-100 text-blue-800 border-blue-200',
      'REJECTED': 'bg-red-100 text-red-800 border-red-200',
      'SHIPPED': 'bg-green-100 text-green-800 border-green-200',
      'DELIVERED': 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return statusColors[normalizedStatus] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    const normalizedStatus = status.toUpperCase();
    switch (normalizedStatus) {
      case 'PENDING':
        return '⏳';
      case 'APPROVED':
        return '✓';
      case 'REJECTED':
        return '✗';
      case 'SHIPPED':
        return '📦';
      case 'DELIVERED':
        return '🎉';
      default:
        return '•';
    }
  };

  const formatAddress = (request: SampleRequest) => {
    const parts = [
      request.houseNo,
      request.street,
      request.landmark,
      request.city,
      request.state,
      request.pincode
    ].filter(Boolean);
    return parts.join(', ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading your requests...</span>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You haven't requested any samples yet. Click "Request Sample" to get started!
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              My Sample Requests ({requests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold text-sm">Product</th>
                    <th className="text-left p-3 font-semibold text-sm">Delivery Address</th>
                    <th className="text-left p-3 font-semibold text-sm">Status</th>
                    <th className="text-left p-3 font-semibold text-sm">Remark</th>
                    <th className="text-left p-3 font-semibold text-sm">Request Date</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.sampleRequestId} className="border-b hover:bg-muted/50">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{request.productName}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-start gap-2 max-w-xs">
                          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">
                            {request.city}, {request.state} - {request.pincode}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(request.status)} font-semibold`}
                        >
                          {getStatusIcon(request.status)} {request.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <span className="font-mono text-sm">{request.adminRemark || '-'}</span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {formatDate(request.requestedAt)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {requests.map((request) => (
          <Card key={request.sampleRequestId}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    {request.productName}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground font-mono">
                    {request.adminRemark}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`${getStatusColor(request.status)} font-semibold`}
                >
                  {getStatusIcon(request.status)} {request.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">{request.city}, {request.state}</p>
                  <p className="text-muted-foreground">Pincode: {request.pincode}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                <Calendar className="h-4 w-4" />
                <span>Requested on {formatDate(request.requestedAt)}</span>
              </div>
              {request.shippedDate && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Package className="h-4 w-4" />
                  <span>Shipped on {formatDate(request.shippedDate)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        {['PENDING', 'APPROVED', 'SHIPPED', 'DELIVERED'].map((status) => {
          const count = requests.filter(r => r.status.toUpperCase() === status).length;
          return (
            <Card key={status} className={count > 0 ? 'border-2' : ''}>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-xs text-muted-foreground capitalize">
                  {status.toLowerCase()}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}