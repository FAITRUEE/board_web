import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Edit, Trash2, Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as categoryService from "@/services/categoryService";
import { Badge } from "@/components/ui/badge";
import { Category } from "@/types/category";

const CategoryManagePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  });

  const createMutation = useMutation({
    mutationFn: categoryService.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: "카테고리 생성 완료" });
      setIsCreating(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "생성 실패", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, request }: { id: number; request: any }) =>
      categoryService.updateCategory(id, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: "카테고리 수정 완료" });
      setEditingId(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: "수정 실패", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: categoryService.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: "카테고리 삭제 완료" });
    },
    onError: (error: any) => {
      toast({ title: "삭제 실패", description: error.message, variant: "destructive" });
    },
  });

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    color: "#3B82F6",
    icon: "📁",
    description: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      color: "#3B82F6",
      icon: "📁",
      description: "",
    });
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      color: category.color,
      icon: category.icon,
      description: category.description,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({ title: "오류", description: "카테고리 이름을 입력하세요.", variant: "destructive" });
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, request: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("정말로 이 카테고리를 삭제하시겠습니까?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    resetForm();
  };

  // 자주 사용하는 이모지 목록
  const commonEmojis = ["📁", "✈️", "🍔", "💻", "🎮", "📚", "🎵", "🎨", "⚽", "🏠", "💼", "🎬"];
  
  // 자주 사용하는 색상 목록
  const commonColors = [
    "#3B82F6", // 파랑
    "#10B981", // 초록
    "#F59E0B", // 주황
    "#EF4444", // 빨강
    "#8B5CF6", // 보라
    "#EC4899", // 핑크
    "#06B6D4", // 청록
    "#84CC16", // 라임
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">카테고리 불러오는 중...</p>
        </div>
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
              <h1 className="text-xl font-semibold">카테고리 관리</h1>
            </div>
            {!isCreating && !editingId && (
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="w-4 h-4 mr-2" />
                새 카테고리
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* 생성/수정 폼 */}
        {(isCreating || editingId) && (
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? "카테고리 수정" : "새 카테고리 생성"}</CardTitle>
              <CardDescription>
                카테고리 정보를 입력하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">카테고리 이름 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="예: 여행, 음식, IT"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>아이콘 선택</Label>
                  <div className="flex flex-wrap gap-2">
                    {commonEmojis.map((emoji) => (
                      <Button
                        key={emoji}
                        type="button"
                        variant={formData.icon === emoji ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFormData({ ...formData, icon: emoji })}
                        className="text-lg"
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                  <Input
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="또는 직접 입력"
                    className="mt-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label>색상 선택</Label>
                  <div className="flex flex-wrap gap-2">
                    {commonColors.map((color) => (
                      <Button
                        key={color}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormData({ ...formData, color })}
                        style={{
                          backgroundColor: formData.color === color ? color : "transparent",
                          borderColor: color,
                          color: formData.color === color ? "white" : color,
                        }}
                      >
                        <div
                          className="w-6 h-6 rounded"
                          style={{ backgroundColor: color }}
                        />
                      </Button>
                    ))}
                  </div>
                  <Input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="mt-2 h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">설명</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="카테고리 설명"
                  />
                </div>

                {/* 미리보기 */}
                <div className="space-y-2">
                  <Label>미리보기</Label>
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{formData.icon}</span>
                      <Badge
                        style={{
                          backgroundColor: `${formData.color}20`,
                          borderColor: formData.color,
                          color: formData.color,
                        }}
                      >
                        {formData.name || "카테고리명"}
                      </Badge>
                      {formData.description && (
                        <span className="text-sm text-gray-500">{formData.description}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    {editingId ? "수정" : "생성"}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-2" />
                    취소
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* 카테고리 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>등록된 카테고리 ({categories?.length || 0})</CardTitle>
            <CardDescription>
              카테고리를 수정하거나 삭제할 수 있습니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            {categories && categories.length > 0 ? (
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            style={{
                              backgroundColor: `${category.color}20`,
                              borderColor: category.color,
                              color: category.color,
                            }}
                          >
                            {category.name}
                          </Badge>
                        </div>
                        {category.description && (
                          <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">등록된 카테고리가 없습니다.</p>
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  첫 카테고리 만들기
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CategoryManagePage;