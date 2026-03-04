export type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  image_url?: string;
  created_at?: string;
};

export type EntryType = "product_sale" | "undeclared_sale" | "expense";

export type ExpenseCategory = "necessities" | "bills" | "other";

export type Entry = {
  id: string;
  name: string;
  amount: number;
  type: EntryType;
  category?: ExpenseCategory; // only for expenses
  product_id?: string;        // only for product_sale
  qty?: number;               // only for product_sale
  created_at: string;
};
