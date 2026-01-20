export interface Post {
  id: number;
  title: string;
  content: string;
  authorId: number;
  authorName: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
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
}