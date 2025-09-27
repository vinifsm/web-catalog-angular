import { Category } from "./category.model";
import { Image } from "./image.model";
import { Store } from "./store.model";

export interface Product {
    id: string;          
    sku: string;  
    name: string;
    description?: string;
    price: number;
    image?: Image;
    category: Category;
    store: Store;
}
  