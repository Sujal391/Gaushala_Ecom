"use client";

import AdminGuard from "../../../components/guards/AdminGuard";
import AdminLayout from "../../../components/layout/AdminLayout";
import AllSampleRequests from "./SampleList";

export default function AdminSamplePage() {
  return (
    <AdminGuard>
      <AdminLayout title="Sample Requests">
        <AllSampleRequests />
      </AdminLayout>
    </AdminGuard>
  );
}