import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as postService from '@/services/postService';
import { CreatePostRequest, UpdatePostRequest } from '@/types/post';

// 게시글 목록 조회 훅
export const usePosts = (page: number = 0, size: number = 10) => {
  return useQuery({
    queryKey: ['posts', page, size],
    queryFn: () => postService.getPosts(page, size),
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
      // 게시글 목록 새로고침
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
      // 해당 게시글과 목록 새로고침
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
      // 게시글 목록 새로고침
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
      // 해당 게시글 새로고침
      queryClient.invalidateQueries({ queryKey: ['post', id] });
    },
  });
};