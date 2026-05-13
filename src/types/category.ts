export interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
  description: string;
  createdAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  color: string;
  icon: string;
  description: string;
}

export interface UpdateCategoryRequest {
  name: string;
  color: string;
  icon: string;
  description: string;
}