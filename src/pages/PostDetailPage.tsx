import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Trash2, User, Calendar, Eye, Heart } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePost, useDeletePost, useIncrementViews, useToggleLike } from "@/hooks/usePosts";
import { useToast } from "@/hooks/use-toast";
import { CommentList } from "@/components/board/CommentList";

const PostDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const postId = parseInt(id || "0");
  const { data: post, isLoading, error } = usePost(postId);
  const deletePostMutation = useDeletePost();
  const incrementViewsMutation = useIncrementViews();
  const toggleLikeMutation = useToggleLike();

  useEffect(() => {
    if (postId) {
      incrementViewsMutation.mutate(postId);
    }
  }, [postId]);

  const handleEdit = () => {
    navigate(`/posts/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      return;
    }

    deletePostMutation.mutate(postId, {
      onSuccess: () => {
        toast({
          title: "게시글 삭제 완료",
          description: "게시글이 성공적으로 삭제되었습니다.",
        });
        navigate("/");
      },
      onError: (error) => {
        toast({
          title: "삭제 실패",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  const handleLike = () => {
    if (!user) {
      toast({
        title: "로그인 필요",
        description: "좋아요를 누르려면 로그인해주세요.",
        variant: "destructive",
      });
      return;
    }

    toggleLikeMutation.mutate(postId, {
      onError: (error) => {
        toast({
          title: "좋아요 실패",
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

  const isAuthor = user && post && user.id === post.authorId;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">게시글을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-8 text-center">
            <p className="text-red-600 mb-4">
              {error?.message || "게시글을 찾을 수 없습니다."}
            </p>
            <Button onClick={() => navigate("/")}>
              목록으로 돌아가기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate("/")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>목록으로</span>
              </Button>
            </div>
            {isAuthor && (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handleEdit}
                  className="flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>수정</span>
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={deletePostMutation.isPending}
                  className="flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{deletePostMutation.isPending ? "삭제 중..." : "삭제"}</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <CardTitle className="text-2xl font-bold leading-tight">
                {post.title}
              </CardTitle>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{post.authorName}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(post.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>조회 {post.views}</span>
                </div>
              </div>
              
              {/* 좋아요 버튼 */}
              <Button
                variant="outline"
                onClick={handleLike}
                disabled={toggleLikeMutation.isPending}
                className="flex items-center space-x-2"
              >
                <Heart 
                  className={`w-4 h-4 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} 
                />
                <span>{post.likeCount}</span>
              </Button>
            </div>
          </CardHeader>
          
          <Separator />
          
          <CardContent className="pt-6">
            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {post.content}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 댓글 섹션 */}
        <Card className="mt-8">
          <CardContent className="pt-6">
            <CommentList postId={postId} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PostDetailPage;