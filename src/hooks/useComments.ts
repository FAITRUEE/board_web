import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as commentService from '@/services/commentService';
import { CreateCommentRequest, UpdateCommentRequest } from '@/types/comment';

// 댓글 목록 조회
export const useComments = (postId: number) => {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: () => commentService.getComments(postId),
    enabled: !!postId,
  });
};

// 댓글 작성
export const useCreateComment = (postId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateCommentRequest) => commentService.createComment(postId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] }); // 댓글 수 업데이트
    },
  });
};

// 댓글 수정
export const useUpdateComment = (postId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commentId, request }: { commentId: number; request: UpdateCommentRequest }) =>
      commentService.updateComment(postId, commentId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });
};

// 댓글 삭제
export const useDeleteComment = (postId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentId: number) => commentService.deleteComment(postId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['post', postId] }); // 댓글 수 업데이트
    },
  });
};