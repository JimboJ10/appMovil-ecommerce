export interface Address {
  _id?: string;
  user: string;
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
  createdAt?: Date;
  updatedAt?: Date;
}