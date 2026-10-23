export interface User {
  id: number;
  username: string;
  business_name: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  gstin: string;
  invoice_prefix: string;
  api_key?: string;
  created_at: string;
}

export interface Account {
  id: number;
  name: string;
  type: 'cash' | 'bank' | 'upi';
  balance: number;
  account_number: string;
  bank_name: string;
  created_at: string;
}

export interface Person {
  id: number;
  type: 'student' | 'customer' | 'client';
  name: string;
  phone: string;
  email: string;
  course_or_details: string;
  total_fee: number;
  counselor_staff_id?: number;
  counselor_name: string;
  notes: string;
  created_at: string;
}

export interface Invoice {
  id: number;
  invoice_number: string;
  person_id?: number;
  customer_name: string;
  customer_phone: string;
  subtotal: number;
  discount: number;
  tax: number;
  net_amount: number;
  payment_mode: 'cash' | 'bank' | 'upi' | 'unpaid';
  account_id?: number;
  amount_paid: number;
  due_amount: number;
  counselor_name: string;
  incentive_amount: number;
  notes: string;
  created_at: string;
}

export interface Transaction {
  id: number;
  date: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  account_id?: number;
  payment_mode: 'cash' | 'bank' | 'upi';
  reference_type?: string;
  reference_id?: string;
  party_name: string;
  description: string;
  created_at: string;
}

export interface Staff {
  id: number;
  name: string;
  role: string;
  phone: string;
  monthly_salary: number;
  status: 'active' | 'inactive';
  created_at: string;
}
