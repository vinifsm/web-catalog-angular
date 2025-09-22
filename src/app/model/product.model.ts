import { Category } from "./category.model";
import { Image } from "./image.model";

export interface Product {
    id: string;          
    sku: string;  
    name: string;
    description?: string;
    price: number;
    image?: Image;
    category: Category;
  }
  