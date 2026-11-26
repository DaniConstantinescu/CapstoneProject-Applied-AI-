export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  sortOrder: number;
}

export interface AuthorSummary {
  id: number;
  name: string;
}

export interface AuthorDetail {
  id: number;
  name: string;
  bio: string | null;
  photoUrl: string | null;
}

export interface Book {
  id: number;
  title: string;
  description: string;
  format: 'Paperback' | 'Hardcover';
  priceCents: number;
  coverUrl: string;
  publisher: string;
  author: AuthorSummary;
  category: { id: number; name: string };
  estimatedDeliveryDate: string;
}

export interface BookDetail extends Omit<Book, 'author'> {
  author: AuthorDetail;
  inWishlist: boolean;
}

export interface CartItem {
  book: Book;
  quantity: number;
  lineTotalCents: number;
}

export interface Cart {
  items: CartItem[];
  itemCount: number;
  itemsTotalCents: number;
  taxIncludedCents: number;
  shippingCents: number;
  totalCents: number;
}

export interface ShippingAddress {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  state: string;
  country: string;
}

export interface CheckoutRequest {
  paymentMethod: 'credit_card' | 'debit_card';
  address: ShippingAddress;
}

export type OrderStatus = 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  book: Book;
  title: string;
  authorName: string;
  unitPriceCents: number;
  quantity: number;
}

export interface Order {
  id: number;
  status: OrderStatus;
  cancellable: boolean;
  confirmedAt: string;
  cancelledAt: string | null;
  estimatedDeliveryDate: string;
  paymentMethod: 'credit_card' | 'debit_card';
  paymentStatus: 'paid' | 'refunded';
  address: ShippingAddress;
  items: OrderItem[];
  itemCount: number;
  itemsTotalCents: number;
  taxIncludedCents: number;
  shippingCents: number;
  totalCents: number;
}

export interface OrderSummaryItem {
  bookId: number;
  title: string;
  coverUrl: string;
  quantity: number;
}

export interface OrderSummary {
  id: number;
  status: OrderStatus;
  confirmedAt: string;
  totalCents: number;
  itemCount: number;
  items: OrderSummaryItem[];
}

export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiErrorData {
  code: string;
  message: string;
  details?: ApiErrorDetail[];
}

export interface ApiErrorResponse {
  error: ApiErrorData;
}
