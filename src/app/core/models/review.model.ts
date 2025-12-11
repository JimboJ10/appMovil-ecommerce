export interface Review {
  _id?: string;
  product: string;
  sale_detail: string;
  user: User;
  cantidad: number;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}