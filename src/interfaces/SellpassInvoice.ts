interface CustomerInfo {
  customerForShop: {
    id: number;
    createdAt: string;
    totalSpent: number;
    totalPurchases: number;
    isBlocked: boolean;
    customer: {
      email: string;
    };
    customerId: number;
    visits: number;
    averageReview: number;
    shopId: number;
  };
  currentIp: {
    id: number;
    dateTime: string;
    ip: string;
    country: string;
    city: string;
    connectionType: number;
    riskScore: number;
    isoCode: string;
    isp: string;
  };
  useragent: string;
  invoiceId: string;
  discordSocialConnect: {
    id: string;
    discordUserInfo: {
      id: number;
      discordId: string;
      username: string;
      avatar: string;
      isVerified: boolean;
      premiumType: number;
      publicFlags: number;
      flags: number;
      mfaEnabled: boolean;
      locale: string;
    };
  };
}

interface Product {
  id: number;
  uniquePath: string;
  title: string;
  description: string;
  shortDescription: string;
  unlisted: boolean;
  private: boolean;
  onHold: boolean;
  isInStock: boolean;
  isInstantDelivery: boolean;
  createdAt: string;
  listingId: number;
  isDeleted: boolean;
  isInternal: boolean;
  shopId: number;
}

interface PartInvoice {
  id: number;
  product: Product;
  quantity: number;
  customFields: any[];
  replacements: any[];
  invoiceId: string;
  rawPrice: number;
  rawPriceUSD: number;
  endPrice: number;
  endPriceUSD: number;
}

interface TimelineEntry {
  id: number;
  time: string;
  status: number;
}

interface Gateway {
  gatewayName: number;
}

interface InvoiceResponse {
  data: {
    id: string;
    customerInfo: CustomerInfo;
    customerInfoId: number;
    partInvoices: PartInvoice[];
    status: number;
    rawPrice: number;
    rawPriceUSD: number;
    endPrice: number;
    endPriceUSD: number;
    gateway: Gateway;
    currency: string;
    tickets: any[];
    timeline: TimelineEntry[];
    shopId: number;
    redirectUrl: string;
    manuallyCompleted: boolean;
    hideFromStats: boolean;
    isBalanceTopUp: boolean;
  };
}

export default InvoiceResponse;
