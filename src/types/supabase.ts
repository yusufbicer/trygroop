
export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  company_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  user_id: string;
  name: string;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  city: string | null;
  country: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: string;
  total_amount: number | null;
  currency: string;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_country: string | null;
  shipping_postal_code: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  supplier_id: string | null;
  product_name: string;
  description: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  proforma_url: string | null;
  product_image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Shipment {
  id: string;
  user_id: string;
  order_id: string | null;
  tracking_number: string | null;
  carrier: string | null;
  status: string;
  estimated_delivery_date: string | null;
  actual_delivery_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  user_id: string;
  order_id: string | null;
  shipment_id: string | null;
  name: string;
  document_url: string;
  document_type: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  order_id: string;
  amount: number;
  currency: string;
  payment_method: string | null;
  payment_status: string;
  payment_date: string | null;
  transaction_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  is_read: boolean;
  related_to: string | null;
  related_id: string | null;
  created_at: string;
}
