import { APIGatewayProxyEvent } from 'aws-lambda';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  email: string;
}

export const extractToken = (event: APIGatewayProxyEvent): string => {
  const authHeader = event.headers?.Authorization || event.headers?.authorization;
  
  if (!authHeader) {
    throw new Error('Authorization header is required');
  }
  
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new Error('Invalid authorization header format. Use: Bearer <token>');
  }
  
  return parts[1];
};

export const verifyToken = (token: string): JwtPayload => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  
  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const getUserFromEvent = (event: APIGatewayProxyEvent): JwtPayload => {
  const token = extractToken(event);
  return verifyToken(token);
};

export const generateToken = (userId: string, email: string): string => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  
  const payload: JwtPayload = { userId, email };
  
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};
