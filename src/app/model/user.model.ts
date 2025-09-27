export interface User {
  id?: string;
  username: string;
  password?: string;
  role: 'ADMIN' | 'STORE_OWNER' | 'CLIENT';
  storeId?: string;
  store?: {
    id: string;
    name: string;
    identifier: string;
  };
}

export interface UserRequest {
  username: string;
  password: string;
  role: 'ADMIN' | 'STORE_OWNER' | 'CLIENT';
  storeId: string;
}
