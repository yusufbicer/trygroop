
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Order Details</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order #{id}</CardTitle>
          <CardDescription>View and manage order details</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="details">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="attachments">Attachments</TabsTrigger>
              <TabsTrigger value="tracking">Tracking</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <p className="text-gray-500">Order information will appear here when loaded.</p>
            </TabsContent>

            <TabsContent value="attachments">
              <p className="text-gray-500">Order attachments will appear here when loaded.</p>
            </TabsContent>

            <TabsContent value="tracking">
              <p className="text-gray-500">Tracking information will appear here when loaded.</p>
            </TabsContent>

            <TabsContent value="payments">
              <p className="text-gray-500">Payment information will appear here when loaded.</p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderDetail;
