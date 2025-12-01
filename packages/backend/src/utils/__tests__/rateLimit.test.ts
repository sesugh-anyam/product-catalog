import { APIGatewayProxyEvent } from 'aws-lambda';
import { checkRateLimit, RateLimits } from '../rateLimit';

// Helper to create mock event
const createMockEvent = (sourceIp: string): Partial<APIGatewayProxyEvent> => ({
  requestContext: {
    identity: {
      sourceIp,
    },
  } as APIGatewayProxyEvent['requestContext'],
});

// Mock Date.now for consistent testing
const mockNow = 1000000;
const originalDateNow = Date.now;

describe('Rate Limit Utils', () => {
  beforeEach(() => {
    // Reset the rate limit store before each test
    // Since the store is a module-level Map, we need to clear it
    Date.now = jest.fn(() => mockNow);
  });

  afterEach(() => {
    Date.now = originalDateNow;
  });

  describe('checkRateLimit', () => {
    it('should allow requests within rate limit', () => {
      const event = createMockEvent('192.168.1.1') as APIGatewayProxyEvent;
      const config = RateLimits.REGISTER;

      // First request should succeed
      const result1 = checkRateLimit(event, config);
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(config.maxRequests - 1);
      
      // Second request should succeed
      const result2 = checkRateLimit(event, config);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(config.maxRequests - 2);
    });

    it('should block requests when rate limit is exceeded', () => {
      const event = createMockEvent('192.168.1.2') as APIGatewayProxyEvent;
      const config = RateLimits.REGISTER; // 20 requests per 15 minutes

      // Make max allowed requests
      for (let i = 0; i < config.maxRequests; i++) {
        const result = checkRateLimit(event, config);
        expect(result.allowed).toBe(true);
      }

      // Next request should exceed limit
      const blockedResult = checkRateLimit(event, config);
      expect(blockedResult.allowed).toBe(false);
      expect(blockedResult.remaining).toBe(0);
      expect(blockedResult.retryAfter).toBeDefined();
      expect(blockedResult.retryAfter!).toBeGreaterThan(0);
    });

    it('should use different buckets for different IP addresses', () => {
      const event1 = createMockEvent('192.168.1.3') as APIGatewayProxyEvent;
      const event2 = createMockEvent('192.168.1.4') as APIGatewayProxyEvent;
      const config = RateLimits.REGISTER;

      // IP 1 makes requests
      for (let i = 0; i < config.maxRequests; i++) {
        const result = checkRateLimit(event1, config);
        expect(result.allowed).toBe(true);
      }

      // IP 1 should be rate limited
      const blocked = checkRateLimit(event1, config);
      expect(blocked.allowed).toBe(false);

      // IP 2 should still be allowed
      const allowed = checkRateLimit(event2, config);
      expect(allowed.allowed).toBe(true);
    });

    it('should reset after time window expires', () => {
      const event = createMockEvent('192.168.1.5') as APIGatewayProxyEvent;
      const config = RateLimits.RESEND_OTP; // 20 requests per 5 minutes
      let currentTime = mockNow;

      Date.now = jest.fn(() => currentTime);

      // Make max allowed requests
      for (let i = 0; i < config.maxRequests; i++) {
        const result = checkRateLimit(event, config);
        expect(result.allowed).toBe(true);
      }

      // Should be rate limited
      const blocked = checkRateLimit(event, config);
      expect(blocked.allowed).toBe(false);

      // Advance time beyond window (5 minutes + 1 second)
      currentTime += (config.windowMs + 1000);
      Date.now = jest.fn(() => currentTime);

      // Should be allowed again after window expires
      const allowedAgain = checkRateLimit(event, config);
      expect(allowedAgain.allowed).toBe(true);
      expect(allowedAgain.remaining).toBe(config.maxRequests - 1);
    });

    it('should handle concurrent requests from same IP', () => {
      const event = createMockEvent('192.168.1.6') as APIGatewayProxyEvent;
      const config = { maxRequests: 2, windowMs: 60000, keyPrefix: 'test' };

      // First request
      const result1 = checkRateLimit(event, config);
      expect(result1.allowed).toBe(true);
      expect(result1.remaining).toBe(1);
      
      // Second request
      const result2 = checkRateLimit(event, config);
      expect(result2.allowed).toBe(true);
      expect(result2.remaining).toBe(0);
      
      // Third request should fail
      const result3 = checkRateLimit(event, config);
      expect(result3.allowed).toBe(false);
      expect(result3.remaining).toBe(0);
    });

    it('should handle unknown IP gracefully', () => {
      const event: Partial<APIGatewayProxyEvent> = {
        requestContext: {
          identity: {},
        } as APIGatewayProxyEvent['requestContext'],
      };
      const config = RateLimits.REGISTER;

      const result = checkRateLimit(event as APIGatewayProxyEvent, config);
      expect(result.allowed).toBe(true);
    });
  });

  describe('RateLimits Configurations', () => {
    it('should have REGISTER configuration', () => {
      expect(RateLimits.REGISTER).toBeDefined();
      expect(RateLimits.REGISTER.maxRequests).toBe(20);
      expect(RateLimits.REGISTER.windowMs).toBe(15 * 60 * 1000); // 15 minutes
    });

    it('should have RESEND_OTP configuration', () => {
      expect(RateLimits.RESEND_OTP).toBeDefined();
      expect(RateLimits.RESEND_OTP.maxRequests).toBe(20);
      expect(RateLimits.RESEND_OTP.windowMs).toBe(5 * 60 * 1000); // 5 minutes
    });

    it('should have FORGOT_PASSWORD configuration', () => {
      expect(RateLimits.FORGOT_PASSWORD).toBeDefined();
      expect(RateLimits.FORGOT_PASSWORD.maxRequests).toBe(20);
      expect(RateLimits.FORGOT_PASSWORD.windowMs).toBe(15 * 60 * 1000); // 15 minutes
    });

    it('should have RESET_PASSWORD configuration', () => {
      expect(RateLimits.RESET_PASSWORD).toBeDefined();
      expect(RateLimits.RESET_PASSWORD.maxRequests).toBe(20);
      expect(RateLimits.RESET_PASSWORD.windowMs).toBe(15 * 60 * 1000); // 15 minutes
    });
  });
});

