import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CreateProductDto, UpdateProductDto } from '@product-catalog/shared';
import { ProductModel } from '../models/Product';
import {
  withDatabase,
  parseBody,
  successResponse,
  errorResponse,
  getPathParameter,
  getQueryParameter,
} from '../utils/handler';
import { getUserFromEvent } from '../utils/auth';

export const list = withDatabase(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const search = getQueryParameter(event, 'search');
      const categoryId = getQueryParameter(event, 'categoryId');
      const page = parseInt(getQueryParameter(event, 'page', '1') || '1', 10);
      const pageSize = parseInt(getQueryParameter(event, 'pageSize', '20') || '20', 10);

      const query: Record<string, unknown> = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      if (categoryId) {
        query.categoryId = categoryId;
      }

      const total = await ProductModel.countDocuments(query);
      const products = await ProductModel.find(query)
        .populate({
          path: 'categoryId',
          select: 'name',
          model: 'Category'
        })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .sort({ createdAt: -1 });

      const items = products.map(p => {
        if (!p.categoryId) {
          return {
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
          };
        }

        const category = p.categoryId as unknown as { _id: string; name: string } | string;
        const isPopulated = typeof category === 'object' && category !== null && 'name' in category;
        return {
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
        };
      });

      return successResponse({
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      });
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : 'Failed to fetch products', 500);
    }
  }
);

export const get = withDatabase(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const id = getPathParameter(event, 'id');

      const product = await ProductModel.findById(id).populate({
        path: 'categoryId',
        select: 'name',
        model: 'Category'
      });
      if (!product) {
        return errorResponse('Product not found', 404);
      }

      if (!product.categoryId) {
        return successResponse({
          id: product._id.toString(),
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          categoryId: undefined,
          categoryName: 'Uncategorized',
          imageUrl: product.imageUrl,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        });
      }

      const category = product.categoryId as unknown as { _id: string; name: string } | string;
      const isPopulated = typeof category === 'object' && category !== null && 'name' in category;

      return successResponse({
        id: product._id.toString(),
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        categoryId: isPopulated ? category._id : product.categoryId.toString(),
        categoryName: isPopulated ? category.name : 'Unknown',
        imageUrl: product.imageUrl,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      });
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : 'Failed to fetch product', 500);
    }
  }
);

export const create = withDatabase(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      getUserFromEvent(event);

      const data = parseBody<CreateProductDto>(event);

      if (!data.name || !data.description || data.price === undefined || data.stock === undefined) {
        return errorResponse('Missing required fields');
      }

      if (data.price < 0) {
        return errorResponse('Price cannot be negative');
      }

      if (data.stock < 0) {
        return errorResponse('Stock cannot be negative');
      }

      if (data.categoryId) {
        const mongoose = await import('mongoose');
        const categoryExists = await mongoose.model('Category').findById(data.categoryId);
        if (!categoryExists) {
          return errorResponse('Category not found');
        }
      }

      const product = await ProductModel.create(data);
      
      if (product.categoryId) {
        await product.populate({
          path: 'categoryId',
          select: 'name',
          model: 'Category'
        });
      }

      if (!product.categoryId) {
        return successResponse({
          id: product._id.toString(),
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          categoryId: undefined,
          categoryName: 'Uncategorized',
          imageUrl: product.imageUrl,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        }, 201);
      }

      const category = product.categoryId as unknown as { _id: string; name: string } | string;
      const isPopulated = typeof category === 'object' && category !== null && 'name' in category;

      return successResponse({
        id: product._id.toString(),
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        categoryId: isPopulated ? category._id : product.categoryId.toString(),
        categoryName: isPopulated ? category.name : 'Unknown',
        imageUrl: product.imageUrl,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      }, 201);
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : 'Failed to create product', 500);
    }
  }
);

export const update = withDatabase(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      getUserFromEvent(event);

      const id = getPathParameter(event, 'id');
      const data = parseBody<UpdateProductDto>(event);

      if (data.price !== undefined && data.price < 0) {
        return errorResponse('Price cannot be negative');
      }

      if (data.stock !== undefined && data.stock < 0) {
        return errorResponse('Stock cannot be negative');
      }

      if (data.categoryId) {
        const mongoose = await import('mongoose');
        const categoryExists = await mongoose.model('Category').findById(data.categoryId);
        if (!categoryExists) {
          return errorResponse('Category not found');
        }
      }

      const updateOps: { $set?: Record<string, unknown>; $unset?: Record<string, string> } = {};
      const setFields: Record<string, unknown> = {};
      const unsetFields: Record<string, string> = {};

      Object.keys(data).forEach((key) => {
        const value = (data as Record<string, unknown>)[key];
        if (value === undefined || value === null) {
          unsetFields[key] = '';
        } else {
          setFields[key] = value;
        }
      });

      if (Object.keys(setFields).length > 0) {
        updateOps.$set = setFields;
      }
      if (Object.keys(unsetFields).length > 0) {
        updateOps.$unset = unsetFields;
      }

      const product = await ProductModel.findByIdAndUpdate(
        id,
        updateOps,
        { new: true, runValidators: true }
      );

      if (!product) {
        return errorResponse('Product not found', 404);
      }

      if (product.categoryId) {
        await product.populate({
          path: 'categoryId',
          select: 'name',
          model: 'Category'
        });
      }

      if (!product.categoryId) {
        return successResponse({
          id: product._id.toString(),
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          categoryId: undefined,
          categoryName: 'Uncategorized',
          imageUrl: product.imageUrl,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        });
      }

      const category = product.categoryId as unknown as { _id: string; name: string } | string;
      const isPopulated = typeof category === 'object' && category !== null && 'name' in category;

      return successResponse({
        id: product._id.toString(),
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        categoryId: isPopulated ? category._id : product.categoryId.toString(),
        categoryName: isPopulated ? category.name : 'Unknown',
        imageUrl: product.imageUrl,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      });
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : 'Failed to update product', 500);
    }
  }
);

export const deleteProduct = withDatabase(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      getUserFromEvent(event);

      const id = getPathParameter(event, 'id');

      const product = await ProductModel.findByIdAndDelete(id);
      if (!product) {
        return errorResponse('Product not found', 404);
      }

      return successResponse({ message: 'Product deleted successfully' });
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : 'Failed to delete product', 500);
    }
  }
);

export { deleteProduct as delete };
