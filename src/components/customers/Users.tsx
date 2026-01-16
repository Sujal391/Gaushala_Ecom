"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  UserCheck,
  UserX,
  Calendar,
  Users,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { toast } from "sonner";
import { getAdminCustomers, updateCustomerStatus } from "../../lib/api/auth";

interface Customer {
  id: number;
  name: string;
  email: string;
  mobileNo: string;
  isActive: boolean;
  createdAt: string;
}

export default function CompleteCustomersTab() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [searchQuery, customers]);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await getAdminCustomers();
      console.log("Customers API response:", response);

      let data: Customer[] = [];

      if (response?.success && response.data) {
        data = response.data;
      } else if (Array.isArray(response)) {
        data = response;
      }

      const sorted = data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );

      setCustomers(sorted);
      setFilteredCustomers(sorted);
      toast.success(`Loaded ${sorted.length} customers`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load customers");
      setCustomers([]);
      setFilteredCustomers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCustomers = () => {
    if (!searchQuery) {
      setFilteredCustomers(customers);
      return;
    }

    const query = searchQuery.toLowerCase();
    setFilteredCustomers(
      customers.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.mobileNo.includes(query) ||
          c.id.toString().includes(query)
      )
    );
  };

  const handleStatusToggle = async (customerId: number, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      
      // Optimistically update UI
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customerId ? { ...c, isActive: newStatus } : c
        )
      );
      
      await updateCustomerStatus(customerId, newStatus);
      
      toast.success(
        `Customer ${newStatus ? "activated" : "deactivated"} successfully`
      );
    } catch (error) {
      console.error(error);
      // Revert on error
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === customerId ? { ...c, isActive: currentStatus } : c
        )
      );
      toast.error("Failed to update customer status");
    }
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading customers...</p>
      </div>
    );
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Total Customers
                </p>
                <p className="text-xl sm:text-2xl font-bold">
                  {customers.length}
                </p>
              </div>
              <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Active
                </p>
                <p className="text-xl sm:text-2xl font-bold">
                  {customers.filter((c) => c.isActive).length}
                </p>
              </div>
              <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Inactive
                </p>
                <p className="text-xl sm:text-2xl font-bold">
                  {customers.filter((c) => !c.isActive).length}
                </p>
              </div>
              <UserX className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4 sm:p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, phone or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      {filteredCustomers.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            No customers found
          </h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? "Try adjusting your search query"
              : "Customers will appear here once they register"}
          </p>
        </div>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">ID</TableHead>
                      <TableHead className="text-xs sm:text-sm">Name</TableHead>
                      <TableHead className="text-xs sm:text-sm">Email</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden md:table-cell">
                        Mobile
                      </TableHead>
                      <TableHead className="text-xs sm:text-sm hidden lg:table-cell">
                        Joined
                      </TableHead>
                      <TableHead className="text-right text-xs sm:text-sm">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredCustomers.map((c) => (
                      <TableRow key={c.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium text-xs sm:text-sm">
                          #{c.id}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          <div className="font-medium">{c.name}</div>
                          <div className="text-xs text-muted-foreground md:hidden">
                            {c.mobileNo}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm text-muted-foreground truncate max-w-[150px]">
                          {c.email}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm hidden md:table-cell">
                          {c.mobileNo}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm text-muted-foreground hidden lg:table-cell">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(c.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Switch
                            checked={c.isActive}
                            onCheckedChange={() =>
                              handleStatusToggle(c.id, c.isActive)
                            }
                            className={`h-4 w-7 ${
                              c.isActive
                                ? "data-[state=checked]:bg-green-500"
                                : "data-[state=unchecked]:bg-red-600"
                            }`}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Showing {filteredCustomers.length} of {customers.length} customers
          </div>
        </>
      )}
    </>
  );
}