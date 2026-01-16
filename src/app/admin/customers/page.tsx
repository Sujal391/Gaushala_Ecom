"use client";

import { useState } from "react";
import { Loader2, UserCheck, UserX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import AdminGuard from "../../../components/guards/AdminGuard";
import AdminLayout from "../../../components/layout/AdminLayout";
import CompleteCustomersTab from "../../../components/customers/Users";
import IncompleteUsersTab from "../../../components/customers/IncompleteUsers";

export default function AdminCustomersPage() {
  const [activeTab, setActiveTab] = useState("complete");

  const headerAction = (
    <Button 
      onClick={() => window.location.reload()} 
      variant="outline" 
      size="sm" 
      className="gap-2"
    >
      <Loader2 className="h-4 w-4" />
      <span className="hidden sm:inline">Refresh</span>
    </Button>
  );

  return (
    <AdminGuard>
      <AdminLayout title="Customers" headerAction={headerAction}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="complete" className="gap-2">
              <UserCheck className="h-4 w-4" />
              Complete Users
            </TabsTrigger>
            <TabsTrigger value="incomplete" className="gap-2">
              <UserX className="h-4 w-4" />
              Incomplete Users
            </TabsTrigger>
          </TabsList>

          <TabsContent value="complete" className="mt-0">
            <CompleteCustomersTab />
          </TabsContent>

          <TabsContent value="incomplete" className="mt-0">
            <IncompleteUsersTab />
          </TabsContent>
        </Tabs>
      </AdminLayout>
    </AdminGuard>
  );
}