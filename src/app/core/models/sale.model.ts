import { Product, Variedad } from './product.model';
export interface Sale {
  _id?: string;
  user: string;
  currency_payment: string;
  method_payment: string;
  n_transacccion: string;
  total: number;
  currency_total: string;
  price_dolar: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SaleDetail {
  _id?: string;
  sale: string;
  product: Product;
  type_discount: number;
  discount: number;
  cantidad: number;
  variedad?: Variedad;
  code_cupon?: string;
  code_discount?: string;
  price_unitario: number;
  subtotal: number;
  total: number;
}

export interface SaleAddress {
  _id?: string;
  sale: string;
  name: string;
  surname: string;
  pais: string;
  address: string;
  referencia?: string;
  ciudad: string;
  region: string;
  telefono: string;
  email: string;
  nota?: string;
}