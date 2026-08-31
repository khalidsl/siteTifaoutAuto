export type Category = 'injecteur' | 'pompe' | 'joint' | 'capteur' | 'regulateur' | 'valve' | 'durite' | 'autre';
export type Brand = 'Bosch' | 'Delphi' | 'Denso' | 'Zexel' | 'Siemens' | 'VAG' | 'ROLLANT' | 'Multimarque';

export interface Product {
  // Identifiants — supporte les deux formats (statique & MongoDB)
  id: string;
  _id?: string;
  ref: string;
  reference?: string;
  name: string;
  category: Category;
  brand: Brand | string;
  price: number;
  oldPrice?: number;
  imageUrl?: string;
  images?: string[];
  compatible: string[];
  compatibleVehicles?: string[];
  description: string;
  features?: string[];
  inStock?: boolean;
  stock?: number;
  isReconditioned: boolean;
  isNewPart?: boolean;
  remarque?: string;
}

export interface CartItem {
  product: Product;
  qty: number;
}

export type Page = 'home' | 'catalog' | 'product' | 'cart' | 'auth' | 'contact' | 'devis' | 'client' | 'admin';

export interface GuestInfo {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes?: string;
  paymentMethod: 'virement' | 'especes';
  deliveryMethod?: 'agence' | 'express' | 'magasin';
}

export interface Order {
  id: string;
  _id?: string;
  orderNumber: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  guestInfo: GuestInfo;
  status: 'En attente' | 'En préparation' | 'Expédié' | 'Livré' | 'Annulé';
  isGuest: boolean;
}

export interface RepairTicket {
  id: string;
  ticketNumber: string;
  customerName: string;
  phone: string;
  partName: string;
  ref: string;
  brand: Brand;
  vehicle: string;
  depositDate: string;
  estimatedCompletion: string;
  status: 'Réceptionné' | 'Diagnostic' | 'Nettoyage Ultrasons' | 'Calibration Banc EPS 200' | 'Prêt à livrer';
  progressPercentage: number;
  technicianNotes: string;
  testReportAvailable: boolean;
}

export interface QuoteRequest {
  id: string;
  _id?: string;
  quoteNumber: string;
  date: string;
  name: string;
  phone: string;
  city?: string;
  email: string;
  customerType: 'Particulier' | 'Garagiste Pro' | 'Transporteur';
  vehicleBrand: string;
  vehicleModel: string;
  vehicleYear: string;
  partCategory: Category | 'autre';
  partRef: string;
  serviceNeeded: 'Achat pièce' | 'Réparation / Reconditionnement' | 'Test sur banc';
  description: string;
  photoUrl?: string;
  status: 'En attente' | 'En cours de chiffrage' | 'Devis envoyé' | 'Accepté' | 'Refusé';
  estimatedPrice?: number;
}

export interface UserAccount {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  companyName?: string;
  isPro: boolean;
  discountRate: number;
  loyaltyPoints: number;
}


