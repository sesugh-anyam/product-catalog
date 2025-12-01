import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { StockUpdate, LOW_STOCK_THRESHOLD } from '@product-catalog/shared';
import { ProductModel } from '../models/Product';
import { StockHistoryModel } from '../models/StockHistory';
import {
  withDatabase,
  parseBody,
  successResponse,
  errorResponse,
  getPathParameter,
} from '../utils/handler';
import { getUserFromEvent } from '../utils/auth';

export const updateStock = withDatabase(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      getUserFromEvent(event); // Verify authentication

      const data = parseBody<StockUpdate>(event);

      if (!data.productId || data.quantity === undefined || !data.type) {
        return errorResponse('Missing required fields: productId, quantity, type');
      }

      const product = await ProductModel.findById(data.productId);
      if (!product) {
        return errorResponse('Product not found', 404);
      }

      const previousStock = product.stock;
      let newStock: number;
      let changeAmount: number;

      switch (data.type) {
        case 'add':
          newStock = previousStock + data.quantity;
          changeAmount = data.quantity;
          break;
        case 'subtract':
          newStock = Math.max(0, previousStock - data.quantity);
          changeAmount = -(previousStock - newStock);
          break;
        case 'set':
          newStock = data.quantity;
          changeAmount = newStock - previousStock;
          break;
        default:
          return errorResponse('Invalid type. Must be: add, subtract, or set');
      }

      product.stock = newStock;
      await product.save();

      await StockHistoryModel.create({
        productId: product._id,
        previousStock,
        newStock,
        changeAmount,
        type: data.type,
        reason: data.reason,
      });

      return successResponse({
        productId: product._id.toString(),
        previousStock,
        newStock,
        changeAmount,
      });
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : 'Failed to update stock', 500);
    }
  }
);

export const getStockHistory = withDatabase(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      getUserFromEvent(event);

      const productId = getPathParameter(event, 'productId');

      const history = await StockHistoryModel.find({ productId })
        .sort({ createdAt: -1 })
        .limit(50);

      const items = history.map(h => ({
        id: h._id.toString(),
        productId: h.productId.toString(),
        previousStock: h.previousStock,
        newStock: h.newStock,
        changeAmount: h.changeAmount,
        type: h.type,
        reason: h.reason,
        createdAt: h.createdAt,
      }));

      return successResponse(items);
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : 'Failed to fetch stock history', 500);
    }
  }
);

export const getLowStock = withDatabase(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      getUserFromEvent(event); // Verify authentication

      const products = await ProductModel.find({
        stock: { $lt: LOW_STOCK_THRESHOLD },
      }).populate({
        path: 'categoryId',
        select: 'name',
        model: 'Category'
      });

      const items = products.map(p => {
        if (!p.categoryId) {
          return {
            product: {
              id: p._id.toString(),
              name: p.name,
              description: p.description,
              price: p.price,
              stock: p.stock,
              categoryId: undefined,
              categoryName: 'Uncategorized',
              imageUrl: p.imageUrl,
              createdAt: p.createdAt,
              updatedAt: p.updatedAt,
            },
            threshold: LOW_STOCK_THRESHOLD,
          };
        }

        const category = p.categoryId as unknown as { _id: string; name: string } | string;
        const isPopulated = typeof category === 'object' && category !== null && 'name' in category;
        return {
          product: {
            id: p._id.toString(),
            name: p.name,
            description: p.description,
            price: p.price,
            stock: p.stock,
            categoryId: isPopulated ? category._id : p.categoryId.toString(),
            categoryName: isPopulated ? category.name : 'Unknown',
            imageUrl: p.imageUrl,
            createdAt: p.createdAt,
            updatedAt: p.updatedAt,
          },
          threshold: LOW_STOCK_THRESHOLD,
        };
      });

      return successResponse(items);
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : 'Failed to fetch low stock items', 500);
    }
  }
);
