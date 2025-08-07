import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines and merges Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: currency,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Get token from localStorage (client-side only)
 */
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

/**
 * Store token in localStorage (client-side only)
 */
export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
  }
}

/**
 * Remove token from localStorage (client-side only)
 */
export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
  }
}

/**
 * Calculate insurance price based on collected data and insurance type settings
 */
import { InsuranceType } from './types';

export function calculateInsurancePrice(
  insuranceType: InsuranceType,
  collectedData: Record<string, any>
): { basePrice: number; adjustments: any[]; totalPrice: number } {
  let basePrice = insuranceType.basePrice;
  let totalPrice = basePrice;
  const adjustments: { name: string; factor: number; description: string }[] = [];

  // Check if basePrice is valid
  if (!basePrice || basePrice <= 0) {
    basePrice = 500; // Default fallback price
    console.warn('Invalid base price, using fallback of 500');
  }

  // Add a base adjustment for age (if not already handled by fields)
  const hasAgeField = insuranceType.fields.some(f => f.name === 'age');
  if (collectedData.age && !hasAgeField) {
    const age = Number(collectedData.age);
    let ageMultiplier = 1.0;
    let ageDescription = 'Standard age rate';
    
    if (isNaN(age)) {
      console.warn('Invalid age value:', collectedData.age);
    } else if (age < 25) {
      ageMultiplier = 1.5;
      ageDescription = 'Young customer (under 25)';
    } else if (age >= 25 && age < 40) {
      ageMultiplier = 1.0;
      ageDescription = 'Standard age (25-39)';
    } else if (age >= 40 && age < 65) {
      ageMultiplier = 1.2;
      ageDescription = 'Middle age (40-64)';
    } else if (age >= 65) {
      ageMultiplier = 1.4;
      ageDescription = 'Senior (65+)';
    }
    
    const ageAdjustment = basePrice * (ageMultiplier - 1);
    totalPrice += ageAdjustment;
    
    adjustments.push({
      name: 'Age',
      factor: ageMultiplier,
      description: ageDescription
    });
  }

  // Process location-based adjustments if not already in fields
  const hasCountryField = insuranceType.fields.some(f => f.name === 'country');
  const hasCityField = insuranceType.fields.some(f => f.name === 'city');
  
  // Add country adjustment if not already defined in fields
  if (collectedData.country && !hasCountryField) {
    let countryMultiplier = 1.0;
    let countryDescription = 'Standard country rate';
    
    // Basic country multipliers
    switch(collectedData.country.toUpperCase()) {
      case 'USA':
        countryMultiplier = 1.0;
        countryDescription = 'United States';
        break;
      case 'CANADA':
        countryMultiplier = 0.9;
        countryDescription = 'Canada';
        break;
      case 'UK':
      case 'UNITED KINGDOM':
        countryMultiplier = 1.1;
        countryDescription = 'United Kingdom';
        break;
      case 'AUSTRALIA':
        countryMultiplier = 1.2;
        countryDescription = 'Australia';
        break;
      case 'GERMANY':
        countryMultiplier = 1.05;
        countryDescription = 'Germany';
        break;
      default:
        countryMultiplier = 1.3;
        countryDescription = 'International';
    }
    
    const countryAdjustment = basePrice * (countryMultiplier - 1);
    totalPrice += countryAdjustment;
    
    adjustments.push({
      name: 'Country',
      factor: countryMultiplier,
      description: countryDescription
    });
  }
  
  // Add city type adjustment if not already defined in fields
  if (collectedData.city && !hasCityField) {
    let cityMultiplier = 1.0;
    let cityDescription = 'Standard city rate';
    
    // Basic city multipliers based on common patterns
    const cityName = collectedData.city.toLowerCase();
    if (cityName.includes('new york') || cityName.includes('los angeles') || 
        cityName.includes('chicago') || cityName.includes('london') || 
        cityName.includes('tokyo') || cityName.includes('paris')) {
      cityMultiplier = 1.4;
      cityDescription = 'Major metropolitan area';
    } else if (cityName.includes('san') || cityName.includes('boston') || 
               cityName.includes('dallas') || cityName.includes('berlin') || 
               cityName.includes('sydney') || cityName.includes('toronto')) {
      cityMultiplier = 1.2;
      cityDescription = 'Large urban area';
    } else if (cityName.length < 6) { // Simple heuristic for smaller towns
      cityMultiplier = 0.9;
      cityDescription = 'Small town/rural area';
    }
    
    const cityAdjustment = basePrice * (cityMultiplier - 1);
    totalPrice += cityAdjustment;
    
    adjustments.push({
      name: 'City',
      factor: cityMultiplier,
      description: cityDescription
    });
  }

  // Process gender adjustment if not already in fields
  const hasGenderField = insuranceType.fields.some(f => f.name === 'gender');
  if (collectedData.gender && !hasGenderField) {
    let genderMultiplier = 1.0;
    let genderDescription = 'Standard rate';
    
    // Basic gender multipliers
    const gender = collectedData.gender.toLowerCase();
    if (gender.includes('male')) {
      genderMultiplier = 1.1;
      genderDescription = 'Male';
    } else if (gender.includes('female')) {
      genderMultiplier = 0.9;
      genderDescription = 'Female';
    }
    
    const genderAdjustment = basePrice * (genderMultiplier - 1);
    totalPrice += genderAdjustment;
    
    adjustments.push({
      name: 'Gender',
      factor: genderMultiplier,
      description: genderDescription
    });
  }

  // Process each field from the insurance type
  insuranceType.fields.forEach(field => {
    const userValue = collectedData[field.name];
    // Set default multiplier from field config or use 1.0 as safe fallback
    let appliedMultiplier = field.fallbackMultiplier || 1.0;
    let adjustmentDescription = 'Default rate';
    
    if (userValue !== undefined) {
      // Normalize the user value for comparison
      const normalizedUserValue = typeof userValue === 'string' 
        ? userValue.toString().toLowerCase().trim() 
        : userValue;
      
      if (field.type === 'select' && field.options && field.options.length > 0) {
        // Find matching option (case insensitive)
        const option = field.options.find(opt => {
          const optValue = opt.value.toString().toLowerCase().trim();
          return optValue === normalizedUserValue || 
                 normalizedUserValue.includes(optValue) || 
                 optValue.includes(normalizedUserValue);
        });
        
        if (option) {
          appliedMultiplier = option.multiplier;
          adjustmentDescription = `Selected: ${option.value}`;
        } else {
          console.warn(`No matching option found for ${field.name}="${userValue}", using fallback multiplier`);
        }
      } else if (field.type === 'range' && field.brackets && field.brackets.length > 0) {
        // Find matching bracket
        const numericValue = Number(userValue);
        
        if (!isNaN(numericValue)) {
          const bracket = field.brackets.find(
            b => numericValue >= b.min && numericValue <= b.max
          );
          
          if (bracket) {
            appliedMultiplier = bracket.multiplier;
            adjustmentDescription = `Range: ${bracket.min}-${bracket.max}`;
          } else {
            console.warn(`Value ${numericValue} is outside any defined bracket for ${field.name}, using fallback multiplier`);
          }
        } else {
          console.warn(`Invalid numeric value for range field ${field.name}: ${userValue}, using fallback multiplier`);
        }
      }
    } else {
      console.warn(`Missing value for field ${field.name}, using fallback multiplier`);
    }
    
    // Calculate and add adjustment (only if multiplier is different from 1.0)
    if (appliedMultiplier !== 1) {
      const adjustmentAmount = basePrice * (appliedMultiplier - 1);
      totalPrice += adjustmentAmount;
      
      adjustments.push({
        name: field.label,
        factor: appliedMultiplier,
        description: adjustmentDescription
      });
    }
  });

  return {
    basePrice,
    adjustments,
    totalPrice
  };
}
