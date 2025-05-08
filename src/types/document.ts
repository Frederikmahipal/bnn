export interface DocumentData {
  title: string;
  description: string;
  tags: string[];
  price: string;
  documentDate: string | '';
}

export interface DocumentRecord {
  _id: string;
  title: string;
  description?: string;
  tags: string[];
  price?: number;
  documentDate?: Date;
  createdAt: string;
  fileName?: string;
  attachment?: {
    name: string;
    type: string;
    size: number;
    url: string;
  };
} 