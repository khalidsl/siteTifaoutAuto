export type Category = 'injecteur' | 'pompe' | 'joint' | 'capteur' | 'regulateur' | 'valve' | 'durite' | 'autre';
export type Brand = 'Bosch' | 'Delphi' | 'Denso' | 'Zexel' | 'Siemens' | 'VAG' | 'ROLLANT' | 'Multimarque';

export interface Product {
  // ── Identifiants ─────────────────────────────────────────────────
  id: string;
  _id?: string;
  /** Référence technique du produit (champ MongoDB). */
  reference?: string;
  /** @deprecated Alias de `reference` — présent dans les données statiques. Préférer `reference`. */
  ref?: string;

  // ── Informations produit ──────────────────────────────────────────
  name: string;
  category: Category;
  brand: Brand | string;
  price: number;
  oldPrice?: number;
  imageUrl?: string;
  images?: string[];
  description: string;
  features?: string[];

  // ── Compatibilité ─────────────────────────────────────────────────
  /** Véhicules compatibles (champ MongoDB). */
  compatibleVehicles?: string[];
  /** @deprecated Alias de `compatibleVehicles` — présent dans les données statiques. Préférer `compatibleVehicles`. */
  compatible?: string[];

  // ── Stock & État ─────────────────────────────────────────────────
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

/** Item d un order tel que retourné par l API (format plat, sans objet Product imbriqué). */
export interface ApiOrderItem {
  productId?: string;
  productName: string;
  productRef?: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  _id?: string;
  orderNumber: string;
  /** Format ISO 8601 ou champ createdAt selon la source (API vs local). */
  date?: string;
  createdAt?: string;
  items: CartItem[] | ApiOrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  guestInfo: GuestInfo;
  status: 'En attente' | 'En préparation' | 'Payée' | 'Expédié' | 'Livré' | 'Retour' | 'Annulé';
  isGuest: boolean;
  user?: string;
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
  status: 'Réceptionné' | 'Diagnostic' | 'Nettoyage Ultrasons' | 'Calibration Banc DCI 200' | 'Prêt à livrer';
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
  createdAt?: string;
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

/** Utilisateur tel que retourné par l API /api/admin/users. */
export interface ApiUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'client' | 'admin';
  discountRate?: number;
  loyaltyPoints?: number;
  vehicleBrand?: string;
  createdAt?: string;
}
