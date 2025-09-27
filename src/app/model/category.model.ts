import { Store } from "./store.model";

export interface Category {
    id: string;
    name: string;
    store?: Store;
}
  