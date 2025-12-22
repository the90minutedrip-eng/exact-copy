export interface ProductStock {
  XS: number;
  S: number;
  M: number;
  L: number;
  XL: number;
  XXL: number;
}

export interface Product {
  id: string;
  productName: string;
  team: string;
  category: string;
  season: string;
  price: number | null;
  originalPrice: number | null;
  images: string[];
  videos: string[];
  stock: ProductStock;
  availableSizes: string[];
  limitedEdition: boolean;
  description: string;
  shortDescription: string;
  status: string;
  dateAdded: string;
  searchIndex: string;
  buyLink: string;
}

export type SizeKey = keyof ProductStock;

export const SIZES: SizeKey[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
