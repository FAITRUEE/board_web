import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as postService from '@/services/postService';
import { CreatePostRequest, UpdatePostRequest } from '@/types/post';

// 게시글 목록 조회 훅 (카테고리 필터 추가)
export const usePosts = (
  page: number = 0, 
  size: number = 10, 
  sort?: string,
  categoryId?: number,
  tagName?: string  // ✅ 추가
) => {
  return useQuery({
    queryKey: ['posts', page, size, sort, categoryId, tagName],  // ✅ tagName 추가
    queryFn: () => postService.getPosts(page, size, sort, categoryId, tagName),  // ✅ tagName 전달
  });
};

// 게시글 상세 조회 훅
export const usePost = (id: number) => {
  return useQuery({
    queryKey: ['post', id],
    queryFn: () => postService.getPost(id),
    enabled: !!id,
  });
};

// 게시글 작성 훅
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreatePostRequest) => postService.createPost(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

// 게시글 수정 훅
export const useUpdatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdatePostRequest }) =>
      postService.updatePost(id, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['post', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

// 게시글 삭제 훅
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => postService.deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};

// 조회수 증가 훅
export const useIncrementViews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => postService.incrementViews(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
    },
  });
};

// 좋아요 토글 훅
export const useToggleLike = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => postService.toggleLike(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};