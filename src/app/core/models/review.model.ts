import { User } from './user.model';

export interface Review {
  _id?: string;
  product: string;
  sale_detail: string;
  user: User | string; // Permitir tanto User como string
  cantidad: number;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}