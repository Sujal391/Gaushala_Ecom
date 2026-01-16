"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  Users,
  UserPlus,
  Mail,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Hash,
  Phone,
  Calendar,
  CheckCircle,
  Circle,
  FileText,
  User,
  Shield,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { toast } from "sonner";
import AdminGuard from "../../../components/guards/AdminGuard";
import AdminLayout from "../../../components/layout/AdminLayout";
import { getReferralSummary } from "../../../lib/api/auth";
import { format } from "date-fns";

/* ===================== TYPES ===================== */

interface ReferredUser {
  userId: number;
  name: string;
  email: string;
  mobileNo: string;
  registeredAt: string;
  isReferralUsed: boolean;
}

interface Referrer {
  referrerUserId: number;
  referrerName: string;
  referrerEmail: string;
  referralCode: string;
  totalReferredCount: number;
  referredUsers: ReferredUser[];
}

interface ReferralSummaryResponse {
  success: boolean;
  totalReferrers: number;
  data: Referrer[];
}

/* ===================== PAGE ===================== */

export default function AdminReferralSummaryPage() {
  const [summary, setSummary] = useState<ReferralSummaryResponse | null>(null);
  const [filteredData, setFilteredData] = useState<Referrer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedAccordions, setExpandedAccordions] = useState<string[]>([]);

  useEffect(() => {
    fetchReferralSummary();
  }, []);

  useEffect(() => {
    filterData();
  }, [searchQuery, statusFilter, summary]);

  /* ===================== API ===================== */

  const fetchReferralSummary = async () => {
    setIsLoading(true);
    try {
      const response = await getReferralSummary();

      if (response?.success && response.data) {
        setSummary(response);
        setFilteredData(response.data);
        // Auto-expand active referrers
        const activeReferrers = response.data
          .filter(r => r.totalReferredCount > 0)
          .map(r => r.referrerUserId.toString());
        setExpandedAccordions(activeReferrers);
      } else {
        setSummary(null);
        toast.error(response?.message || "Failed to fetch referral summary");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while fetching referral summary");
    } finally {
      setIsLoading(false);
    }
  };

  /* ===================== FILTER ===================== */

  const filterData = () => {
    if (!summary?.data) {
      setFilteredData([]);
      return;
    }

    let filtered = summary.data;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (referrer) =>
          referrer.referrerName.toLowerCase().includes(query) ||
          referrer.referrerEmail.toLowerCase().includes(query) ||
          referrer.referralCode.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter === "active") {
      filtered = filtered.filter((referrer) => referrer.totalReferredCount > 0);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((referrer) => referrer.totalReferredCount === 0);
    }

    setFilteredData(filtered);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy, hh:mm a");
    } catch {
      return dateString;
    }
  };

  const getTotalReferrals = () => {
    return summary?.data?.reduce((total, referrer) => total + referrer.totalReferredCount, 0) || 0;
  };

  const getActiveReferrers = () => {
    return summary?.data?.filter((referrer) => referrer.totalReferredCount > 0).length || 0;
  };

  const getTotalReferredUsers = () => {
    return summary?.data?.reduce(
      (total, referrer) => total + referrer.referredUsers.length,
      0
    ) || 0;
  };

  const headerAction = (
    <Button onClick={fetchReferralSummary} variant="outline" size="sm" className="gap-2">
      <Loader2 className="h-4 w-4" />
      <span className="hidden sm:inline">Refresh</span>
    </Button>
  );

  /* ===================== RENDER ===================== */

  return (
    <AdminGuard>
      <AdminLayout title="Referral Summary" headerAction={headerAction}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading referral summary...</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="border shadow-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                        Total Referrers
                      </p>
                      <p className="text-2xl sm:text-3xl font-bold">
                        {summary?.totalReferrers || 0}
                      </p>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border shadow-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                        Total Referrals
                      </p>
                      <p className="text-2xl sm:text-3xl font-bold">
                        {getTotalReferrals()}
                      </p>
                    </div>
                    <div className="p-2 bg-green-50 rounded-lg">
                      <UserPlus className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border shadow-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                        Active Referrers
                      </p>
                      <p className="text-2xl sm:text-3xl font-bold">
                        {getActiveReferrers()}
                      </p>
                    </div>
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border shadow-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                        Referred Users
                      </p>
                      <p className="text-2xl sm:text-3xl font-bold">
                        {getTotalReferredUsers()}
                      </p>
                    </div>
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <User className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6 border shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name, email or referral code"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Referrers</SelectItem>
                        <SelectItem value="active">Active Only</SelectItem>
                        <SelectItem value="inactive">Inactive Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Referrers List as Accordion */}
            {filteredData.length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-muted/20">
                <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No referrers found
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your filters"
                    : "No referral data available"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    Referrers ({filteredData.length})
                  </h2>
                  <div className="text-sm text-muted-foreground">
                    Showing {filteredData.length} of {summary?.totalReferrers || 0}
                  </div>
                </div>

                <Accordion 
                  type="multiple" 
                  value={expandedAccordions}
                  onValueChange={setExpandedAccordions}
                  className="space-y-3"
                >
                  {filteredData.map((referrer) => (
                    <AccordionItem
                      key={referrer.referrerUserId}
                      value={referrer.referrerUserId.toString()}
                      className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/30">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full text-left">
                          {/* Left side: Referrer Info */}
                          <div className="flex items-start sm:items-center gap-3 mb-2 sm:mb-0">
                            <div className="p-2 rounded-full bg-primary/10">
                              {referrer.totalReferredCount > 0 ? (
                                <UserCheck className="h-5 w-5 text-primary" />
                              ) : (
                                <User className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                <span className="font-semibold text-sm sm:text-base">
                                  {referrer.referrerName}
                                </span>
                                <Badge 
                                  variant="outline" 
                                  className="w-fit text-xs font-mono bg-gray-50"
                                >
                                  <Hash className="h-3 w-3 mr-1" />
                                  {referrer.referrerUserId}
                                </Badge>
                              </div>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  {referrer.referrerEmail}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Shield className="h-3 w-3" />
                                  Code: <span className="font-mono">{referrer.referralCode}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Right side: Stats */}
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <Badge 
                                variant={referrer.totalReferredCount > 0 ? "default" : "outline"}
                                className={`text-sm ${
                                  referrer.totalReferredCount > 0 
                                    ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-200" 
                                    : "bg-gray-100 text-gray-800 border-gray-200"
                                }`}
                              >
                                {referrer.totalReferredCount === 0 ? (
                                  <>
                                    <Circle className="h-3 w-3 mr-1" />
                                    No referrals
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    {referrer.totalReferredCount} referral{referrer.totalReferredCount !== 1 ? 's' : ''}
                                  </>
                                )}
                              </Badge>
                            </div>
                            {/* <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" /> */}
                          </div>
                        </div>
                      </AccordionTrigger>

                      <AccordionContent className="px-6 pb-4 pt-0">
                        <Separator className="mb-4" />
                        
                        {referrer.referredUsers.length > 0 ? (
                          <>
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-sm flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  Referred Users ({referrer.referredUsers.length})
                                </h3>
                                <Badge variant="outline" className="text-xs">
                                  {referrer.referredUsers.filter(u => u.isReferralUsed).length} used
                                </Badge>
                              </div>

                              <div className="overflow-x-auto">
                                <Table>
                                  <TableHeader>
                                    <TableRow className="bg-muted/50">
                                      <TableHead className="font-semibold">User</TableHead>
                                      <TableHead className="font-semibold">Contact</TableHead>
                                      <TableHead className="font-semibold hidden sm:table-cell">Registered</TableHead>
                                      <TableHead className="font-semibold">Status</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {referrer.referredUsers.map((user) => (
                                      <TableRow key={user.userId} className="hover:bg-muted/30">
                                        <TableCell>
                                          <div className="font-medium">{user.name}</div>
                                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Hash className="h-3 w-3" />
                                            ID: {user.userId}
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <div className="space-y-1">
                                            <div className="text-sm">{user.email}</div>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                              <Phone className="h-3 w-3" />
                                              {user.mobileNo}
                                            </div>
                                          </div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                          <div className="flex items-center gap-1 text-sm">
                                            <Calendar className="h-3 w-3 text-muted-foreground" />
                                            {formatDate(user.registeredAt)}
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <Badge
                                            variant={user.isReferralUsed ? "default" : "secondary"}
                                            className={
                                              user.isReferralUsed
                                                ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
                                                : "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200"
                                            }
                                          >
                                            {user.isReferralUsed ? (
                                              <>
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Used
                                              </>
                                            ) : (
                                              "Not Used"
                                            )}
                                          </Badge>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-6 border rounded-lg bg-muted/20">
                            <UserPlus className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                            <p className="text-muted-foreground font-medium">No referred users yet</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              This user hasn't referred anyone yet
                            </p>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}