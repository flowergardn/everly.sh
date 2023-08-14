interface ProductVariant {
  Id: number;
  Title: string;
  Description: string;
  ShortDescription: string | null;
  Price: number;
  Currency: string;
  PriceDetails: {
    Amount: number;
    Currency: string;
  };
  ProductType: number;
  AsDynamic: {
    Stock: null;
    ExternalUrl: string;
    MinAmount: number;
    IsInternal: boolean;
    MaxAmount: number;
  };
  Gateways: any[];
  CustomFields: any[];
  DiscordSocialConnectSettings: null;
  Warranty: null;
  CustomerNote: null;
  RedirectUrl: string;
  IsDeleted: boolean;
  ProductId: number;
}

interface Statistics {
  Id: number;
  Rating: number;
  TotalFeedbacks: number;
  TotalProductsSold: number;
  MigratedTotalProductsSold: number;
  MigratedCustomersCount: number;
}

interface Product {
  Id: number;
  UniquePath: string;
  Title: string;
  Description: string;
  ShortDescription: string;
  ThumbnailCfImageId: null;
  Feedbacks: null;
  Statistics: Statistics;
  Variants: any[];
  Unlisted: boolean;
  Private: boolean;
  OnHold: boolean;
  IsInStock: boolean;
  IsInstantDelivery: boolean;
  CreatedAt: string;
  UpdatedAt: null;
  ListingId: number;
  IsDeleted: boolean;
  IsInternal: boolean;
  GroupId: null;
  ShopId: number;
  UsedInPages: null;
}

interface Purchase {
  Id: number;
  ProductVariant: ProductVariant;
  Product: Product;
  Quantity: number;
  DeliveryStatus: null;
  DeliveredGoods: null;
  TotalDeliveredGoods: null;
  CustomerNote: null;
  CustomFields: any[];
  Replacements: null;
  InvoiceId: string;
  RawPrice: number;
  RawPriceUSD: number;
  EndPrice: number;
  EndPriceUSD: number;
}

export default Purchase;
