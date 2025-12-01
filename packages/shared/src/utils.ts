/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 8;
};

/**
 * Sanitizes string input by trimming whitespace
 */
export const sanitizeString = (input: string): string => {
  return input.trim();
};

/**
 * Validates positive number
 */
export const isPositiveNumber = (value: number): boolean => {
  return typeof value === 'number' && value >= 0 && !isNaN(value);
};

/**
 * Formats price to 2 decimal places
 */
export const formatPrice = (price: number): string => {
  return price.toFixed(2);
};

/**
 * Generates a slug from a string
 */
export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Creates a delay promise
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Type guard for checking if error is an Error object
 */
export const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};

/**
 * Extracts error message from unknown error
 */
export const getErrorMessage = (error: unknown): string => {
  if (isError(error)) {
    return error.message;
  }
  return String(error);
};
