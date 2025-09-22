import { Image } from "./image.model";

export interface Store {
    id: string;
    name: string;
    description: string;
    phone: string;
    identifier: string;
    image: Image;
}