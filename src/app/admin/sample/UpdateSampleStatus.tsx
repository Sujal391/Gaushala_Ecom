"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
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

interface UpdateSampleStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: SampleRequest;
  onSuccess: () => void;
}

export default function UpdateSampleStatusModal({
  isOpen,
  onClose,
  request,
  onSuccess,
}: UpdateSampleStatusModalProps) {
  const [status, setStatus] = useState<string>(request.status);
  const [adminRemark, setAdminRemark] = useState<string>(request.adminRemark || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
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
        status: status as "pending" | "approved" | "rejected" | "shipped",
        adminRemark: adminRemark.trim() || undefined,
      };

      console.log("=== UPDATE PAYLOAD ===");
      console.log(JSON.stringify(payload, null, 2));
      console.log("=====================");

      const response = await updateSampleRequestStatus(
        request.sampleRequestId,
        payload
      );

      console.log("=== API RESPONSE ===");
      console.log(response);
      console.log("===================");

      if (response.success) {
        toast.success("Sample request status updated successfully");
        onSuccess();
      } else {
        toast.error(response.message || "Failed to update status");
      }
    } catch (error) {
      console.error("=== ERROR DETAILS ===");
      console.error(error);
      console.error("====================");
      toast.error("Failed to update sample request status");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "shipped", label: "Shipped" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Sample Request Status</DialogTitle>
          <DialogDescription>
            Update the status and add remarks for this sample request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium">Request ID</p>
                <p className="text-sm text-muted-foreground">
                  #{request.sampleRequestId}
                </p>
              </div>
              <Badge variant="outline" className="text-xs">
                User #{request.userId}
              </Badge>
            </div>

            <div className="pt-2 border-t">
              <p className="text-sm font-medium">{request.productName}</p>
              <p className="text-xs text-muted-foreground">{request.city}</p>
            </div>

            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">Current Status</p>
              <Badge className="mt-1 capitalize">{request.status}</Badge>
            </div>

            {request.adminRemark && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">Previous Remark</p>
                <p className="text-sm mt-1">{request.adminRemark}</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">New Status *</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminRemark">Admin Remark</Label>
            <Textarea
              id="adminRemark"
              value={adminRemark}
              onChange={(e) => setAdminRemark(e.target.value)}
              placeholder="Add any notes or comments about this request..."
              className="min-h-[100px] resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {adminRemark.length}/500 characters
            </p>
          </div>

          <div className="flex gap-2 pt-4">
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