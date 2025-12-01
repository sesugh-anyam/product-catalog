import { APIGatewayProxyEvent } from 'aws-lambda';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyPrefix?: string;
}

export function checkRateLimit(
  event: APIGatewayProxyEvent,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetTime: number; retryAfter?: number } {
  const ip = event.requestContext.identity.sourceIp || 'unknown';
  const key = `${config.keyPrefix || 'default'}:${ip}`;
  const now = Date.now();

  let entry = rateLimitStore.get(key);

  if (!entry || entry.resetTime < now) {
    entry = {
      count: 0,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);
  }

  entry.count++;

  const remaining = Math.max(0, config.maxRequests - entry.count);
  const allowed = entry.count <= config.maxRequests;
  const retryAfter = allowed ? undefined : Math.ceil((entry.resetTime - now) / 1000);

  return {
    allowed,
    remaining,
    resetTime: entry.resetTime,
    retryAfter,
  };
}

export const RateLimits = {
  REGISTER: {
    maxRequests: 20,
    windowMs: 15 * 60 * 1000,
    keyPrefix: 'register',
  },
  RESEND_OTP: {
    maxRequests: 20,
    windowMs: 5 * 60 * 1000,
    keyPrefix: 'resend-otp',
  },
  FORGOT_PASSWORD: {
    maxRequests: 20,
    windowMs: 15 * 60 * 1000,
    keyPrefix: 'forgot-password',
  },
  RESET_PASSWORD: {
    maxRequests: 20,
    windowMs: 15 * 60 * 1000,
    keyPrefix: 'reset-password',
  },
} as const;
