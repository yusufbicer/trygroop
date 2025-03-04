
export type Supplier = {
  id: string;
  user_id: string;
  name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  title: string;
  details: string | null;
  status: string;
  total_volume: number | null;
  created_at: string;
  updated_at: string;
};

export type OrderAttachment = {
  id: string;
  order_id: string;
  file_path: string;
  file_name: string;
  file_type: string;
  created_at: string;
};

export type Suborder = {
  id: string;
  order_id: string;
  supplier_id: string | null;
  volume_m3: number | null;
  status: string;
  details: string | null;
  created_at: string;
  updated_at: string;
  suppliers?: {
    name: string;
  } | null;
};

export type Tracking = {
  id: string;
  order_id: string;
  status: string;
  location: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Payment = {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_date: string | null;
  payment_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type UserRole = {
  id: string;
  user_id: string;
  role: 'admin' | 'user';
  created_at: string;
};

export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  updated_at: string;
};
