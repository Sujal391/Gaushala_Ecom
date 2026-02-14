"use client";

import React, { useEffect, useState } from "react";
import { User, Mail, Phone, Calendar, Copy, Check, Loader2, Users, ChevronDown, ChevronUp, Info } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { getMyProfile, getMyReferrals } from "../lib/api/auth";
import { MyReferralResponse } from "../types";

interface ProfileData {
  userId: number;
  name: string;
  email: string;
  mobileNo: string;
  referralCode: string;
  referredByUserId: number | null;
  createdAt: string;
}

interface ProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Profile({ isOpen, onClose }: ProfileProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [referrals, setReferrals] = useState<MyReferralResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingReferrals, setLoadingReferrals] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isReferralsOpen, setIsReferralsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
      fetchReferrals();
      // Reset dropdown state when dialog opens
      setIsReferralsOpen(false);
    }
  }, [isOpen]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await getMyProfile();
      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        toast.error("Failed to load profile");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fetchReferrals = async () => {
    setLoadingReferrals(true);
    try {
      const response = await getMyReferrals();
      if (response.success && response.data) {
        setReferrals(response.data);
      }
    } catch {
      // Silently fail for referrals - don't show error toast
    } finally {
      setLoadingReferrals(false);
    }
  };

  const copyReferralCode = () => {
    if (!profile?.referralCode) return;
    navigator.clipboard.writeText(profile.referralCode);
    setCopied(true);
    toast.success("Referral code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (value: string) =>
    new Date(value).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
          <DialogHeader className="px-6 pt-6 pb-4 border-b sticky top-0 bg-background z-10">
            <DialogTitle className="text-xl font-semibold">My Profile</DialogTitle>
          </DialogHeader>

          <div className="px-6 pb-6 pt-0">
            {loading ? (
              <ProfileSkeleton />
            ) : profile ? (
              <div className="space-y-6">
                {/* Profile Header */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-primary/20">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-xl bg-primary/10">
                      {profile.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{profile.name}</h3>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                    <Badge variant="outline" className="mt-1 text-xs">
                      ID: {profile.userId}
                    </Badge>
                  </div>
                </div>

                {/* Profile Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoCard
                    icon={<Mail className="h-4 w-4" />}
                    label="Email"
                    value={profile.email}
                  />
                  <InfoCard
                    icon={<Phone className="h-4 w-4" />}
                    label="Phone"
                    value={profile.mobileNo}
                  />
                  <div className="col-span-2">
                    <InfoCard
                      icon={<Copy className="h-4 w-4" />}
                      label={
                        <div className="flex items-center gap-1">
                          <span>Referral Code</span>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs p-3 bg-white text-black border">
                              <p className="text-sm font-medium mb-1">🎉 Referral Bonus!</p>
                              <p className="text-xs">
                                You and your referral will get 10% discount on 1st order after referral activation.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      }
                      value={
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <code className="font-mono font-semibold bg-primary/10 px-3 py-1.5 rounded-md flex-1 cursor-help hover:bg-primary/15 transition-colors">
                                {profile.referralCode}
                              </code>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="bg-white text-black border max-w-xs p-3">
                              <p className="text-sm font-medium mb-1">🎉 Share & Earn!</p>
                              <p className="text-xs">
                                Share this code with friends. Both get 10% off on their 1st order!
                              </p>
                            </TooltipContent>
                          </Tooltip>
                          <Button
                            size="sm"
                            variant={copied ? "default" : "outline"}
                            onClick={copyReferralCode}
                            className="h-9"
                          >
                            {copied ? (
                              <>
                                <Check className="h-4 w-4 mr-2" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy
                              </>
                            )}
                          </Button>
                        </div>
                      }
                    />
                  </div>
                </div>

                {/* Referral Status */}
                {profile.referredByUserId && (
                  <div className="p-3 bg-primary/5 rounded-lg border text-sm">
                    <p className="text-muted-foreground">Referred by user</p>
                    <p className="font-medium">#{profile.referredByUserId}</p>
                  </div>
                )}

                {/* Referrals Dropdown Section */}
                <div className="border-t pt-4">
                  <Collapsible
                    open={isReferralsOpen}
                    onOpenChange={setIsReferralsOpen}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <h3 className="font-semibold text-lg">My Referrals</h3>
                        {referrals && referrals.totalReferredCount > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {referrals.totalReferredCount}
                          </Badge>
                        )}
                      </div>
                      
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-2">
                          {isReferralsOpen ? (
                            <>
                              <ChevronUp className="h-4 w-4" />
                              Hide
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" />
                              View Referrals
                            </>
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent className="space-y-4 pt-2">
                      {loadingReferrals ? (
                        <ReferralsSkeleton />
                      ) : referrals && referrals.referredUsers.length > 0 ? (
                        <div className="space-y-3">
                          {referrals.referredUsers.map((user) => (
                            <Card key={user.userId} className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="space-y-2 flex-1">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback className="bg-primary/10 text-sm">
                                        {user.name.charAt(0).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium">{user.name}</p>
                                      <p className="text-xs text-muted-foreground">
                                        ID: {user.userId}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <Mail className="h-3 w-3" />
                                      <span className="truncate">{user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-muted-foreground">
                                      <Phone className="h-3 w-3" />
                                      <span>{user.mobileNo}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2 text-xs">
                                    <Calendar className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-muted-foreground">
                                      Joined: {formatDate(user.registeredAt)}
                                    </span>
                                    {user.isReferralUsed && (
                                      <Badge variant="success" className="text-[10px] px-1.5 py-0">
                                        Referral Used
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-muted/30 rounded-lg">
                          <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                          <p className="text-muted-foreground">No referrals yet</p>
                          <p className="text-sm text-muted-foreground/70 mt-1">
                            Share your referral code to earn rewards!
                          </p>
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No profile data found</p>
                <Button variant="outline" className="mt-4" onClick={fetchProfile}>
                  Retry
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

/* ------------------ Reusable Components ------------------ */

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: React.ReactNode; value: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <div className="bg-primary/10 p-1.5 rounded-md">{icon}</div>
        <span>{label}</span>
      </div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-center">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ReferralsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <Card key={i} className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <Skeleton className="h-3 w-32" />
          </div>
        </Card>
      ))}
    </div>
  );
}