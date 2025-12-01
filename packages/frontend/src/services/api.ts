import {
  User,
  Product,
  Category,
  CreateUserDto,
  LoginDto,
  CreateProductDto,
  UpdateProductDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  StockUpdate,
  ProductQuery,
  ApiResponse,
  PaginatedResponse,
  LowStockItem,
  StockHistory,
} from '@product-catalog/shared'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

class ApiClient {
  private getHeaders(token?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return headers
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(token),
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      const message = errorData.message || errorData.error || `HTTP error! status: ${response.status}`
      throw new Error(message)
    }

    return response.json()
  }

  async register(data: CreateUserDto): Promise<ApiResponse<{ message: string; email: string }>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async verifyOtp(data: { email: string; otp: string }): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async resendOtp(data: { email: string }): Promise<ApiResponse<{ message: string }>> {
    return this.request('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async forgotPassword(data: { email: string }): Promise<ApiResponse<{ message: string }>> {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async verifyResetToken(data: { token: string }): Promise<ApiResponse<{ message: string; email: string }>> {
    return this.request('/auth/verify-reset-token', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async resetPassword(data: { token: string; password: string }): Promise<ApiResponse<{ user: User; token: string; message: string }>> {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async login(data: LoginDto): Promise<ApiResponse<{ user: User; token: string }>> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getProfile(token: string): Promise<ApiResponse<User>> {
    return this.request('/auth/profile', {}, token)
  }

  async getProducts(
    query?: ProductQuery,
    token?: string
  ): Promise<ApiResponse<PaginatedResponse<Product>>> {
    const params = new URLSearchParams()
    if (query?.search) params.append('search', query.search)
    if (query?.categoryId) params.append('categoryId', query.categoryId)
    if (query?.page) params.append('page', query.page.toString())
    if (query?.pageSize) params.append('pageSize', query.pageSize.toString())

    const queryString = params.toString()
    return this.request(`/products${queryString ? `?${queryString}` : ''}`, {}, token)
  }

  async getProduct(id: string, token: string): Promise<ApiResponse<Product>> {
    return this.request(`/products/${id}`, {}, token)
  }

  async createProduct(data: CreateProductDto, token: string): Promise<ApiResponse<Product>> {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token)
  }

  async updateProduct(
    id: string,
    data: UpdateProductDto,
    token: string
  ): Promise<ApiResponse<Product>> {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token)
  }

  async deleteProduct(id: string, token: string): Promise<ApiResponse<void>> {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    }, token)
  }

  async getCategories(token: string): Promise<ApiResponse<Category[]>> {
    return this.request('/categories', {}, token)
  }

  async createCategory(data: CreateCategoryDto, token: string): Promise<ApiResponse<Category>> {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token)
  }

  async updateCategory(
    id: string,
    data: UpdateCategoryDto,
    token: string
  ): Promise<ApiResponse<Category>> {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, token)
  }

  async deleteCategory(id: string, token: string): Promise<ApiResponse<void>> {
    return this.request(`/categories/${id}`, {
      method: 'DELETE',
    }, token)
  }

  async updateStock(data: StockUpdate, token: string): Promise<ApiResponse<Product>> {
    return this.request('/inventory/update', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token)
  }

  async getLowStockItems(token: string): Promise<ApiResponse<LowStockItem[]>> {
    return this.request('/inventory/low-stock', {}, token)
  }

  async getStockHistory(
    productId: string,
    token: string
  ): Promise<ApiResponse<StockHistory[]>> {
    return this.request(`/inventory/history/${productId}`, {}, token)
  }

  async getUploadUrl(
    fileName: string,
    fileType: string,
    token: string
  ): Promise<ApiResponse<{ uploadUrl: string; fileUrl: string }>> {
    return this.request('/upload/url', {
      method: 'POST',
      body: JSON.stringify({ fileName, fileType }),
    }, token)
  }

  async uploadToS3(uploadUrl: string, file: File): Promise<void> {
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to upload file to S3')
    }
  }
}

export const apiClient = new ApiClient()
