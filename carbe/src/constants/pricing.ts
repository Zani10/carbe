// Carbe Commission & Pricing Configuration
// These values can be easily adjusted for different markets or business changes

export const CARBE_COMMISSION_PERCENT = 15; // 15% commission for Carbe platform
export const SERVICE_FEE_PERCENT = 5; // 5% service fee for platform services
export const DEFAULT_FUEL_DEPOSIT = 50; // €50 default fuel deposit (editable per booking)
export const INSURANCE_DEDUCTIBLE = 100; // €100 insurance deductible

// Additional pricing constants
export const CLEANING_FEE = 25; // €25 cleaning fee (if applicable)
export const LATE_RETURN_FEE_PER_HOUR = 15; // €15 per hour for late returns
export const CANCELLATION_FEE_PERCENT = 10; // 10% cancellation fee (if within 24h)

// Fuel deposit range (hosts can adjust within this range)
export const MIN_FUEL_DEPOSIT = 0; // Minimum fuel deposit
export const MAX_FUEL_DEPOSIT = 200; // Maximum fuel deposit

// Currency settings
export const DEFAULT_CURRENCY = '€';
export const CURRENCY_CODE = 'EUR';

// Default pickup and additional info templates
export const DEFAULT_PICKUP_LOCATION = "Default pickup location will be provided";
export const DEFAULT_ADDITIONAL_INFO = "Check-in instructions will be sent 24h before pickup. Vehicle has GPS tracking and 24/7 roadside assistance.";
