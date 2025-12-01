import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { connectDatabase } from "../config/database";
import { getErrorMessage } from "@product-catalog/shared";

export type Handler = (
  event: APIGatewayProxyEvent
) => Promise<APIGatewayProxyResult>;

export const createResponse = (
  statusCode: number,
  body: unknown
): APIGatewayProxyResult => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
  },
  body: JSON.stringify(body),
});

export const successResponse = <T>(
  data: T,
  statusCode = 200
): APIGatewayProxyResult => createResponse(statusCode, { success: true, data });

export const errorResponse = (
  message: string,
  statusCode = 400
): APIGatewayProxyResult =>
  createResponse(statusCode, { success: false, error: message });

export const withDatabase = (handler: Handler): Handler => {
  return async (
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> => {
    try {
      await connectDatabase();
      return await handler(event);
    } catch (error) {
      console.error("Handler error:", error);
      return errorResponse(getErrorMessage(error), 500);
    }
  };
};

export const parseBody = <T>(event: APIGatewayProxyEvent): T => {
  if (!event.body) {
    throw new Error("Request body is required");
  }

  try {
    return JSON.parse(event.body) as T;
  } catch {
    throw new Error("Invalid JSON in request body");
  }
};

export const getPathParameter = (
  event: APIGatewayProxyEvent,
  paramName: string
): string => {
  const value = event.pathParameters?.[paramName];

  if (!value) {
    throw new Error(`Path parameter '${paramName}' is required`);
  }

  return value;
};

export const getQueryParameter = (
  event: APIGatewayProxyEvent,
  paramName: string,
  defaultValue?: string
): string | undefined => {
  return event.queryStringParameters?.[paramName] || defaultValue;
};
