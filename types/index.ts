export type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url?: string;
  created_at?: string;
};

export type SaleItem = {
  id: string;
  product_id: string;
  product_name: string;
  qty: number;
  price: number;
  total: number;
};

export type Sale = {
  id: string;
  items: SaleItem[];
  grand_total: number;
  created_at: string;
};

export type Expense = {
  id: string;
  label: string;
  amount: number;
  type: "expense" | "revenue";
  created_at: string;
};
