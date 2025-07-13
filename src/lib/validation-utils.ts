// src/lib/validation-utils.ts
// Data validation and sanitization utilities

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue?: any;
}

// Stock symbol validation
export function validateStockSymbol(symbol: string): ValidationResult {
  const errors: string[] = [];
  
  if (!symbol || typeof symbol !== 'string') {
    errors.push('Stock symbol is required');
    return { isValid: false, errors };
  }
  
  const sanitized = symbol.trim().toUpperCase();
  
  if (sanitized.length === 0) {
    errors.push('Stock symbol cannot be empty');
    return { isValid: false, errors };
  }
  
  if (sanitized.length > 20) {
    errors.push('Stock symbol cannot exceed 20 characters');
    return { isValid: false, errors };
  }
  
  // Allow alphanumeric characters, dots, and hyphens
  const validPattern = /^[A-Z0-9.-]+$/;
  if (!validPattern.test(sanitized)) {
    errors.push('Stock symbol contains invalid characters');
    return { isValid: false, errors };
  }
  
  return { isValid: true, errors: [], sanitizedValue: sanitized };
}

// Price validation
export function validatePrice(price: any): ValidationResult {
  const errors: string[] = [];
  
  if (price === null || price === undefined || price === '') {
    errors.push('Price is required');
    return { isValid: false, errors };
  }
  
  const numPrice = parseFloat(price);
  
  if (isNaN(numPrice)) {
    errors.push('Price must be a valid number');
    return { isValid: false, errors };
  }
  
  if (numPrice < 0) {
    errors.push('Price cannot be negative');
    return { isValid: false, errors };
  }
  
  if (numPrice > 999999.9999) {
    errors.push('Price exceeds maximum allowed value');
    return { isValid: false, errors };
  }
  
  return { isValid: true, errors: [], sanitizedValue: numPrice };
}

// Quantity validation
export function validateQuantity(quantity: any): ValidationResult {
  const errors: string[] = [];
  
  if (quantity === null || quantity === undefined || quantity === '') {
    errors.push('Quantity is required');
    return { isValid: false, errors };
  }
  
  const numQuantity = parseFloat(quantity);
  
  if (isNaN(numQuantity)) {
    errors.push('Quantity must be a valid number');
    return { isValid: false, errors };
  }
  
  if (numQuantity <= 0) {
    errors.push('Quantity must be greater than 0');
    return { isValid: false, errors };
  }
  
  if (numQuantity > 999999999.9999) {
    errors.push('Quantity exceeds maximum allowed value');
    return { isValid: false, errors };
  }
  
  return { isValid: true, errors: [], sanitizedValue: numQuantity };
}

// Percentage validation
export function validatePercentage(value: any): ValidationResult {
  const errors: string[] = [];
  
  if (value === null || value === undefined || value === '') {
    return { isValid: true, errors: [], sanitizedValue: null }; // Allow null percentages
  }
  
  const numValue = parseFloat(value);
  
  if (isNaN(numValue)) {
    errors.push('Percentage must be a valid number');
    return { isValid: false, errors };
  }
  
  if (numValue < -100 || numValue > 10000) {
    errors.push('Percentage must be between -100% and 10000%');
    return { isValid: false, errors };
  }
  
  return { isValid: true, errors: [], sanitizedValue: numValue };
}

// Market cap validation
export function validateMarketCap(value: any): ValidationResult {
  const errors: string[] = [];
  
  if (value === null || value === undefined || value === '') {
    return { isValid: true, errors: [], sanitizedValue: null };
  }
  
  const numValue = parseFloat(value);
  
  if (isNaN(numValue)) {
    errors.push('Market cap must be a valid number');
    return { isValid: false, errors };
  }
  
  if (numValue < 0) {
    errors.push('Market cap cannot be negative');
    return { isValid: false, errors };
  }
  
  if (numValue > Number.MAX_SAFE_INTEGER) {
    errors.push('Market cap exceeds maximum allowed value');
    return { isValid: false, errors };
  }
  
  return { isValid: true, errors: [], sanitizedValue: numValue };
}

