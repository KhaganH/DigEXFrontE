import { apiClient } from './api';
import { Category } from './productService';

class CategoryService {
  async getCategories(): Promise<Category[]> {
    return apiClient.get<Category[]>('/api/public/categories');
  }

  async getCategory(id: number): Promise<Category> {
    return apiClient.get<Category>(`/api/public/categories/${id}`);
  }
}

export const categoryService = new CategoryService();