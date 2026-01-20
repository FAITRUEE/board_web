import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCreatePost } from "@/hooks/usePosts";
import { useToast } from "@/hooks/use-toast";

const PostCreatePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createPostMutation = useCreatePost();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const content = formData.get("content") as string;

    if (!title.trim() || !content.trim()) {
      toast({
        title: "입력 오류",
        description: "제목과 내용을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    createPostMutation.mutate(
      {
        title: title.trim(),
        content: content.trim(),
      },
      {
        onSuccess: () => {
          toast({
            title: "게시글 작성 완료",
            description: "게시글이 성공적으로 작성되었습니다.",
          });
          navigate("/");
        },
        onError: (error) => {
          toast({
            title: "게시글 작성 실패",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>목록으로</span>
            </Button>
            <h1 className="text-xl font-semibold">게시글 작성</h1>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>새 게시글 작성</CardTitle>
            <CardDescription>
              제목과 내용을 입력하여 새로운 게시글을 작성하세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  placeholder="게시글 제목을 입력하세요"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">내용</Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="게시글 내용을 입력하세요"
                  className="min-h-[300px]"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/")}
                  disabled={createPostMutation.isPending}
                >
                  취소
                </Button>
                <Button type="submit" disabled={createPostMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {createPostMutation.isPending ? "저장 중..." : "게시글 저장"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PostCreatePage;