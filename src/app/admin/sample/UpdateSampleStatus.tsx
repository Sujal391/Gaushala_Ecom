"use client";

import { useState, useEffect } from "react";
import { Loader2, Package, User, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { updateSampleRequestStatus } from "../../../lib/api/auth";

interface SampleRequest {
  id: number;
  userId: number;
  customerName: string;
  productId: number;
  productName: string;
  city: string;
  status: "pending" | "approved" | "rejected" | "shipped";
  adminRemark?: string;
  createdAt: string;
  updatedAt: string;
}

interface UpdateSampleStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: SampleRequest | null;
  onSuccess: () => void;
}

export default function UpdateSampleStatusModal({
  isOpen,
  onClose,
  request,
  onSuccess,
}: UpdateSampleStatusModalProps) {
  const [status, setStatus] = useState<string>(request?.status || "pending");
  const [adminRemark, setAdminRemark] = useState<string>(request?.adminRemark || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when request changes
  useEffect(() => {
    if (request) {
      setStatus(request.status);
      setAdminRemark(request.adminRemark || "");
    }
  }, [request]);

  const handleSubmit = async () => {
    if (!request) {
      toast.error("No request selected");
      return;
    }

    if (!request.id) {
      toast.error("Invalid request ID");
      console.error("Missing id:", request);
      return;
    }

    if (!status) {
      toast.error("Please select a status");
      return;
    }

    if (status === request.status && adminRemark === (request.adminRemark || "")) {
      toast.error("No changes detected");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        status: status,
        adminRemark: adminRemark.trim() || undefined,
      };

      console.log("=== UPDATE REQUEST ===");
      console.log("Request ID:", request.id);
      console.log("Payload:", JSON.stringify(payload, null, 2));
      console.log("=====================");

      const response = await updateSampleRequestStatus(
        request.id,
        payload
      );

      console.log("=== API RESPONSE ===");
      console.log(response);
      console.log("===================");

      if (response.success) {
        toast.success("Sample request status updated successfully");
        onSuccess();
        onClose();
      } else {
        toast.error(response.message || "Failed to update status");
      }
    } catch (error: any) {
      console.error("=== ERROR DETAILS ===");
      console.error("Error:", error);
      console.error("Error Message:", error?.message);
      console.error("Error Response:", error?.response?.data);
      console.error("====================");
      
      const errorMessage = error?.response?.data?.title || 
                          error?.response?.data?.message || 
                          error?.message || 
                          "Failed to update sample request status";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions = [
    { value: "pending", label: "Pending", color: "bg-yellow-500" },
    { value: "approved", label: "Approved", color: "bg-green-500" },
    { value: "rejected", label: "Rejected", color: "bg-red-500" },
    { value: "shipped", label: "Shipped", color: "bg-blue-500" },
  ];

  const getStatusColor = (status: string) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option?.color || "bg-gray-500";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!request) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0 gap-0">
        {/* Header - Always at top */}
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="text-xl">Update Sample Request Status</DialogTitle>
          <DialogDescription>
            Review and update the status of this sample request
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content - Takes available space */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {/* Request Details Card */}
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted/50 px-4 py-3 border-b">
                <h3 className="text-sm font-semibold text-muted-foreground">Request Details</h3>
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Customer Name</p>
                    <p className="text-sm font-medium">sujal1</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Package className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Product</p>
                    <p className="text-sm font-medium">pant</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm font-medium">Ahmedabad</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Requested On</p>
                    <p className="text-sm font-medium">Invalid Date</p>
                  </div>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Current Status</p>
                  <Badge 
                    className="bg-green-500 text-white capitalize"
                    variant="secondary"
                  >
                    Approved
                  </Badge>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground mb-1">Previous Admin Remark</p>
                  <p className="text-sm bg-muted/30 p-2 rounded border italic break-words">
                    "trial chal rha hai"
                  </p>
                </div>
              </div>
            </div>

            {/* Update Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-semibold">
                  New Status <span className="text-red-500">*</span>
                </Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${option.color}`} />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminRemark" className="text-sm font-semibold">
                  Admin Remark
                </Label>
                <Textarea
                  id="adminRemark"
                  value={adminRemark}
                  onChange={(e) => setAdminRemark(e.target.value)}
                  placeholder="Add notes, comments, or reasons for this status update..."
                  className="min-h-[100px] resize-none"
                  maxLength={500}
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    {adminRemark.length}/500
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Buttons - Always at bottom */}
        <div className="px-6 py-4 border-t shrink-0">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}