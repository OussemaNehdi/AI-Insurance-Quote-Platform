// This file contains types used throughout the application

/**
 * Company settings interface
 */
export interface CompanySettings {
  companyId: string;
  companyName: string;
  email: string;
  website?: string;
  phone?: string;
  address?: string;
  logo?: string;
  insuranceTypes: InsuranceType[];
}

/**
 * Insurance configuration interfaces
 */
export interface InsuranceType {
  type: string;
  displayName: string;
  basePrice: number;
  fields: InsuranceField[];
}

export interface InsuranceField {
  name: string;
  label: string;
  type: 'select' | 'range';
  fallbackMultiplier: number;
  options?: FieldOption[];
  brackets?: FieldBracket[];
}

export interface FieldOption {
  value: string;
  multiplier: number;
}

export interface FieldBracket {
  min: number;
  max: number;
  multiplier: number;
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
  companyId?: string | null;
  role: 'admin' | 'company';
}
