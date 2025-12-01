import { APIGatewayProxyEvent } from 'aws-lambda';
import {
  createResponse,
  successResponse,
  errorResponse,
  parseBody,
  getPathParameter,
  getQueryParameter,
} from '../handler';

describe('Handler Utils', () => {
  describe('createResponse', () => {
    it('should create response with correct status code and body', () => {
      const response = createResponse(200, { message: 'Success' });
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toBe(JSON.stringify({ message: 'Success' }));
      expect(response.headers).toEqual({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      });
    });

    it('should handle null body', () => {
      const response = createResponse(204, null);
      
      expect(response.statusCode).toBe(204);
      expect(response.body).toBe('null');
    });

    it('should handle complex objects', () => {
      const data = {
        user: { id: '123', email: 'test@example.com' },
        items: [1, 2, 3],
      };
      const response = createResponse(200, data);
      
      expect(response.body).toBe(JSON.stringify(data));
    });
  });

  describe('successResponse', () => {
    it('should create 200 success response with data', () => {
      const data = { id: '123', name: 'Test Product' };
      const response = successResponse(data);
      
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(data);
    });

    it('should create success response with custom status code', () => {
      const data = { message: 'Created' };
      const response = successResponse(data, 201);
      
      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.data).toEqual(data);
    });
  });

  describe('errorResponse', () => {
    it('should create error response with message', () => {
      const response = errorResponse('Something went wrong', 500);
      
      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Something went wrong');
    });

    it('should default to 400 status code', () => {
      const response = errorResponse('Bad request');
      
      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Bad request');
    });

    it('should handle different status codes', () => {
      const response = errorResponse('Not found', 404);
      
      expect(response.statusCode).toBe(404);
    });
  });

  describe('parseBody', () => {
    it('should parse JSON body', () => {
      const event: Partial<APIGatewayProxyEvent> = {
        body: JSON.stringify({ name: 'Test', price: 99.99 }),
      };
      
      const parsed = parseBody<{ name: string; price: number }>(event as APIGatewayProxyEvent);
      
      expect(parsed.name).toBe('Test');
      expect(parsed.price).toBe(99.99);
    });

    it('should throw error for invalid JSON', () => {
      const event: Partial<APIGatewayProxyEvent> = {
        body: 'invalid json',
      };
      
      expect(() => parseBody(event as APIGatewayProxyEvent)).toThrow();
    });

    it('should throw error for null body', () => {
      const event: Partial<APIGatewayProxyEvent> = {
        body: null,
      };
      
      expect(() => parseBody(event as APIGatewayProxyEvent)).toThrow();
    });

    it('should parse empty object', () => {
      const event: Partial<APIGatewayProxyEvent> = {
        body: '{}',
      };
      
      const parsed = parseBody(event as APIGatewayProxyEvent);
      
      expect(parsed).toEqual({});
    });
  });

  describe('getPathParameter', () => {
    it('should extract path parameter', () => {
      const event: Partial<APIGatewayProxyEvent> = {
        pathParameters: {
          id: '123',
          category: 'electronics',
        },
      };
      
      const id = getPathParameter(event as APIGatewayProxyEvent, 'id');
      const category = getPathParameter(event as APIGatewayProxyEvent, 'category');
      
      expect(id).toBe('123');
      expect(category).toBe('electronics');
    });

    it('should throw error when parameter is missing', () => {
      const event: Partial<APIGatewayProxyEvent> = {
        pathParameters: {},
      };
      
      expect(() => getPathParameter(event as APIGatewayProxyEvent, 'id')).toThrow(
        "Path parameter 'id' is required"
      );
    });

    it('should throw error when pathParameters is null', () => {
      const event: Partial<APIGatewayProxyEvent> = {
        pathParameters: null,
      };
      
      expect(() => getPathParameter(event as APIGatewayProxyEvent, 'id')).toThrow(
        "Path parameter 'id' is required"
      );
    });
  });

  describe('getQueryParameter', () => {
    it('should extract query parameter', () => {
      const event: Partial<APIGatewayProxyEvent> = {
        queryStringParameters: {
          page: '1',
          limit: '10',
          search: 'laptop',
        },
      };
      
      const page = getQueryParameter(event as APIGatewayProxyEvent, 'page');
      const limit = getQueryParameter(event as APIGatewayProxyEvent, 'limit');
      const search = getQueryParameter(event as APIGatewayProxyEvent, 'search');
      
      expect(page).toBe('1');
      expect(limit).toBe('10');
      expect(search).toBe('laptop');
    });

    it('should return undefined for missing optional parameter', () => {
      const event: Partial<APIGatewayProxyEvent> = {
        queryStringParameters: {},
      };
      
      const result = getQueryParameter(event as APIGatewayProxyEvent, 'page');
      
      expect(result).toBeUndefined();
    });

    it('should return default value when parameter is missing', () => {
      const event: Partial<APIGatewayProxyEvent> = {
        queryStringParameters: {},
      };
      
      const result = getQueryParameter(event as APIGatewayProxyEvent, 'page', '1');
      
      expect(result).toBe('1');
    });

    it('should return undefined when queryStringParameters is null', () => {
      const event: Partial<APIGatewayProxyEvent> = {
        queryStringParameters: null,
      };
      
      const result = getQueryParameter(event as APIGatewayProxyEvent, 'page');
      
      expect(result).toBeUndefined();
    });

    it('should return actual value over default when parameter exists', () => {
      const event: Partial<APIGatewayProxyEvent> = {
        queryStringParameters: {
          page: '5',
        },
      };
      
      const result = getQueryParameter(event as APIGatewayProxyEvent, 'page', '1');
      
      expect(result).toBe('5');
    });
  });
});
