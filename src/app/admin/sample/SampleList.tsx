"use client";

import { useState, useEffect } from "react";
import { Loader2, Package, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { getAllSampleRequests } from "../../../lib/api/auth";
import UpdateSampleStatusModal from "./UpdateSampleStatus";

interface SampleRequest {
  sampleRequestId: number;
  userId: number;
  productId: number;
  productName: string;
  city: string;
  status: "pending" | "approved" | "rejected" | "shipped";
  adminRemark?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AllSampleRequests() {
  const [requests, setRequests] = useState<SampleRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<SampleRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const response = await getAllSampleRequests();
      console.log("Sample requests API response:", response);

      let data: SampleRequest[] = [];

      if (response?.success && response.data) {
        data = response.data;
      } else if (Array.isArray(response)) {
        data = response;
      }

      const sorted = data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setRequests(sorted);
      toast.success(`Loaded ${sorted.length} sample requests`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load sample requests");
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateClick = (request: SampleRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleUpdateSuccess = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
    fetchRequests();
  };

  const formatDateTime = (date: string) =>
    new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "outline";
      case "approved":
        return "default";
      case "shipped":
        return "default";
      case "rejected":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-yellow-600 border-yellow-600";
      case "approved":
        return "bg-blue-500";
      case "shipped":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "";
    }
  };

  const statsCards = [
    {
      label: "Total Requests",
      value: requests.length,
      icon: Package,
      color: "text-blue-500",
    },
    {
      label: "Pending",
      value: requests.filter((r) => r.status === "pending").length,
      icon: RefreshCcw,
      color: "text-yellow-500",
    },
    {
      label: "Approved",
      value: requests.filter((r) => r.status === "approved").length,
      icon: Package,
      color: "text-blue-500",
    },
    {
      label: "Shipped",
      value: requests.filter((r) => r.status === "shipped").length,
      icon: Package,
      color: "text-green-500",
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading sample requests...</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-xl sm:text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-4">
        <CardContent className="p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">All Sample Requests</h2>
          <Button
            onClick={fetchRequests}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </CardContent>
      </Card>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-8 sm:py-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No sample requests found</h3>
            <p className="text-muted-foreground">
              Sample requests will appear here once users submit them
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">Request ID</TableHead>
                      <TableHead className="text-xs sm:text-sm">User ID</TableHead>
                      <TableHead className="text-xs sm:text-sm">Product Name</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden md:table-cell">
                        City
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm">Status</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden lg:table-cell">
                        Created At
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm hidden xl:table-cell">
                        Admin Remark
                      </TableHead>
                      <TableHead className="text-right text-xs sm:text-sm">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {requests.map((request) => (
                      <TableRow
                        key={request.sampleRequestId}
                        className="hover:bg-muted/30"
                      >
                        <TableCell className="font-medium">
                          #{request.sampleRequestId}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            User #{request.userId}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {request.productName}
                          <div className="text-xs text-muted-foreground md:hidden mt-1">
                            {request.city}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {request.city}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusBadgeVariant(request.status)}
                            className={`text-xs capitalize ${getStatusColor(request.status)}`}
                          >
                            {request.status}
                          </Badge>
                          <div className="text-xs text-muted-foreground lg:hidden mt-1">
                            {formatDateTime(request.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs hidden lg:table-cell">
                          {formatDateTime(request.createdAt)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground hidden xl:table-cell max-w-[200px] truncate">
                          {request.adminRemark || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateClick(request)}
                            className="text-xs"
                          >
                            Update Status
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Showing {requests.length} request{requests.length !== 1 ? "s" : ""}
          </div>
        </>
      )}

      {selectedRequest && (
        <UpdateSampleStatusModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedRequest(null);
          }}
          request={selectedRequest}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </>
  );
}