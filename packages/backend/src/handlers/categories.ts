import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CreateCategoryDto, UpdateCategoryDto } from '@product-catalog/shared';
import { CategoryModel } from '../models/Category';
import {
  withDatabase,
  parseBody,
  successResponse,
  errorResponse,
  getPathParameter,
} from '../utils/handler';
import { getUserFromEvent } from '../utils/auth';

export const list = withDatabase(
  async (_event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const categories = await CategoryModel.find().sort({ name: 1 });

      const items = categories.map(c => ({
        id: c._id.toString(),
        name: c.name,
        description: c.description,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      }));

      return successResponse(items);
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : 'Failed to fetch categories', 500);
    }
  }
);

export const get = withDatabase(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      const id = getPathParameter(event, 'id');

      const category = await CategoryModel.findById(id);
      if (!category) {
        return errorResponse('Category not found', 404);
      }

      return successResponse({
        id: category._id.toString(),
        name: category.name,
        description: category.description,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      });
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : 'Failed to fetch category', 500);
    }
  }
);

export const create = withDatabase(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      getUserFromEvent(event); // Verify authentication

      const data = parseBody<CreateCategoryDto>(event);

      if (!data.name) {
        return errorResponse('Category name is required');
      }

      const category = await CategoryModel.create(data);

      return successResponse({
        id: category._id.toString(),
        name: category.name,
        description: category.description,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      }, 201);
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : 'Failed to create category', 500);
    }
  }
);

export const update = withDatabase(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      getUserFromEvent(event); // Verify authentication

      const id = getPathParameter(event, 'id');
      const data = parseBody<UpdateCategoryDto>(event);

      const category = await CategoryModel.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      );

      if (!category) {
        return errorResponse('Category not found', 404);
      }

      return successResponse({
        id: category._id.toString(),
        name: category.name,
        description: category.description,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      });
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : 'Failed to update category', 500);
    }
  }
);

export const deleteCategory = withDatabase(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
      getUserFromEvent(event); // Verify authentication

      const id = getPathParameter(event, 'id');

      const category = await CategoryModel.findByIdAndDelete(id);
      if (!category) {
        return errorResponse('Category not found', 404);
      }

      return successResponse({ message: 'Category deleted successfully' });
    } catch (error) {
      return errorResponse(error instanceof Error ? error.message : 'Failed to delete category', 500);
    }
  }
);

export { deleteCategory as delete };
