// Interface for creating a product (before upload)
export interface ProductCreateData {
  title: string;
  description: string;
  price: number;
  category ?:string;
  discount ?:number;
  discountLessValue ?:number;
  discount_rate ?:number;
  tags ?:string[];
  images?: File[];  // Raw files for upload
}

// Interface for product data after images are uploaded
export interface ProductDataWithImages {
  productId: string;  
  title: string;
  description: string;
  price: number;
}
