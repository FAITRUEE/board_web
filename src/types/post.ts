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
}

export interface UpdatePostRequest {
  title: string;
  content: string;
}

export interface PostListResponse {
  posts: Post[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}