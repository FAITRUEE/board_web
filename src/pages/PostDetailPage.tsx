import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Trash2, User, Calendar, Eye, Heart, Download, Image as ImageIcon, FileText, Lock } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePost, useDeletePost, useIncrementViews, useToggleLike } from "@/hooks/usePosts";
import { useToast } from "@/hooks/use-toast";
import { CommentList } from "@/components/board/CommentList";
import { downloadAttachment, verifySecretPost } from "@/services/postService";
import { SecretPasswordDialog } from "@/components/board/SecretPasswordDialog";
import { Post } from "@/types/post";

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

  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedPost, setVerifiedPost] = useState<Post | null>(null);
  const [isSecretLocked, setIsSecretLocked] = useState(false);

  const displayPost = verifiedPost || post;

  useEffect(() => {
    if (postId && !isSecretLocked) {
      incrementViewsMutation.mutate(postId);
    }
  }, [postId, isSecretLocked]);

  useEffect(() => {
    if (post && post.isSecret && post.content === "🔒 비밀글입니다." && !verifiedPost) {
      setIsSecretLocked(true);
      setShowPasswordDialog(true);
    }
  }, [post, verifiedPost]);

  const handleEdit = () => {
    navigate(`/posts/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await deletePostMutation.mutateAsync(postId);
      toast({
        title: "게시글 삭제 완료",
        description: "게시글이 성공적으로 삭제되었습니다.",
      });
      navigate("/", { replace: true });
    } catch (error: any) {
      toast({
        title: "삭제 실패",
        description: error.message || "게시글 삭제에 실패했습니다.",
        variant: "destructive",
      });
    }
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

    if (isSecretLocked) {
      toast({
        title: "접근 불가",
        description: "비밀번호를 먼저 확인해주세요.",
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

  const handlePasswordSubmit = async (password: string) => {
    setIsVerifying(true);
    try {
      const verifiedPostData = await verifySecretPost(postId, password);
      setVerifiedPost(verifiedPostData);
      setIsSecretLocked(false);
      setShowPasswordDialog(false);
      toast({
        title: "비밀번호 확인 완료",
        description: "게시글을 열람할 수 있습니다.",
      });
    } catch (error: any) {
      toast({
        title: "비밀번호 확인 실패",
        description: error.message || "비밀번호가 일치하지 않습니다.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePasswordDialogClose = () => {
    setShowPasswordDialog(false);
    navigate("/");
  };

  const handleDownload = (fileName: string, originalFileName: string) => {
    const url = downloadAttachment(fileName);
    const link = document.createElement('a');
    link.href = url;
    link.download = originalFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const isImageFile = (contentType: string): boolean => {
    return contentType.startsWith('image/');
  };

  const isAuthor = user && displayPost && user.id === displayPost.authorId;

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

  if (error || !displayPost) {
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
      <SecretPasswordDialog
        open={showPasswordDialog}
        onClose={handlePasswordDialogClose}
        onSubmit={handlePasswordSubmit}
        isLoading={isVerifying}
      />

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
            {isAuthor && !isSecretLocked && (
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
        <Card className={isSecretLocked ? "border-orange-200" : ""}>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {/* ✅ 카테고리 Badge */}
                  {displayPost.category && (
                    <Badge 
                      variant="outline"
                      style={{ 
                        backgroundColor: `${displayPost.category.color}20`,
                        borderColor: displayPost.category.color,
                        color: displayPost.category.color
                      }}
                    >
                      <span className="mr-1">{displayPost.category.icon}</span>
                      {displayPost.category.name}
                    </Badge>
                  )}
                  {displayPost.isSecret && (
                    <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                      <Lock className="w-3 h-3 mr-1" />
                      비밀글
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-2xl font-bold leading-tight">
                  {displayPost.title}
                </CardTitle>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-6 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4" />
                  <span>{displayPost.authorName}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(displayPost.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>조회 {displayPost.views}</span>
                </div>
              </div>
              
              {!isSecretLocked && (
                <Button
                  variant="outline"
                  onClick={handleLike}
                  disabled={toggleLikeMutation.isPending}
                  className="flex items-center space-x-2"
                >
                  <Heart 
                    className={`w-4 h-4 ${displayPost.isLiked ? 'fill-red-500 text-red-500' : ''}`} 
                  />
                  <span>{displayPost.likeCount}</span>
                </Button>
              )}
            </div>
          </CardHeader>
          
          <Separator />
          
          <CardContent className="pt-6">
            {isSecretLocked ? (
              <div className="py-16 text-center">
                <Lock className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  비밀글입니다
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  이 게시글을 보려면 비밀번호를 입력하세요.
                </p>
                <Button onClick={() => setShowPasswordDialog(true)}>
                  비밀번호 입력
                </Button>
              </div>
            ) : (
              <>
                {/* ✅ 이미지 미리보기 */}
                {displayPost.attachments && displayPost.attachments.some(att => isImageFile(att.contentType)) && (
                  <div className="mb-6 space-y-3">
                    {displayPost.attachments
                      .filter(att => isImageFile(att.contentType))
                      .map((attachment) => (
                        <div key={attachment.id} className="rounded-lg overflow-hidden border">
                          <img 
                            src={downloadAttachment(attachment.storedFileName)}
                            alt={attachment.originalFileName}
                            className="w-full h-auto"
                            loading="lazy"
                          />
                        </div>
                      ))
                    }
                  </div>
                )}

                <div className="prose max-w-none">
                  <div 
                    className="prose max-w-none text-gray-700 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: displayPost.content }}
                  />
                </div>

                {displayPost.attachments && displayPost.attachments.length > 0 && (
                  <div className="mt-8 pt-6 border-t">
                    <h3 className="text-lg font-semibold mb-4">첨부파일 ({displayPost.attachments.length})</h3>
                    <div className="space-y-2">
                      {displayPost.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {isImageFile(attachment.contentType) ? (
                              <ImageIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                            ) : (
                              <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {attachment.originalFileName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(attachment.fileSize)}
                                {isImageFile(attachment.contentType) && " • 이미지"}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(attachment.storedFileName, attachment.originalFileName)}
                            className="flex items-center gap-2 flex-shrink-0"
                          >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">다운로드</span>
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {!isSecretLocked && (
          <Card className="mt-8">
            <CardContent className="pt-6">
              <CommentList postId={postId} />
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default PostDetailPage;