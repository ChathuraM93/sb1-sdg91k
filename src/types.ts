export interface Product {
  id: string;
  name: string;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerAddress: string;
  customerMobile1: string;
  customerMobile2: string;
  products: { productId: string; quantity: number }[];
  totalAmount: number;
  date: string;
  agentId: string;
  couponCode?: string;
  discountAmount?: number;
}

export enum UserRole {
  AGENT = 'agent',
  ADMIN = 'admin',
  ANALYST = 'analyst',
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercentage: number;
  isUsed: boolean;
  usedBy?: string;
  usedAt?: string;
}