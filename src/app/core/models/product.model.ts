export interface Product {
  _id?: string;
  title: string;
  slug: string;
  sku: string;
  categorie: Categorie;
  price_usd: number;
  portada: string;
  imagen?: string;
  imagen_two?: string;
  galerias: Gallery[];
  state: number;
  stock: number;
  description: string;
  resumen: string;
  tags: string[];
  type_inventario: number;
  variedades?: Variedad[];
  avg_review?: number;
  count_review?: number;
  campaing_discount?: CampaignDiscount | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Variedad {
  _id?: string;
  product: string;
  valor: string;
  stock: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Gallery {
  imagen: string;
  _id: string;
}

export interface Categorie {
  _id?: string;
  title: string;
  imagen: string;
  imagen_home?: string;
  state?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CampaignDiscount {
  _id?: string;
  type_campaign: number;
  type_discount: number;
  discount: number;
  start_date: Date;
  end_date: Date;
}