// String validation with length limits
export function validateString(value: any, maxLength: number = 255, allowEmpty: boolean = false): ValidationResult {
  const errors: string[] = [];
  
  if (value === null || value === undefined) {
    if (allowEmpty) {
      return { isValid: true, errors: [], sanitizedValue: null };
    } else {
      errors.push('Value is required');
      return { isValid: false, errors };
    }
  }
  
  const stringValue = String(value).trim();
  
  if (!allowEmpty && stringValue.length === 0) {
    errors.push('Value cannot be empty');
    return { isValid: false, errors };
  }
  
  if (stringValue.length > maxLength) {
    errors.push(`Value cannot exceed ${maxLength} characters`);
    return { isValid: false, errors };
  }
  
  return { isValid: true, errors: [], sanitizedValue: stringValue };
}

// Date validation
export function validateDate(value: any): ValidationResult {
  const errors: string[] = [];
  
  if (value === null || value === undefined || value === '') {
    return { isValid: true, errors: [], sanitizedValue: null };
  }
  
  const date = new Date(value);
  
  if (isNaN(date.getTime())) {
    errors.push('Invalid date format');
    return { isValid: false, errors };
  }
  
  // Check if date is in reasonable range (not too far in past/future)
  const now = new Date();
  const minDate = new Date(1900, 0, 1);
  const maxDate = new Date(now.getFullYear() + 10, 11, 31);
  
  if (date < minDate || date > maxDate) {
    errors.push('Date is outside reasonable range');
    return { isValid: false, errors };
  }
  
  return { isValid: true, errors: [], sanitizedValue: date };
}

// Portfolio entry validation
export function validatePortfolioEntry(data: any): ValidationResult {
  const errors: string[] = [];
  const sanitized: any = {};
  
  // Validate symbol
  const symbolValidation = validateStockSymbol(data.symbol);
  if (!symbolValidation.isValid) {
    errors.push(...symbolValidation.errors);
  } else {
    sanitized.symbol = symbolValidation.sanitizedValue;
  }
  
  // Validate quantity
  const quantityValidation = validateQuantity(data.quantity);
  if (!quantityValidation.isValid) {
    errors.push(...quantityValidation.errors);
  } else {
    sanitized.quantity = quantityValidation.sanitizedValue;
  }
  
  // Validate average purchase price
  const priceValidation = validatePrice(data.avgPurchasePrice);
  if (!priceValidation.isValid) {
    errors.push(...priceValidation.errors);
  } else {
    sanitized.avgPurchasePrice = priceValidation.sanitizedValue;
  }
  
  // Validate notes (optional)
  const notesValidation = validateString(data.notes, 1000, true);
  if (!notesValidation.isValid) {
    errors.push(...notesValidation.errors);
  } else {
    sanitized.notes = notesValidation.sanitizedValue;
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: errors.length === 0 ? sanitized : undefined
  };
}

// Stock data validation
export function validateStockData(data: any): ValidationResult {
  const errors: string[] = [];
  const sanitized: any = {};
  
  // Validate basic fields
  const symbolValidation = validateStockSymbol(data.symbol);
  if (!symbolValidation.isValid) {
    errors.push(...symbolValidation.errors);
  } else {
    sanitized.symbol = symbolValidation.sanitizedValue;
  }
  
  const nameValidation = validateString(data.name, 255);
  if (!nameValidation.isValid) {
    errors.push(...nameValidation.errors);
  } else {
    sanitized.name = nameValidation.sanitizedValue;
  }
  
  // Validate price fields
  const priceValidation = validatePrice(data.currentPrice);
  if (!priceValidation.isValid) {
    errors.push(...priceValidation.errors);
  } else {
    sanitized.currentPrice = priceValidation.sanitizedValue;
  }
  
  // Validate percentage fields
  const changePercentValidation = validatePercentage(data.dayChangePercent);
  if (!changePercentValidation.isValid) {
    errors.push(...changePercentValidation.errors);
  } else {
    sanitized.dayChangePercent = changePercentValidation.sanitizedValue;
  }
  
  // Validate market cap
  const marketCapValidation = validateMarketCap(data.marketCap);
  if (!marketCapValidation.isValid) {
    errors.push(...marketCapValidation.errors);
  } else {
    sanitized.marketCap = marketCapValidation.sanitizedValue;
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitizedValue: errors.length === 0 ? sanitized : undefined
  };
} 