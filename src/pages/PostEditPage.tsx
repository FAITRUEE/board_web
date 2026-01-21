import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { usePost, useUpdatePost } from "@/hooks/usePosts";
import { RichTextEditor } from "@/components/board/RichTextEditor";
import { CategorySelect } from "@/components/board/CategorySelect";
import { TagInput } from "@/components/board/TagInput";  // ✅ 추가

const PostEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const postId = parseInt(id || "0");
  const { data: post, isLoading, error } = usePost(postId);
  const updatePostMutation = useUpdatePost();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [tags, setTags] = useState<string[]>([]);  // ✅ 추가

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setCategoryId(post.category?.id);
      // ✅ 태그 초기값 설정
      if (post.tags) {
        setTags(post.tags.map(tag => tag.name));
      }
      
      if (user && user.id !== post.authorId) {
        toast({
          title: "접근 권한 없음",
          description: "본인이 작성한 게시글만 수정할 수 있습니다.",
          variant: "destructive",
        });
        navigate(`/posts/${id}`);
      }
    }
  }, [post, user, id, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast({
        title: "입력 오류",
        description: "제목과 내용을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    updatePostMutation.mutate(
      {
        id: postId,
        request: {
          title: title.trim(),
          content: content.trim(),
          categoryId,
          tags,  // ✅ 태그 추가
        },
      },
      {
        onSuccess: () => {
          toast({
            title: "게시글 수정 완료",
            description: "게시글이 성공적으로 수정되었습니다.",
          });
          navigate(`/posts/${id}`);
        },
        onError: (error) => {
          toast({
            title: "게시글 수정 실패",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/posts/${id}`)}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>뒤로가기</span>
            </Button>
            <h1 className="text-xl font-semibold">게시글 수정</h1>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>게시글 수정</CardTitle>
            <CardDescription>
              게시글의 제목, 내용, 카테고리, 태그를 수정할 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <CategorySelect 
                value={categoryId}
                onChange={setCategoryId}
              />

              {/* ✅ 태그 입력 추가 */}
              <TagInput
                value={tags}
                onChange={setTags}
              />

              <div className="space-y-2">
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="게시글 제목을 입력하세요"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">내용</Label>
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="게시글 내용을 입력하세요"
                  minHeight="300px"
                />
              </div>

              <div className="flex items-center justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate(`/posts/${id}`)}
                  disabled={updatePostMutation.isPending}
                >
                  취소
                </Button>
                <Button type="submit" disabled={updatePostMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {updatePostMutation.isPending ? "저장 중..." : "수정 완료"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PostEditPage;