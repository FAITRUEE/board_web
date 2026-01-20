import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useComments, useCreateComment, useDeleteComment, useUpdateComment } from "@/hooks/useComments";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Edit2, X, Check } from "lucide-react";

interface CommentListProps {
  postId: number;
}

export const CommentList = ({ postId }: CommentListProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  const { data: commentsData, isLoading } = useComments(postId);
  const createCommentMutation = useCreateComment(postId);
  const updateCommentMutation = useUpdateComment(postId);
  const deleteCommentMutation = useDeleteComment(postId);

  const handleSubmit = () => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "댓글을 작성하려면 로그인해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: "입력 오류",
        description: "댓글 내용을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    createCommentMutation.mutate(
      { content: newComment.trim() },
      {
        onSuccess: () => {
          setNewComment("");
          toast({
            title: "댓글 작성 완료",
            description: "댓글이 성공적으로 작성되었습니다.",
          });
        },
        onError: (error) => {
          toast({
            title: "댓글 작성 실패",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleEdit = (commentId: number, content: string) => {
    setEditingId(commentId);
    setEditContent(content);
  };

  const handleUpdate = (commentId: number) => {
    if (!editContent.trim()) {
      toast({
        title: "입력 오류",
        description: "댓글 내용을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    updateCommentMutation.mutate(
      { commentId, request: { content: editContent.trim() } },
      {
        onSuccess: () => {
          setEditingId(null);
          setEditContent("");
          toast({
            title: "댓글 수정 완료",
          });
        },
        onError: (error) => {
          toast({
            title: "댓글 수정 실패",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleDelete = (commentId: number) => {
    if (!confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
      return;
    }

    deleteCommentMutation.mutate(commentId, {
      onSuccess: () => {
        toast({
          title: "댓글 삭제 완료",
        });
      },
      onError: (error) => {
        toast({
          title: "댓글 삭제 실패",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return <div className="text-center py-4">댓글을 불러오는 중...</div>;
  }

  const comments = commentsData?.comments || [];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        댓글 ({comments.length})
      </h3>

      {/* 댓글 작성 */}
      {user && (
        <div className="space-y-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="댓글을 입력하세요..."
            rows={3}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={createCommentMutation.isPending}
            >
              {createCommentMutation.isPending ? "작성 중..." : "댓글 작성"}
            </Button>
          </div>
        </div>
      )}

      {/* 댓글 목록 */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              첫 번째 댓글을 작성해보세요!
            </CardContent>
          </Card>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="pt-4">
                {editingId === comment.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingId(null);
                          setEditContent("");
                        }}
                      >
                        <X className="w-4 h-4 mr-1" />
                        취소
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleUpdate(comment.id)}
                        disabled={updateCommentMutation.isPending}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        수정
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold">{comment.authorName}</span>
                          <span className="text-sm text-gray-500">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                      {user && user.id === comment.authorId && (
                        <div className="flex space-x-2 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(comment.id, comment.content)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(comment.id)}
                            disabled={deleteCommentMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};