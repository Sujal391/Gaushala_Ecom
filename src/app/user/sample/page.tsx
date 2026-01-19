"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import UserLayout from '../../../components/layout/UserLayout';
import CreateSampleRequest from './RequestSample';
import MySampleRequests from './MySamples';

export default function SamplePage() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRequestCreated = () => {
    setShowCreateDialog(false);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <UserLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Sample Requests</h1>
            <p className="text-muted-foreground">
              Request product samples to try before you buy
            </p>
          </div>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Request Sample
          </Button>
        </div>

        <MySampleRequests refreshTrigger={refreshTrigger} />

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Request a Sample</DialogTitle>
              <DialogDescription>
                Fill in your details to receive a product sample at your address
              </DialogDescription>
            </DialogHeader>
            <CreateSampleRequest onSuccess={handleRequestCreated} />
          </DialogContent>
        </Dialog>
      </div>
    </UserLayout>
  );
}