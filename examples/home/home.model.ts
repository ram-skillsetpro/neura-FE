import { PageData } from "src/core/models/page-data";

export interface Rating {
  rate: number;
  count: number;
}

/**
 * API Response of Home Page
 * Extended with {@link PageData} here because PageData.redirect will use by every page
 */

export interface HomeData extends PageData {
  products: Product[];
}

export interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: Rating;
}
