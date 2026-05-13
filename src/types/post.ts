import { Category } from './category';
import { Tag } from './tag';  // ✅ 추가

export interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  authorName: string;
  views: number;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
  attachments?: PostAttachment[];
  isSecret: boolean;
  isCollaborative?: boolean;
  teamId?: number;
  teamName?: string;
  category?: Category;
  tags?: Tag[];  // ✅ 추가
}

export interface PostAttachment {
  id: number;
  originalFileName: string;
  storedFileName: string;
  fileSize: number;
  contentType: string;
  uploadedAt: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  files?: File[];
  isSecret?: boolean;
  secretPassword?: string;
  isCollaborative?: boolean;
  categoryId?: number;
  tags?: string[];  // ✅ 추가
}

export interface UpdatePostRequest {
  title: string;
  content: string;
  categoryId?: number;
  tags?: string[];
  isCollaborative?: boolean;
  teamId?: number;  // ✅ 추가
}

export interface PostListResponse {
  posts: Post[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}