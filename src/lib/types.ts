// This file contains types used throughout the application

/**
 * Company settings interface
 */
export interface CompanySettings {
  companyId: string;
  companyName: string;
  ageMultipliers: AgeMultiplier[];
  locationMultipliers: LocationMultiplier[];
  insuranceTypes: InsuranceType[];
}

export interface AgeMultiplier {
  minAge: number;
  maxAge: number;
  multiplier: number;
}

export interface LocationMultiplier {
  country: string;
  multiplier: number;
}

export interface InsuranceType {
  type: string;
  baseRate: number;
}

/**
 * Client data interface
 */
export interface ClientData {
  insuranceType: string;
  age: string;
  country: string;
  gender: string;
  additionalInfo: Record<string, any>;
}

/**
 * Insurance quote interface
 */
export interface InsuranceQuote {
  basePrice: number;
  adjustments: QuoteAdjustment[];
  totalPrice: number;
}

export interface QuoteAdjustment {
  name: string;
  factor: number;
  description: string;
}

/**
 * User authentication interface
 */
export interface User {
  id: string;
  email: string;
  companyId?: string;
  role: 'admin' | 'company';
}
