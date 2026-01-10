"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  Menu,
  Loader2,
  ShoppingBag,
  Tag,
  Plus,
  Calendar,
  Percent,
  X,
  Clock,
  Tag as TagIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
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

import { toast } from "sonner";
import AdminGuard from "../../../components/guards/AdminGuard";
import { removeAuthToken } from "../../../lib/api/config";
import { getAllOffers, createOffer, getAllProducts } from "../../../lib/api/auth";

interface Product {
  productId: number;
  productName: string;
}

interface Offer {
  offerId: number;
  offerCode: string;
  discountPercent: number;
  minQuantity: number;
  validFrom: string;
  validTo: string;
  products: Product[];
}

interface CreateOfferPayload {
  offerCode: string;
  discountPercent: number;
  minQuantity: number;
  validFrom: string;
  validTo: string;
  productIds: number[];
}

interface ProductOption {
  id: number;
  name: string;
}

export default function AdminOffersPage() {
  const router = useRouter();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateOfferPayload>({
    offerCode: "",
    discountPercent: 0,
    minQuantity: 1,
    validFrom: "",
    validTo: "",
    productIds: [],
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["discountPercent", "minQuantity"].includes(name)
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

  const resetForm = () => {
    setFormData({
      offerCode: "",
      discountPercent: 0,
      minQuantity: 1,
      validFrom: "",
      validTo: "",
      productIds: [],
    });
  };

  const handleCreateOffer = async () => {
    if (!formData.offerCode || !formData.validFrom || !formData.validTo) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.discountPercent <= 0 || formData.discountPercent > 100) {
      toast.error("Discount percentage must be between 1 and 100");
      return;
    }

    if (formData.minQuantity < 1) {
      toast.error("Minimum quantity must be at least 1");
      return;
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
      const response = await createOffer(formData);

      if (response.success) {
        toast.success("Offer created successfully");
        setIsCreateDialogOpen(false);
        resetForm();
        fetchOffers();
      } else {
        toast.error(response.message || "Failed to create offer");
      }
    } catch (error) {
      console.error(error);
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

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin', active: true },
    { icon: Package, label: 'Products', href: '/admin/products', active: false },
    { icon: ShoppingCart, label: 'Orders', href: '/admin/orders', active: false },
    { icon: Clock, label: 'Pending Orders', href: '/admin/pending', active: false },
    { icon: TagIcon, label: 'Offers', href: '/admin/offer', active: false },
    { icon: Users, label: 'Customers', href: '/admin/customers', active: false },
    { icon: Settings, label: 'Settings', href: '/admin/settings', active: false },
  ];

  const Sidebar = ({ isMobile = false }) => (
    <div className={`${isMobile ? 'w-full' : 'w-64'} bg-card border-r flex flex-col h-full`}>
      <div className="p-4 sm:p-6 border-b">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-8 w-8 text-primary" />
          <span className="text-xl sm:text-2xl font-bold">StyleHub Admin</span>
        </div>
      </div>

      <nav className="flex-1 p-3 sm:p-4 space-y-1 sm:space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.label}
            variant={item.active ? 'secondary' : 'ghost'}
            className="w-full justify-start gap-3 text-sm sm:text-base py-2 sm:py-3 h-auto"
            onClick={() => {
              router.push(item.href);
              if (isMobile) setIsSidebarOpen(false);
            }}
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Button>
        ))}
      </nav>

      <div className="p-3 sm:p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive"
          onClick={() => {
            removeAuthToken();
            router.push("/shop");
          }}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <AdminGuard>
      <div className="min-h-screen bg-background flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block fixed left-0 top-0 h-full z-40">
          <Sidebar />
        </aside>

        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-background border-b">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden">
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-[300px]">
                    <Sidebar isMobile />
                  </SheetContent>
                </Sheet>

                <h1 className="text-2xl font-bold">Offers</h1>
              </div>

              <div className="flex gap-2">
                <Button onClick={fetchOffers} variant="outline" size="sm">
                  Refresh
                </Button>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Offer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Offer</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
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

                        <div>
                          <Label htmlFor="discountPercent">Discount (%) *</Label>
                          <Input
                            id="discountPercent"
                            name="discountPercent"
                            type="number"
                            min="1"
                            max="100"
                            value={formData.discountPercent || ""}
                            onChange={handleInputChange}
                            placeholder="10"
                          />
                        </div>
                      </div>

                      <div>
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

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="validFrom">Valid From *</Label>
                          <Input
                            id="validFrom"
                            name="validFrom"
                            type="datetime-local"
                            value={formData.validFrom}
                            onChange={handleInputChange}
                          />
                        </div>

                        <div>
                          <Label htmlFor="validTo">Valid To *</Label>
                          <Input
                            id="validTo"
                            name="validTo"
                            type="datetime-local"
                            value={formData.validTo}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Select Products *</Label>
                        {isLoadingProducts ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        ) : (
                          <div className="border rounded-md p-4 max-h-60 overflow-y-auto space-y-2">
                            {products.length === 0 ? (
                              <p className="text-sm text-muted-foreground text-center py-4">
                                No products available
                              </p>
                            ) : (
                              products.map((product) => (
                                <div
                                  key={product.id}
                                  className="flex items-center space-x-2"
                                >
                                  <Checkbox
                                    id={`product-${product.id}`}
                                    checked={formData.productIds.includes(product.id)}
                                    onCheckedChange={() => handleProductToggle(product.id)}
                                  />
                                  <label
                                    htmlFor={`product-${product.id}`}
                                    className="text-sm cursor-pointer flex-1"
                                  >
                                    {product.name}
                                  </label>
                                </div>
                              ))
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
            </div>
          </header>

          {/* Content */}
          <main className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                Loading offers...
              </div>
            ) : (
              <>
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <Card>
                    <CardContent className="p-6 flex justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Offers</p>
                        <p className="text-2xl font-bold">{offers.length}</p>
                      </div>
                      <Tag className="h-8 w-8 text-blue-500" />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6 flex justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active Now</p>
                        <p className="text-2xl font-bold">
                          {offers.filter((o) => isOfferActive(o)).length}
                        </p>
                      </div>
                      <Percent className="h-8 w-8 text-green-500" />
                    </CardContent>
                  </Card>

                  {/* <Card>
                    <CardContent className="p-6 flex justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Discount</p>
                        <p className="text-2xl font-bold">
                          {offers.length > 0
                            ? Math.round(
                                offers.reduce((sum, o) => sum + o.discountPercent, 0) /
                                  offers.length
                              )
                            : 0}
                          %
                        </p>
                      </div>
                      <Calendar className="h-8 w-8 text-purple-500" />
                    </CardContent>
                  </Card> */}
                </div>

                {/* Offers Table */}
                {offers.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No offers found</p>
                      <p className="text-sm mt-2">Create your first offer to get started</p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Offer Code</TableHead>
                              <TableHead>Discount</TableHead>
                              <TableHead>Min Qty</TableHead>
                              <TableHead>Valid From</TableHead>
                              <TableHead>Valid To</TableHead>
                              <TableHead>Products</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>

                          <TableBody>
                            {offers.map((offer) => (
                              <TableRow key={offer.offerId}>
                                <TableCell className="font-medium">
                                  <Badge variant="outline" className="font-mono">
                                    {offer.offerCode}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="secondary">
                                    {offer.discountPercent}% OFF
                                  </Badge>
                                </TableCell>
                                <TableCell>{offer.minQuantity}</TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                  {formatDateTime(offer.validFrom)}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                  {formatDateTime(offer.validTo)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {offer.products.slice(0, 2).map((p) => (
                                      <Badge key={p.productId} variant="outline" className="text-xs">
                                        {p.productName}
                                      </Badge>
                                    ))}
                                    {offer.products.length > 2 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{offer.products.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  {isOfferActive(offer) ? (
                                    <Badge className="bg-green-500">Active</Badge>
                                  ) : new Date() < new Date(offer.validFrom) ? (
                                    <Badge variant="outline">Upcoming</Badge>
                                  ) : (
                                    <Badge variant="secondary">Expired</Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="mt-6 text-center text-sm text-muted-foreground">
                  Showing {offers.length} offer{offers.length !== 1 ? "s" : ""}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}