import { ObjectId } from "mongodb";

export interface Product {
  _id: string;
  id: string;
  isClearance: boolean;
  category: string;
  isNew: boolean;
  url: string;
  reviews: {
    reviewsUrl: string;
    reviewCount: number;
    averageRating: number;
  };
  nameWithoutBrand: string;
  name: string;
  images: {
    primarySmall: string;
    primaryMedium: string;
    primaryLarge: string;
    primaryExtraLarge: string;
    extraImages: {
      title: string;
      src: string;
    }[];
  };
  sizesAvailable: {
    zipper: string[];
  };
  colors: Color[];
  descriptionHtmlSimple: string;
  suggestedRetailPrice: number;
  brand: Brand;
  listPrice: number;
  finalPrice: number;
}

export interface Color {
  colorCode: string;
  colorName: string;
  colorChipImageSrc: string;
  colorPreviewImageSrc: string;
}

export interface Brand {
  id: string;
  url: string;
  productsUrl: string;
  logoSrc: string;
  name: string;
}


export interface User {
    _id?: ObjectId;
    email: string;
    password: string;
  name: string;
  address?: Address;
  phoneNumbers?: PhoneNumber[];
  cart?: CartItem[];
  createdAt: Date;
  modifiedAt: Date;
}

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  finalPrice: number;
  productImageSrc: string;
  productUrl: string;
  productCategory: string;
  productColor: Color;
  productSize: string;
  
}

export interface PhoneNumber {
  type: string;
  number: string;
}

export interface Address {
street: string;
city: string;
state: string;
zipCode: string;
country: string;
};

export interface Order {
  _id: string;
  userId: string;
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered";
  paymentMethod: string;
  shippingAddress: Address;
  orderItems: CartItem[];
  createdAt: Date;
  updatedAt: Date;
  totalPrice: number;
  shippingCost: number;
  taxAmount: number;
}

export interface Alert {
  _id: string;
  title: string;
  type: 'promotion' | 'info' | 'warning';
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}
  
// create an generic interface for our query parameters. This will make it easier to type check and validate the data we receive from the client. If we end up using query parameters for other routes we can modify it to include other fields.
// this works because they are all optional. But if for example a limit exists it will have to  be a string.
export interface QueryParams {
  category?: string;
  q?:string;
  limit?: string;
  offset?: string;
  fields?: string;
}

// Create a generic Mapped Type
type Projection<T> = {
  [K in keyof T]?: number; // '?' means "none or many" are allowed
};


export interface FindProductObj {
  search: {
    name?:string,
    descriptionHtmlSimple?:string,
    category?:string,
  },
  limit: number,
  offset: number,
fieldFilters?: Projection<Product>
}