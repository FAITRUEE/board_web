import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Trash2, User, Calendar, Eye, MessageSquare } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePost } from "@/hooks/usePosts";
import { usePosts } from "@/hooks/usePosts";
import { useToast } from "@/hooks/use-toast";

const PostDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { post, loading, error } = usePost(id || "");
  const { deletePost, incrementViews } = usePosts();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // 게시글 조회수 증가
    if (id && post) {
      incrementViews(id);
    }
  }, [id, post, incrementViews]);

  const handleEdit = () => {
    navigate(`/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      return;
    }

    if (!id) return;

    setIsDeleting(true);
    const { error } = await deletePost(id);

    if (error) {
      toast({
        title: "삭제 실패",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "게시글 삭제 완료",
        description: "게시글이 성공적으로 삭제되었습니다.",
      });
      navigate("/");
    }

    setIsDeleting(false);
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

  const isAuthor = user && post && user.id === post.author_id;

  if (loading) {
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
              {error || "게시글을 찾을 수 없습니다."}
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
                  disabled={isDeleting}
                  className="flex items-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeleting ? "삭제 중..." : "삭제"}</span>
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
              <Badge variant="secondary">
                조회 {post.views}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-gray-500 mt-4">
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{post.profiles_2026_01_19_07_12?.username || '익명'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(post.created_at)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>조회 {post.views}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="w-4 h-4" />
                <span>댓글 0</span>
              </div>
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

        {/* 댓글 섹션 (추후 구현) */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">댓글 (0)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              댓글 기능은 곧 추가될 예정입니다.
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PostDetail;