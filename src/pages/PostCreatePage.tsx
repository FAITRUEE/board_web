import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Upload, X, Image as ImageIcon, Palette, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCreatePost } from "@/hooks/usePosts";
import { useToast } from "@/hooks/use-toast";
import { DrawingCanvas } from "@/components/board/DrawingCanvas";

const PostCreatePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createPostMutation = useCreatePost();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [drawings, setDrawings] = useState<File[]>([]);
  const [isSecret, setIsSecret] = useState(false);  // ✅ 추가
  const [secretPassword, setSecretPassword] = useState("");  // ✅ 추가

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeDrawing = (index: number) => {
    setDrawings(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveDrawing = (blob: Blob) => {
    const file = new File([blob], `drawing-${Date.now()}.png`, { type: "image/png" });
    setDrawings(prev => [...prev, file]);
    toast({
      title: "그림 저장 완료",
      description: "그림이 첨부파일에 추가되었습니다.",
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const isImageFile = (file: File): boolean => {
    return file.type.startsWith('image/');
  };

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

    // ✅ 비밀글 체크
    if (isSecret && !secretPassword.trim()) {
      toast({
        title: "비밀번호 필요",
        description: "비밀글로 설정하려면 비밀번호를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    const allFiles = [...files, ...drawings];

    createPostMutation.mutate(
      {
        title: title.trim(),
        content: content.trim(),
        files: allFiles.length > 0 ? allFiles : undefined,
        isSecret,  // ✅ 추가
        secretPassword: isSecret ? secretPassword : undefined,  // ✅ 추가
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
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="게시글 제목을 입력하세요"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">내용</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="게시글 내용을 입력하세요"
                  className="min-h-[200px]"
                  required
                />
              </div>

              {/* ✅ 비밀글 설정 */}
              <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isSecret"
                    checked={isSecret}
                    onCheckedChange={(checked) => setIsSecret(checked as boolean)}
                  />
                  <Label 
                    htmlFor="isSecret" 
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    비밀글로 설정
                  </Label>
                </div>

                {isSecret && (
                  <div className="space-y-2 ml-6">
                    <Label htmlFor="secretPassword">비밀번호</Label>
                    <Input
                      id="secretPassword"
                      type="password"
                      value={secretPassword}
                      onChange={(e) => setSecretPassword(e.target.value)}
                      placeholder="비밀번호를 입력하세요 (4자 이상)"
                      minLength={4}
                    />
                    <p className="text-xs text-gray-500">
                      💡 비밀번호를 입력한 사람만 게시글을 볼 수 있습니다.
                    </p>
                  </div>
                )}
              </div>

              {/* 탭: 파일 업로드 vs 그림 그리기 */}
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">
                    <Upload className="w-4 h-4 mr-2" />
                    파일 업로드
                  </TabsTrigger>
                  <TabsTrigger value="draw">
                    <Palette className="w-4 h-4 mr-2" />
                    그림 그리기
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        id="files"
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById('files')?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        파일 선택
                      </Button>
                      <span className="text-sm text-gray-500">
                        {files.length}개 파일 선택됨
                      </span>
                    </div>

                    {files.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {files.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              {isImageFile(file) ? (
                                <ImageIcon className="w-5 h-5 text-blue-500" />
                              ) : (
                                <Upload className="w-5 h-5 text-gray-500" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(file.size)}
                                  {isImageFile(file) && " • 이미지"}
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="draw" className="space-y-4">
                  <DrawingCanvas onSave={handleSaveDrawing} />
                  
                  {drawings.length > 0 && (
                    <div className="space-y-2">
                      <Label>저장된 그림 ({drawings.length})</Label>
                      <div className="space-y-2">
                        {drawings.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <Palette className="w-5 h-5 text-purple-500" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-gray-500">
                                  {formatFileSize(file.size)} • 손그림
                                </p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDrawing(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

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