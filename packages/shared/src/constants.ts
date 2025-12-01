export const LOW_STOCK_THRESHOLD = 10;

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export const PASSWORD_MIN_LENGTH = 8;

export const JWT_EXPIRES_IN = '7d';

export const PRODUCT_PRICE_MIN = 0;
export const PRODUCT_PRICE_MAX = 1000000;

export const STOCK_MIN = 0;
export const STOCK_MAX = 1000000;

export const API_ROUTES = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
  },
  PRODUCTS: {
    LIST: '/products',
    CREATE: '/products',
    GET: '/products/:id',
    UPDATE: '/products/:id',
    DELETE: '/products/:id',
    LOW_STOCK: '/products/low-stock',
  },
  CATEGORIES: {
    LIST: '/categories',
    CREATE: '/categories',
    GET: '/categories/:id',
    UPDATE: '/categories/:id',
    DELETE: '/categories/:id',
  },
  INVENTORY: {
    UPDATE_STOCK: '/inventory/update',
    STOCK_HISTORY: '/inventory/history/:productId',
  },
} as const;
