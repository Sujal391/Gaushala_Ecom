"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Tag,
  Plus,
  Calendar,
  Percent,
  X,
  Package,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Offer, CreateOfferPayload } from "@/src/types";
import { toast } from "sonner";
import AdminGuard from "../../../components/guards/AdminGuard";
import AdminLayout from "../../../components/layout/AdminLayout";
import {
  getAllOffers,
  createOffer,
  getAllProducts,
} from "../../../lib/api/auth";

interface Product {
  productId: number;
  productName: string;
}

interface ProductOption {
  id: number;
  name: string;
}

interface Slab {
  minAmount: number;
  maxAmount: number;
  discountPercent: number;
}

export default function AdminOffersPage() {
  const router = useRouter();

  const [offers, setOffers] = useState<Offer[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateOfferPayload>({
    offerCode: "",
    offerType: "FLAT",
    discountPercent: 0,
    minQuantity: 1,
    productIds: [],
    maxDiscountPercent: 0,
    slabs: [],
    validFrom: "",
    validTo: "",
  });

  useEffect(() => {
    fetchOffers();
  }, []);

  useEffect(() => {
    if (isCreateDialogOpen && products.length === 0) {
      fetchProducts();
    }
  }, [isCreateDialogOpen]);

  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      const response = await getAllOffers();
      console.log("Offers API response:", response);

      let data: Offer[] = [];

      if (response?.success && response.data) {
        data = response.data;
      } else if (Array.isArray(response)) {
        data = response;
      }

      const sorted = data.sort(
        (a, b) =>
          new Date(b.validFrom).getTime() - new Date(a.validFrom).getTime()
      );

      setOffers(sorted);
      toast.success(`Loaded ${sorted.length} offers`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load offers");
      setOffers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const response = await getAllProducts();
      console.log("Products API response:", response);

      let data: any[] = [];

      if (response?.success && response.data) {
        data = response.data;
      } else if (Array.isArray(response)) {
        data = response;
      }

      const productOptions = data.map((p) => ({
        id: p.id || p.productId,
        name: p.name || p.productName,
      }));

      setProducts(productOptions);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load products");
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const toISOStringUTC = (localDate: string) => {
    if (!localDate) return "";
    return `${localDate}T00:00:00`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: ["discountPercent", "minQuantity", "maxDiscountPercent"].includes(
        name
      )
        ? Number(value)
        : value,
    }));
  };

  const handleProductToggle = (productId: number) => {
    setFormData((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter((id) => id !== productId)
        : [...prev.productIds, productId],
    }));
  };

  const handleOfferTypeChange = (newType: string) => {
    setFormData((prev) => ({
      ...prev,
      offerType: newType,
      discountPercent: newType === "FLAT" ? 0 : prev.discountPercent,
      minQuantity: newType === "FLAT" ? 1 : 0,
      maxDiscountPercent: newType === "UPTO" ? 0 : prev.maxDiscountPercent,
      slabs: newType === "UPTO" ? [] : prev.slabs,
    }));
  };

  const addSlab = () => {
    setFormData((prev) => ({
      ...prev,
      slabs: [
        ...prev.slabs,
        { minAmount: 0, maxAmount: 0, discountPercent: 0 },
      ],
    }));
  };

  const removeSlab = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      slabs: prev.slabs.filter((_, i) => i !== index),
    }));
  };

  const updateSlab = (index: number, field: keyof Slab, value: number) => {
    setFormData((prev) => ({
      ...prev,
      slabs: prev.slabs.map((slab, i) =>
        i === index ? { ...slab, [field]: value } : slab
      ),
    }));
  };

  const resetForm = () => {
    setFormData({
      offerCode: "",
      offerType: "FLAT",
      discountPercent: 0,
      minQuantity: 1,
      productIds: [],
      maxDiscountPercent: 0,
      slabs: [],
      validFrom: "",
      validTo: "",
    });
  };

  const handleCreateOffer = async () => {
    if (!formData.offerCode || !formData.validFrom || !formData.validTo) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.offerType === "FLAT") {
      if (formData.discountPercent <= 0 || formData.discountPercent > 100) {
        toast.error("Discount percentage must be between 1 and 100");
        return;
      }
      if (formData.minQuantity < 1) {
        toast.error("Minimum quantity must be at least 1");
        return;
      }
    }

    if (formData.offerType === "UPTO") {
      if (formData.slabs.length === 0) {
        toast.error("At least one slab is required for price-based offers");
        return;
      }
      for (let i = 0; i < formData.slabs.length; i++) {
        const slab = formData.slabs[i];
        if (slab.minAmount >= slab.maxAmount) {
          toast.error(`Slab ${i + 1}: Max amount must be greater than min amount`);
          return;
        }
        if (slab.discountPercent <= 0 || slab.discountPercent > 100) {
          toast.error(`Slab ${i + 1}: Discount must be between 1 and 100`);
          return;
        }
      }
      if (formData.maxDiscountPercent < 0 || formData.maxDiscountPercent > 100) {
        toast.error("Max discount percent must be between 0 and 100");
        return;
      }
    }

    if (formData.productIds.length === 0) {
      toast.error("Please select at least one product");
      return;
    }

    if (new Date(formData.validFrom) >= new Date(formData.validTo)) {
      toast.error("Valid To date must be after Valid From date");
      return;
    }

    setIsSubmitting(true);
    try {
      let payload: any;

      if (formData.offerType === "FLAT") {
        payload = {
          offerCode: formData.offerCode,
          offerType: formData.offerType,
          discountPercent: formData.discountPercent,
          minQuantity: formData.minQuantity,
          validFrom: toISOStringUTC(formData.validFrom),
          validTo: `${formData.validTo}T23:59:59`,
          productIds: formData.productIds,
        };
      } else {
        payload = {
          offerCode: formData.offerCode,
          offerType: formData.offerType,
          maxDiscountPercent: formData.maxDiscountPercent,
          minQuantity: 1,
          validFrom: toISOStringUTC(formData.validFrom),
          validTo: `${formData.validTo}T23:59:59`,
          slabs: formData.slabs,
          productIds: formData.productIds,
        };
      }

      console.log("=== PAYLOAD BEING SENT ===");
      console.log(JSON.stringify(payload, null, 2));
      console.log("========================");

      const response = await createOffer(payload);

      console.log("=== API RESPONSE ===");
      console.log(response);
      console.log("===================");

      if (response.success) {
        toast.success("Offer created successfully");
        setIsCreateDialogOpen(false);
        resetForm();
        fetchOffers();
      } else {
        toast.error(response.message || "Failed to create offer");
      }
    } catch (error) {
      console.error("=== ERROR DETAILS ===");
      console.error(error);
      console.error("====================");
      toast.error("Failed to create offer");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatDateTime = (date: string) =>
    new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const isOfferActive = (offer: Offer) => {
    const now = new Date();
    const start = new Date(offer.validFrom);
    const end = new Date(offer.validTo);
    return now >= start && now <= end;
  };

  const headerAction = (
    <div className="flex items-center gap-2">
      <Button
        onClick={fetchOffers}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Loader2 className="h-4 w-4" />
        <span className="hidden sm:inline">Refresh</span>
      </Button>
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create Offer</span>
            <span className="sm:hidden">Create</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Offer</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="offerCode">Offer Code *</Label>
                <Input
                  id="offerCode"
                  name="offerCode"
                  value={formData.offerCode}
                  onChange={handleInputChange}
                  placeholder="SUMMER10"
                  className="uppercase"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="offerType">Offer Type *</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={formData.offerType}
                  onChange={(e) => handleOfferTypeChange(e.target.value)}
                >
                  <option value="FLAT">Quantity Based</option>
                  <option value="UPTO">Price Based (Slabs)</option>
                </select>
              </div>
            </div>

            {formData.offerType === "FLAT" && (
              <>
                <div className="space-y-1">
                  <Label htmlFor="minQuantity">Minimum Quantity *</Label>
                  <Input
                    id="minQuantity"
                    name="minQuantity"
                    type="number"
                    min="1"
                    value={formData.minQuantity || ""}
                    onChange={handleInputChange}
                    placeholder="1"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="discountPercent">Discount (%) *</Label>
                  <Input
                    id="discountPercent"
                    name="discountPercent"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.discountPercent || ""}
                    onChange={handleInputChange}
                    placeholder="10"
                  />
                </div>
              </>
            )}

            {formData.offerType === "UPTO" && (
              <>
                <div className="space-y-1">
                  <Label htmlFor="maxDiscountPercent">
                    Max Discount (%) *
                  </Label>
                  <Input
                    id="maxDiscountPercent"
                    name="maxDiscountPercent"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.maxDiscountPercent || ""}
                    onChange={handleInputChange}
                    placeholder="50"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Price Slabs *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addSlab}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Slab
                    </Button>
                  </div>

                  {formData.slabs.length === 0 ? (
                    <div className="border rounded-md p-4 text-center text-sm text-muted-foreground">
                      No slabs added. Click "Add Slab" to create pricing tiers.
                    </div>
                  ) : (
                    <div className="space-y-3 border rounded-md p-4">
                      {formData.slabs.map((slab, index) => (
                        <div
                          key={index}
                          className="border rounded-md p-3 space-y-3 bg-muted/30"
                        >
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-semibold">
                              Slab {index + 1}
                            </Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSlab(index)}
                              className="h-8 w-8 p-0 text-destructive"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="space-y-1">
                              <Label className="text-xs">Min Amount</Label>
                              <Input
                                type="number"
                                min="0"
                                value={slab.minAmount || ""}
                                onChange={(e) =>
                                  updateSlab(
                                    index,
                                    "minAmount",
                                    Number(e.target.value)
                                  )
                                }
                                placeholder="0"
                              />
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs">Max Amount</Label>
                              <Input
                                type="number"
                                min="0"
                                value={slab.maxAmount || ""}
                                onChange={(e) =>
                                  updateSlab(
                                    index,
                                    "maxAmount",
                                    Number(e.target.value)
                                  )
                                }
                                placeholder="1000"
                              />
                            </div>

                            <div className="space-y-1">
                              <Label className="text-xs">Discount %</Label>
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={slab.discountPercent || ""}
                                onChange={(e) =>
                                  updateSlab(
                                    index,
                                    "discountPercent",
                                    Number(e.target.value)
                                  )
                                }
                                placeholder="10"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="validFrom">Valid From *</Label>
                <Input
                  id="validFrom"
                  name="validFrom"
                  type="date"
                  value={formData.validFrom}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="validTo">Valid To *</Label>
                <Input
                  id="validTo"
                  name="validTo"
                  type="date"
                  value={formData.validTo}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Select Products *</Label>

              {isLoadingProducts ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                  {products.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No products available
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            id={`product-${product.id}`}
                            checked={formData.productIds.includes(product.id)}
                            onCheckedChange={() =>
                              handleProductToggle(product.id)
                            }
                          />
                          <label
                            htmlFor={`product-${product.id}`}
                            className="text-sm cursor-pointer leading-tight"
                          >
                            {product.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {formData.productIds.length > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  {formData.productIds.length} product(s) selected
                </p>
              )}
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                disabled={isSubmitting}
                onClick={handleCreateOffer}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Offer"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );

  return (
    <AdminGuard>
      <AdminLayout title="Offers" headerAction={headerAction}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading offers...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Total Offers
                      </p>
                      <p className="text-xl sm:text-2xl font-bold">
                        {offers.length}
                      </p>
                    </div>
                    <Tag className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Active Now
                      </p>
                      <p className="text-xl sm:text-2xl font-bold">
                        {offers.filter((o) => isOfferActive(o)).length}
                      </p>
                    </div>
                    <Percent className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {offers.length === 0 ? (
              <Card>
                <CardContent className="py-8 sm:py-12 text-center">
                  <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">
                    No offers found
                  </h3>
                  <p className="text-muted-foreground">
                    Create your first offer to get started
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
                            <TableHead className="text-xs sm:text-sm">
                              Offer Code
                            </TableHead>
                            <TableHead className="text-xs sm:text-sm">
                              Type
                            </TableHead>
                            <TableHead className="text-xs sm:text-sm">
                              Discount
                            </TableHead>
                            <TableHead className="text-xs sm:text-sm hidden sm:table-cell">
                              Min Qty
                            </TableHead>
                            <TableHead className="text-xs sm:text-sm hidden md:table-cell">
                              Valid From
                            </TableHead>
                            <TableHead className="text-xs sm:text-sm hidden lg:table-cell">
                              Valid To
                            </TableHead>
                            <TableHead className="text-xs sm:text-sm hidden lg:table-cell">
                              Products
                            </TableHead>
                            <TableHead className="text-right text-xs sm:text-sm">
                              Status
                            </TableHead>
                          </TableRow>
                        </TableHeader>

                        <TableBody>
                          {offers.map((offer) => (
                            <TableRow
                              key={offer.offerId}
                              className="hover:bg-muted/30"
                            >
                              <TableCell className="font-medium">
                                <Badge
                                  variant="outline"
                                  className="font-mono text-xs"
                                >
                                  {offer.offerCode}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {offer.offerType}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="text-xs">
                                  {offer.offerType === "FLAT" 
                                    ? `${offer.discountPercent}% OFF`
                                    : `Up to ${offer.maxDiscountPercent}% OFF`
                                  }
                                </Badge>
                                <div className="text-xs text-muted-foreground sm:hidden mt-1">
                                  Min Qty: {offer.minQuantity}
                                </div>
                              </TableCell>
                              <TableCell className="hidden sm:table-cell">
                                {offer.minQuantity}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-xs hidden md:table-cell">
                                {formatDateTime(offer.validFrom)}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-xs hidden lg:table-cell">
                                {formatDateTime(offer.validTo)}
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <div className="flex flex-wrap gap-1">
                                  {offer.products.slice(0, 2).map((p) => (
                                    <Badge
                                      key={p.productId}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {p.productName}
                                    </Badge>
                                  ))}
                                  {offer.products.length > 2 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      +{offer.products.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                {isOfferActive(offer) ? (
                                  <Badge className="bg-green-500 text-xs">
                                    Active
                                  </Badge>
                                ) : new Date() < new Date(offer.validFrom) ? (
                                  <Badge variant="outline" className="text-xs">
                                    Upcoming
                                  </Badge>
                                ) : (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Expired
                                  </Badge>
                                )}
                                <div className="text-xs text-muted-foreground mt-1 md:hidden">
                                  {formatDate(offer.validFrom)} -{" "}
                                  {formatDate(offer.validTo)}
                                </div>
                                {offer.products.length > 0 && (
                                  <div className="text-xs text-muted-foreground mt-1 lg:hidden">
                                    {offer.products.length} product(s)
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>

                <div className="mt-6 text-center text-sm text-muted-foreground">
                  Showing {offers.length} offer{offers.length !== 1 ? "s" : ""}
                </div>
              </>
            )}
          </>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}