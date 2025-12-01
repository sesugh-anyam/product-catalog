import { generateToken, verifyToken, extractToken, getUserFromEvent, JwtPayload } from '../auth';
import { APIGatewayProxyEvent } from 'aws-lambda';
import jwt from 'jsonwebtoken';

describe('Authentication Utils', () => {
  const mockUserId = 'user123';
  const mockEmail = 'test@example.com';

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-key-for-testing';
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(mockUserId, mockEmail);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should generate different tokens for different user IDs', () => {
      const token1 = generateToken('user1', 'user1@example.com');
      const token2 = generateToken('user2', 'user2@example.com');
      
      expect(token1).not.toBe(token2);
    });

    it('should include userId and email in payload', () => {
      const token = generateToken(mockUserId, mockEmail);
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      
      expect(decoded.userId).toBe(mockUserId);
      expect(decoded.email).toBe(mockEmail);
    });

    it('should throw error if JWT_SECRET is not set', () => {
      delete process.env.JWT_SECRET;
      
      expect(() => generateToken(mockUserId, mockEmail)).toThrow('JWT_SECRET is not configured');
    });

    it('should set expiration time to 7 days', () => {
      const token = generateToken(mockUserId, mockEmail);
      const decoded = jwt.decode(token) as jwt.JwtPayload;
      
      expect(decoded.exp).toBeDefined();
      // Check that expiration is approximately 7 days from now
      const sevenDaysInSeconds = 7 * 24 * 60 * 60;
      const expectedExp = Math.floor(Date.now() / 1000) + sevenDaysInSeconds;
      expect(decoded.exp!).toBeGreaterThan(expectedExp - 10);
      expect(decoded.exp!).toBeLessThan(expectedExp + 10);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = generateToken(mockUserId, mockEmail);
      const decoded = verifyToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(mockUserId);
      expect(decoded.email).toBe(mockEmail);
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => verifyToken(invalidToken)).toThrow('Invalid or expired token');
    });

    it('should throw error for malformed token', () => {
      const malformedToken = 'not-a-jwt-token';
      
      expect(() => verifyToken(malformedToken)).toThrow('Invalid or expired token');
    });

    it('should throw error for token with wrong secret', () => {
      const token = generateToken(mockUserId, mockEmail);
      process.env.JWT_SECRET = 'different-secret';
      
      expect(() => verifyToken(token)).toThrow('Invalid or expired token');
    });

    it('should throw error if JWT_SECRET is not configured', () => {
      const token = generateToken(mockUserId, mockEmail);
      delete process.env.JWT_SECRET;
      
      expect(() => verifyToken(token)).toThrow('JWT_SECRET is not configured');
    });
  });

  describe('extractToken', () => {
    it('should extract token from Authorization header', () => {
      const token = 'valid-jwt-token';
      const event: Partial<APIGatewayProxyEvent> = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const extracted = extractToken(event as APIGatewayProxyEvent);
      expect(extracted).toBe(token);
    });

    it('should extract token from lowercase authorization header', () => {
      const token = 'valid-jwt-token';
      const event: Partial<APIGatewayProxyEvent> = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      };

      const extracted = extractToken(event as APIGatewayProxyEvent);
      expect(extracted).toBe(token);
    });

    it('should throw error when Authorization header is missing', () => {
      const event: Partial<APIGatewayProxyEvent> = {
        headers: {},
      };

      expect(() => extractToken(event as APIGatewayProxyEvent)).toThrow('Authorization header is required');
    });

    it('should throw error for invalid header format without Bearer', () => {
      const event: Partial<APIGatewayProxyEvent> = {
        headers: {
          Authorization: 'invalid-format-token',
        },
      };

      expect(() => extractToken(event as APIGatewayProxyEvent)).toThrow('Invalid authorization header format');
    });

    it('should throw error for empty Bearer token', () => {
      const event: Partial<APIGatewayProxyEvent> = {
        headers: {
          Authorization: 'Bearer',
        },
      };

      expect(() => extractToken(event as APIGatewayProxyEvent)).toThrow('Invalid authorization header format');
    });
  });

  describe('getUserFromEvent', () => {
    it('should extract and verify user from valid event', () => {
      const token = generateToken(mockUserId, mockEmail);
      const event: Partial<APIGatewayProxyEvent> = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const user = getUserFromEvent(event as APIGatewayProxyEvent);
      
      expect(user.userId).toBe(mockUserId);
      expect(user.email).toBe(mockEmail);
    });

    it('should throw error when token is invalid', () => {
      const event: Partial<APIGatewayProxyEvent> = {
        headers: {
          Authorization: 'Bearer invalid-token',
        },
      };

      expect(() => getUserFromEvent(event as APIGatewayProxyEvent)).toThrow('Invalid or expired token');
    });

    it('should throw error when Authorization header is missing', () => {
      const event: Partial<APIGatewayProxyEvent> = {
        headers: {},
      };

      expect(() => getUserFromEvent(event as APIGatewayProxyEvent)).toThrow('Authorization header is required');
    });
  });
});
