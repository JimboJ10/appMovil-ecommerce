import { Product, Variedad } from './product.model';

export interface Cart {
  _id?: string;
  user: string;
  product: Product;
  type_discount: number;
  discount: number;
  cantidad: number;
  variedad?: Variedad | string;
  code_cupon?: string;
  code_discount?: string;
  price_unitario: number;
  subtotal: number;
  total: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CartSummary {
  subtotal: number;
  discount: number;
  total: number;
  items: number;
}