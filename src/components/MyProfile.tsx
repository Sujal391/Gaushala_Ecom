"use client";

import React, { useEffect, useState } from "react";
import { User, Mail, Phone, Calendar, Copy, Check, Loader2 } from "lucide-react";
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

import { getMyProfile } from "../lib/api/auth";

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
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) fetchProfile();
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl font-semibold">My Profile</DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 pt-0">
          {loading ? (
            <ProfileSkeleton />
          ) : profile ? (
            <div className="space-y-5">
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
                <InfoCard
                  icon={<Calendar className="h-4 w-4" />}
                  label="Joined"
                  value={formatDate(profile.createdAt)}
                />
                <div className="col-span-2">
                  <InfoCard
                    icon={<Copy className="h-4 w-4" />}
                    label="Referral Code"
                    value={
                      <div className="flex items-center gap-2">
                        <code className="font-mono font-semibold bg-primary/10 px-3 py-1.5 rounded-md flex-1">
                          {profile.referralCode}
                        </code>
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
  );
}

/* ------------------ Reusable Components ------------------ */

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
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