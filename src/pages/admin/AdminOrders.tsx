
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PencilIcon, Trash2Icon, PlusCircle, PackageOpen, CreditCard, Truck } from "lucide-react";
import { useForm } from "react-hook-form";
import { Separator } from "@/components/ui/separator";
import { Order, Tracking, Payment, Suborder } from "@/types/data";

const AdminOrders = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit'>('create');
  
  const [showSuborderModal, setShowSuborderModal] = useState(false);
  const [selectedSuborder, setSelectedSuborder] = useState<Suborder | null>(null);
  const [showDeleteSuborderModal, setShowDeleteSuborderModal] = useState(false);
  
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [selectedTracking, setSelectedTracking] = useState<Tracking | null>(null);
  const [showDeleteTrackingModal, setShowDeleteTrackingModal] = useState(false);
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDeletePaymentModal, setShowDeletePaymentModal] = useState(false);
  
  // Form states
  const [orderData, setOrderData] = useState({
    title: '',
    details: '',
    status: 'pending',
    user_id: '',
    total_volume: ''
  });
  
  const [suborderData, setSuborderData] = useState({
    supplier_id: '',
    volume_m3: '',
    status: 'pending',
    details: ''
  });
  
  const [trackingData, setTrackingData] = useState({
    status: '',
    location: '',
    notes: ''
  });
  
  const [paymentData, setPaymentData] = useState({
    amount: '',
    currency: 'USD',
    status: 'pending',
    payment_method: '',
    payment_date: '',
    notes: ''
  });

  // Fetch all orders
  const { data: orders = [], isLoading: isLoadingOrders, refetch: refetchOrders } = useQuery({
    queryKey: ['admin-all-orders'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            profiles:user_id (
              first_name,
              last_name
            )
          `)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
      } catch (error: any) {
        toast({
          title: 'Error loading orders',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
    }
  });

  // Fetch users for the dropdown
  const { data: users = [] } = useQuery({
    queryKey: ['admin-users-dropdown'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name');
        
        if (error) throw error;
        return data || [];
      } catch (error: any) {
        toast({
          title: 'Error loading users',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
    }
  });

  // Fetch suppliers for the dropdown
  const { data: suppliers = [] } = useQuery({
    queryKey: ['admin-suppliers-dropdown'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('suppliers')
          .select('id, name');
        
        if (error) throw error;
        return data || [];
      } catch (error: any) {
        toast({
          title: 'Error loading suppliers',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
    }
  });

  // Fetch suborders for a specific order
  const { data: suborders = [], refetch: refetchSuborders } = useQuery({
    queryKey: ['admin-suborders', selectedOrder?.id],
    queryFn: async () => {
      if (!selectedOrder?.id) return [];
      
      try {
        const { data, error } = await supabase
          .from('suborders')
          .select(`
            *,
            suppliers:supplier_id (
              name
            )
          `)
          .eq('order_id', selectedOrder.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
      } catch (error: any) {
        toast({
          title: 'Error loading suborders',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
    },
    enabled: !!selectedOrder?.id
  });

  // Fetch tracking for a specific order
  const { data: trackings = [], refetch: refetchTrackings } = useQuery({
    queryKey: ['admin-tracking', selectedOrder?.id],
    queryFn: async () => {
      if (!selectedOrder?.id) return [];
      
      try {
        const { data, error } = await supabase
          .from('tracking')
          .select('*')
          .eq('order_id', selectedOrder.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
      } catch (error: any) {
        toast({
          title: 'Error loading tracking information',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
    },
    enabled: !!selectedOrder?.id
  });

  // Fetch payments for a specific order
  const { data: payments = [], refetch: refetchPayments } = useQuery({
    queryKey: ['admin-payments', selectedOrder?.id],
    queryFn: async () => {
      if (!selectedOrder?.id) return [];
      
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .eq('order_id', selectedOrder.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
      } catch (error: any) {
        toast({
          title: 'Error loading payment information',
          description: error.message,
          variant: 'destructive',
        });
        return [];
      }
    },
    enabled: !!selectedOrder?.id
  });

  // Create/Update Order Mutation
  const orderMutation = useMutation({
    mutationFn: async (data: any) => {
      if (modalType === 'create') {
        const { data: result, error } = await supabase
          .from('orders')
          .insert(data)
          .select();
        
        if (error) throw error;
        return result;
      } else {
        const { data: result, error } = await supabase
          .from('orders')
          .update(data)
          .eq('id', selectedOrder!.id)
          .select();
        
        if (error) throw error;
        return result;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-orders'] });
      setShowOrderModal(false);
      resetOrderForm();
      toast({
        title: modalType === 'create' ? 'Order created' : 'Order updated',
        description: modalType === 'create' ? 'Order has been created successfully' : 'Order has been updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Delete Order Mutation
  const deleteOrderMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', selectedOrder!.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-orders'] });
      setShowDeleteModal(false);
      setSelectedOrder(null);
      toast({
        title: 'Order deleted',
        description: 'Order has been deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Create/Update Suborder Mutation
  const suborderMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!selectedSuborder) {
        const { data: result, error } = await supabase
          .from('suborders')
          .insert({
            ...data,
            order_id: selectedOrder!.id
          })
          .select();
        
        if (error) throw error;
        return result;
      } else {
        const { data: result, error } = await supabase
          .from('suborders')
          .update(data)
          .eq('id', selectedSuborder.id)
          .select();
        
        if (error) throw error;
        return result;
      }
    },
    onSuccess: () => {
      refetchSuborders();
      setShowSuborderModal(false);
      resetSuborderForm();
      toast({
        title: selectedSuborder ? 'Suborder updated' : 'Suborder created',
        description: selectedSuborder ? 'Suborder has been updated successfully' : 'Suborder has been created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Delete Suborder Mutation
  const deleteSuborderMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('suborders')
        .delete()
        .eq('id', selectedSuborder!.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      refetchSuborders();
      setShowDeleteSuborderModal(false);
      setSelectedSuborder(null);
      toast({
        title: 'Suborder deleted',
        description: 'Suborder has been deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Create/Update Tracking Mutation
  const trackingMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!selectedTracking) {
        const { data: result, error } = await supabase
          .from('tracking')
          .insert({
            ...data,
            order_id: selectedOrder!.id
          })
          .select();
        
        if (error) throw error;
        return result;
      } else {
        const { data: result, error } = await supabase
          .from('tracking')
          .update(data)
          .eq('id', selectedTracking.id)
          .select();
        
        if (error) throw error;
        return result;
      }
    },
    onSuccess: () => {
      refetchTrackings();
      setShowTrackingModal(false);
      resetTrackingForm();
      toast({
        title: selectedTracking ? 'Tracking updated' : 'Tracking created',
        description: selectedTracking ? 'Tracking has been updated successfully' : 'Tracking has been created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Delete Tracking Mutation
  const deleteTrackingMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('tracking')
        .delete()
        .eq('id', selectedTracking!.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      refetchTrackings();
      setShowDeleteTrackingModal(false);
      setSelectedTracking(null);
      toast({
        title: 'Tracking deleted',
        description: 'Tracking has been deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Create/Update Payment Mutation
  const paymentMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!selectedPayment) {
        const { data: result, error } = await supabase
          .from('payments')
          .insert({
            ...data,
            order_id: selectedOrder!.id
          })
          .select();
        
        if (error) throw error;
        return result;
      } else {
        const { data: result, error } = await supabase
          .from('payments')
          .update(data)
          .eq('id', selectedPayment.id)
          .select();
        
        if (error) throw error;
        return result;
      }
    },
    onSuccess: () => {
      refetchPayments();
      setShowPaymentModal(false);
      resetPaymentForm();
      toast({
        title: selectedPayment ? 'Payment updated' : 'Payment created',
        description: selectedPayment ? 'Payment has been updated successfully' : 'Payment has been created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Delete Payment Mutation
  const deletePaymentMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', selectedPayment!.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      refetchPayments();
      setShowDeletePaymentModal(false);
      setSelectedPayment(null);
      toast({
        title: 'Payment deleted',
        description: 'Payment has been deleted successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  // Form handlers
  const handleOpenCreateOrder = () => {
    setModalType('create');
    resetOrderForm();
    setShowOrderModal(true);
  };

  const handleOpenEditOrder = (order: Order) => {
    setModalType('edit');
    setSelectedOrder(order);
    setOrderData({
      title: order.title,
      details: order.details || '',
      status: order.status,
      user_id: order.user_id,
      total_volume: order.total_volume ? order.total_volume.toString() : ''
    });
    setShowOrderModal(true);
  };

  const handleOpenDeleteOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowDeleteModal(true);
  };

  const handleOpenOrderDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleOpenCreateSuborder = () => {
    setSelectedSuborder(null);
    resetSuborderForm();
    setShowSuborderModal(true);
  };

  const handleOpenEditSuborder = (suborder: Suborder) => {
    setSelectedSuborder(suborder);
    setSuborderData({
      supplier_id: suborder.supplier_id || '',
      volume_m3: suborder.volume_m3 ? suborder.volume_m3.toString() : '',
      status: suborder.status,
      details: suborder.details || ''
    });
    setShowSuborderModal(true);
  };

  const handleOpenDeleteSuborder = (suborder: Suborder) => {
    setSelectedSuborder(suborder);
    setShowDeleteSuborderModal(true);
  };

  const handleOpenCreateTracking = () => {
    setSelectedTracking(null);
    resetTrackingForm();
    setShowTrackingModal(true);
  };

  const handleOpenEditTracking = (tracking: Tracking) => {
    setSelectedTracking(tracking);
    setTrackingData({
      status: tracking.status,
      location: tracking.location || '',
      notes: tracking.notes || ''
    });
    setShowTrackingModal(true);
  };

  const handleOpenDeleteTracking = (tracking: Tracking) => {
    setSelectedTracking(tracking);
    setShowDeleteTrackingModal(true);
  };

  const handleOpenCreatePayment = () => {
    setSelectedPayment(null);
    resetPaymentForm();
    setShowPaymentModal(true);
  };

  const handleOpenEditPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setPaymentData({
      amount: payment.amount.toString(),
      currency: payment.currency,
      status: payment.status,
      payment_method: payment.payment_method || '',
      payment_date: payment.payment_date || '',
      notes: payment.notes || ''
    });
    setShowPaymentModal(true);
  };

  const handleOpenDeletePayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDeletePaymentModal(true);
  };

  const handleSubmitOrder = () => {
    const formData = {
      ...orderData,
      total_volume: orderData.total_volume ? parseFloat(orderData.total_volume) : null
    };
    orderMutation.mutate(formData);
  };

  const handleSubmitSuborder = () => {
    const formData = {
      ...suborderData,
      volume_m3: suborderData.volume_m3 ? parseFloat(suborderData.volume_m3) : null
    };
    suborderMutation.mutate(formData);
  };

  const handleSubmitTracking = () => {
    trackingMutation.mutate(trackingData);
  };

  const handleSubmitPayment = () => {
    const formData = {
      ...paymentData,
      amount: parseFloat(paymentData.amount)
    };
    paymentMutation.mutate(formData);
  };

  // Form reset functions
  const resetOrderForm = () => {
    setOrderData({
      title: '',
      details: '',
      status: 'pending',
      user_id: '',
      total_volume: ''
    });
  };

  const resetSuborderForm = () => {
    setSuborderData({
      supplier_id: '',
      volume_m3: '',
      status: 'pending',
      details: ''
    });
  };

  const resetTrackingForm = () => {
    setTrackingData({
      status: '',
      location: '',
      notes: ''
    });
  };

  const resetPaymentForm = () => {
    setPaymentData({
      amount: '',
      currency: 'USD',
      status: 'pending',
      payment_method: '',
      payment_date: '',
      notes: ''
    });
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
        <Button onClick={handleOpenCreateOrder}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Order
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Orders List */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>Select an order to view details</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingOrders ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-white/5 animate-pulse rounded"></div>
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <p className="text-gray-500">No orders found.</p>
              ) : (
                <div className="space-y-2">
                  {orders.map((order: any) => (
                    <div 
                      key={order.id} 
                      className={`p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${selectedOrder?.id === order.id ? 'border-blue-500 bg-blue-50' : ''}`}
                      onClick={() => handleOpenOrderDetails(order)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{order.title}</p>
                          <p className="text-xs text-gray-500">
                            {order.profiles && `${order.profiles.first_name || ''} ${order.profiles.last_name || ''}`}
                          </p>
                          <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                        </div>
                        <div className={`px-2 py-1 text-xs rounded-full 
                          ${order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 
                            order.status === 'completed' ? 'bg-green-500/20 text-green-500' : 
                            order.status === 'shipping' ? 'bg-purple-500/20 text-purple-500' :
                            'bg-blue-500/20 text-blue-500'}`}
                        >
                          {order.status}
                        </div>
                      </div>
                      <div className="flex mt-2 space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="px-2 h-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditOrder(order);
                          }}
                        >
                          <PencilIcon className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="px-2 h-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDeleteOrder(order);
                          }}
                        >
                          <Trash2Icon className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Details */}
        <div className="md:col-span-2">
          {selectedOrder ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedOrder.title}</CardTitle>
                    <CardDescription>
                      Created on {formatDate(selectedOrder.created_at)}
                    </CardDescription>
                  </div>
                  <div className={`px-2 py-1 text-xs rounded-full 
                    ${selectedOrder.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 
                      selectedOrder.status === 'completed' ? 'bg-green-500/20 text-green-500' : 
                      selectedOrder.status === 'shipping' ? 'bg-purple-500/20 text-purple-500' :
                      'bg-blue-500/20 text-blue-500'}`}
                  >
                    {selectedOrder.status}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details">
                  <TabsList>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="suborders">Suborders</TabsTrigger>
                    <TabsTrigger value="tracking">Tracking</TabsTrigger>
                    <TabsTrigger value="payments">Payments</TabsTrigger>
                  </TabsList>

                  {/* Order Details Tab */}
                  <TabsContent value="details" className="pt-4">
                    {selectedOrder.details && (
                      <div className="mb-4">
                        <Label>Description</Label>
                        <p className="mt-1 text-gray-700">{selectedOrder.details}</p>
                      </div>
                    )}
                    
                    {selectedOrder.total_volume && (
                      <div className="mb-4">
                        <Label>Total Volume</Label>
                        <p className="mt-1 text-gray-700">{selectedOrder.total_volume} m³</p>
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <Label>Status</Label>
                      <p className="mt-1 text-gray-700">{selectedOrder.status}</p>
                    </div>
                    
                    <div className="mb-4">
                      <Label>Last Updated</Label>
                      <p className="mt-1 text-gray-700">{formatDate(selectedOrder.updated_at)}</p>
                    </div>
                    
                    <div className="flex space-x-2 mt-6">
                      <Button 
                        variant="outline" 
                        onClick={() => handleOpenEditOrder(selectedOrder)}
                      >
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Edit Order
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleOpenDeleteOrder(selectedOrder)}
                      >
                        <Trash2Icon className="h-4 w-4 mr-2" />
                        Delete Order
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Suborders Tab */}
                  <TabsContent value="suborders" className="pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-lg">Suborders</h3>
                      <Button size="sm" onClick={handleOpenCreateSuborder}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Suborder
                      </Button>
                    </div>
                    
                    {suborders.length === 0 ? (
                      <p className="text-gray-500">No suborders found for this order.</p>
                    ) : (
                      <div className="space-y-4">
                        {suborders.map((suborder: any) => (
                          <div key={suborder.id} className="border rounded-md p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center">
                                  <span className="font-medium">
                                    {suborder.suppliers ? suborder.suppliers.name : 'No Supplier'}
                                  </span>
                                  <span className={`ml-3 px-2 py-1 text-xs rounded-full 
                                    ${suborder.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 
                                      suborder.status === 'completed' ? 'bg-green-500/20 text-green-500' : 
                                      'bg-blue-500/20 text-blue-500'}`}
                                  >
                                    {suborder.status}
                                  </span>
                                </div>
                                {suborder.volume_m3 && (
                                  <p className="text-gray-600 text-sm">Volume: {suborder.volume_m3} m³</p>
                                )}
                                {suborder.details && (
                                  <p className="text-gray-600 text-sm mt-2">{suborder.details}</p>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleOpenEditSuborder(suborder)}
                                >
                                  <PencilIcon className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleOpenDeleteSuborder(suborder)}
                                >
                                  <Trash2Icon className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Tracking Tab */}
                  <TabsContent value="tracking" className="pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-lg">Tracking Information</h3>
                      <Button size="sm" onClick={handleOpenCreateTracking}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Tracking
                      </Button>
                    </div>
                    
                    {trackings.length === 0 ? (
                      <p className="text-gray-500">No tracking information found for this order.</p>
                    ) : (
                      <div className="space-y-4">
                        {trackings.map((tracking: Tracking) => (
                          <div key={tracking.id} className="border rounded-md p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center">
                                  <span className="font-medium">{tracking.status}</span>
                                  {tracking.location && (
                                    <span className="ml-2 text-gray-600">at {tracking.location}</span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{formatDate(tracking.created_at)}</p>
                                {tracking.notes && (
                                  <p className="text-gray-600 text-sm mt-2">{tracking.notes}</p>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleOpenEditTracking(tracking)}
                                >
                                  <PencilIcon className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleOpenDeleteTracking(tracking)}
                                >
                                  <Trash2Icon className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Payments Tab */}
                  <TabsContent value="payments" className="pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-lg">Payment Information</h3>
                      <Button size="sm" onClick={handleOpenCreatePayment}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Payment
                      </Button>
                    </div>
                    
                    {payments.length === 0 ? (
                      <p className="text-gray-500">No payment information found for this order.</p>
                    ) : (
                      <div className="space-y-4">
                        {payments.map((payment: Payment) => (
                          <div key={payment.id} className="border rounded-md p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="flex items-center">
                                  <span className="font-medium">
                                    {payment.amount} {payment.currency}
                                  </span>
                                  <span className={`ml-3 px-2 py-1 text-xs rounded-full 
                                    ${payment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : 
                                      payment.status === 'completed' ? 'bg-green-500/20 text-green-500' : 
                                      'bg-blue-500/20 text-blue-500'}`}
                                  >
                                    {payment.status}
                                  </span>
                                </div>
                                {payment.payment_method && (
                                  <p className="text-gray-600 text-sm">Method: {payment.payment_method}</p>
                                )}
                                {payment.payment_date && (
                                  <p className="text-gray-600 text-sm">Date: {formatDate(payment.payment_date)}</p>
                                )}
                                {payment.notes && (
                                  <p className="text-gray-600 text-sm mt-2">{payment.notes}</p>
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleOpenEditPayment(payment)}
                                >
                                  <PencilIcon className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleOpenDeletePayment(payment)}
                                >
                                  <Trash2Icon className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-10 px-6 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <PackageOpen className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-medium mb-2">Select an Order</h3>
                <p className="text-gray-500">
                  Select an order from the list to view and manage its details, or create a new order.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleOpenCreateOrder}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create New Order
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Order Modal */}
      <Dialog open={showOrderModal} onOpenChange={setShowOrderModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{modalType === 'create' ? 'Create Order' : 'Edit Order'}</DialogTitle>
            <DialogDescription>
              {modalType === 'create' ? 'Add a new order' : 'Edit the order details'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={orderData.title}
                onChange={(e) => setOrderData({ ...orderData, title: e.target.value })}
                placeholder="Order title"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="user">User</Label>
              <Select 
                value={orderData.user_id} 
                onValueChange={(value) => setOrderData({ ...orderData, user_id: value })}
              >
                <SelectTrigger id="user">
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user: any) => (
                    <SelectItem key={user.id} value={user.id}>
                      {`${user.first_name || ''} ${user.last_name || ''}`} ({user.id.slice(0, 8)}...)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="details">Details</Label>
              <Textarea
                id="details"
                value={orderData.details}
                onChange={(e) => setOrderData({ ...orderData, details: e.target.value })}
                placeholder="Additional details about the order"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={orderData.status} 
                onValueChange={(value) => setOrderData({ ...orderData, status: value })}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipping">Shipping</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="volume">Total Volume (m³)</Label>
              <Input
                id="volume"
                type="number"
                step="0.01"
                value={orderData.total_volume}
                onChange={(e) => setOrderData({ ...orderData, total_volume: e.target.value })}
                placeholder="Total volume in cubic meters"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOrderModal(false)}>Cancel</Button>
            <Button onClick={handleSubmitOrder} disabled={orderMutation.isPending}>
              {orderMutation.isPending ? 'Saving...' : (modalType === 'create' ? 'Create' : 'Update')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Order Confirmation */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this order? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteOrderMutation.mutate()} disabled={deleteOrderMutation.isPending}>
              {deleteOrderMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suborder Modal */}
      <Dialog open={showSuborderModal} onOpenChange={setShowSuborderModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedSuborder ? 'Edit Suborder' : 'Create Suborder'}</DialogTitle>
            <DialogDescription>
              {selectedSuborder ? 'Update the suborder details' : 'Add a new suborder for this order'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Select 
                value={suborderData.supplier_id} 
                onValueChange={(value) => setSuborderData({ ...suborderData, supplier_id: value })}
              >
                <SelectTrigger id="supplier">
                  <SelectValue placeholder="Select a supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier: any) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="volume_m3">Volume (m³)</Label>
              <Input
                id="volume_m3"
                type="number"
                step="0.01"
                value={suborderData.volume_m3}
                onChange={(e) => setSuborderData({ ...suborderData, volume_m3: e.target.value })}
                placeholder="Volume in cubic meters"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="suborder-status">Status</Label>
              <Select 
                value={suborderData.status} 
                onValueChange={(value) => setSuborderData({ ...suborderData, status: value })}
              >
                <SelectTrigger id="suborder-status">
                  <SelectValue placeholder="Select a status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipping">Shipping</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="suborder-details">Details</Label>
              <Textarea
                id="suborder-details"
                value={suborderData.details}
                onChange={(e) => setSuborderData({ ...suborderData, details: e.target.value })}
                placeholder="Additional details about the suborder"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSuborderModal(false)}>Cancel</Button>
            <Button onClick={handleSubmitSuborder} disabled={suborderMutation.isPending}>
              {suborderMutation.isPending ? 'Saving...' : (selectedSuborder ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Suborder Confirmation */}
      <Dialog open={showDeleteSuborderModal} onOpenChange={setShowDeleteSuborderModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Suborder</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this suborder? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteSuborderModal(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteSuborderMutation.mutate()} disabled={deleteSuborderMutation.isPending}>
              {deleteSuborderMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tracking Modal */}
      <Dialog open={showTrackingModal} onOpenChange={setShowTrackingModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedTracking ? 'Edit Tracking' : 'Add Tracking'}</DialogTitle>
            <DialogDescription>
              {selectedTracking ? 'Update tracking information' : 'Add new tracking information'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tracking-status">Status</Label>
              <Input
                id="tracking-status"
                value={trackingData.status}
                onChange={(e) => setTrackingData({ ...trackingData, status: e.target.value })}
                placeholder="e.g., In Transit, Customs Cleared, Delivered"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={trackingData.location}
                onChange={(e) => setTrackingData({ ...trackingData, location: e.target.value })}
                placeholder="Current location of the shipment"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tracking-notes">Notes</Label>
              <Textarea
                id="tracking-notes"
                value={trackingData.notes}
                onChange={(e) => setTrackingData({ ...trackingData, notes: e.target.value })}
                placeholder="Additional notes about this tracking update"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTrackingModal(false)}>Cancel</Button>
            <Button onClick={handleSubmitTracking} disabled={trackingMutation.isPending}>
              {trackingMutation.isPending ? 'Saving...' : (selectedTracking ? 'Update' : 'Add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Tracking Confirmation */}
      <Dialog open={showDeleteTrackingModal} onOpenChange={setShowDeleteTrackingModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tracking</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this tracking information? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteTrackingModal(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteTrackingMutation.mutate()} disabled={deleteTrackingMutation.isPending}>
              {deleteTrackingMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedPayment ? 'Edit Payment' : 'Add Payment'}</DialogTitle>
            <DialogDescription>
              {selectedPayment ? 'Update payment information' : 'Add new payment information'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={paymentData.amount}
                onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                placeholder="Payment amount"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select 
                value={paymentData.currency} 
                onValueChange={(value) => setPaymentData({ ...paymentData, currency: value })}
              >
                <SelectTrigger id="currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="TRY">TRY</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment-status">Status</Label>
              <Select 
                value={paymentData.status} 
                onValueChange={(value) => setPaymentData({ ...paymentData, status: value })}
              >
                <SelectTrigger id="payment-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment-method">Payment Method</Label>
              <Input
                id="payment-method"
                value={paymentData.payment_method}
                onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                placeholder="e.g., Credit Card, Bank Transfer, PayPal"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment-date">Payment Date</Label>
              <Input
                id="payment-date"
                type="date"
                value={paymentData.payment_date}
                onChange={(e) => setPaymentData({ ...paymentData, payment_date: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="payment-notes">Notes</Label>
              <Textarea
                id="payment-notes"
                value={paymentData.notes}
                onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                placeholder="Additional notes about this payment"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
            <Button onClick={handleSubmitPayment} disabled={paymentMutation.isPending}>
              {paymentMutation.isPending ? 'Saving...' : (selectedPayment ? 'Update' : 'Add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Payment Confirmation */}
      <Dialog open={showDeletePaymentModal} onOpenChange={setShowDeletePaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Payment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this payment information? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeletePaymentModal(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deletePaymentMutation.mutate()} disabled={deletePaymentMutation.isPending}>
              {deletePaymentMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminOrders;
