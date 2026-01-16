"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  UserCheck,
  UserX,
  Calendar,
  Mail,
} from "lucide-react";

import { Input } from "@/components/ui/input";
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
import { getIncompleteUsers } from "../../lib/api/auth";

interface IncompleteUser {
  userId: number;
  email?: string;
  mobileNo?: string;
  name?: string;
  createdAt: string;
}

export default function IncompleteUsersTab() {
  const [incompleteUsers, setIncompleteUsers] = useState<IncompleteUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<IncompleteUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchIncompleteUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchQuery, incompleteUsers]);

  const fetchIncompleteUsers = async () => {
    setIsLoading(true);
    try {
      const response = await getIncompleteUsers();
      console.log("Incomplete users API response:", response);

      let data: IncompleteUser[] = [];

      if (response?.success && response.data) {
        // Handle nested data structure
        data = response.data.data || response.data;
      } else if (Array.isArray(response)) {
        data = response;
      }

      const sorted = data.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );

      setIncompleteUsers(sorted);
      setFilteredUsers(sorted);
      toast.success(`Loaded ${sorted.length} incomplete users`);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load incomplete users");
      setIncompleteUsers([]);
      setFilteredUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchQuery) {
      setFilteredUsers(incompleteUsers);
      return;
    }

    const query = searchQuery.toLowerCase();
    setFilteredUsers(
      incompleteUsers.filter(
        (u) =>
          (u.name && u.name.toLowerCase().includes(query)) ||
          (u.email && u.email.toLowerCase().includes(query)) ||
          (u.mobileNo && u.mobileNo.includes(query)) ||
          u.userId.toString().includes(query)
      )
    );
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
        <p className="text-muted-foreground">Loading incomplete users...</p>
      </div>
    );
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Incomplete Registrations
                </p>
                <p className="text-xl sm:text-2xl font-bold">
                  {incompleteUsers.length}
                </p>
              </div>
              <UserX className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Missing Email
                </p>
                <p className="text-xl sm:text-2xl font-bold">
                  {incompleteUsers.filter((u) => !u.email).length}
                </p>
              </div>
              <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500" />
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
              placeholder="Search incomplete users by ID, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Incomplete Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            No incomplete users found
          </h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? "Try adjusting your search query"
              : "All users have completed registration"}
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
                        Started
                      </TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow key={u.userId} className="hover:bg-muted/30">
                        <TableCell className="font-medium text-xs sm:text-sm">
                          #{u.userId}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {u.name || (
                            <span className="text-muted-foreground italic">
                              Not provided
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          {u.email || (
                            <span className="text-muted-foreground italic">
                              Not provided
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm hidden md:table-cell">
                          {u.mobileNo || (
                            <span className="text-muted-foreground italic">
                              Not provided
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm text-muted-foreground hidden lg:table-cell">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(u.createdAt)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Showing {filteredUsers.length} of {incompleteUsers.length} incomplete users
          </div>
        </>
      )}
    </>
  );
}