import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, RefreshCw, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generatePost } from "@/services/aiService";

interface AIWritingAssistantProps {
  onGenerate: (title: string, content: string) => void;
}

interface GenerationOptions {
  tone: string;
  length: string;
  emoji: string;
  template: string;
}

const TONE_OPTIONS = [
  { value: "friendly", label: "친근한 🙂" },
  { value: "formal", label: "공식적인 💼" },
  { value: "humorous", label: "유머러스 😄" },
  { value: "professional", label: "전문적인 🎓" },
];

const LENGTH_OPTIONS = [
  { value: "short", label: "짧게 (300자)" },
  { value: "medium", label: "보통 (800자)" },
  { value: "long", label: "길게 (1500자)" },
];

const EMOJI_OPTIONS = [
  { value: "many", label: "이모지 많이 😊🎉✨" },
  { value: "few", label: "이모지 적당히 ✨" },
  { value: "none", label: "이모지 없이" },
];

const TEMPLATES = [
  { value: "custom", label: "직접 입력", prompt: "" },
  { value: "restaurant", label: "맛집 추천 🍽️", prompt: "맛집을 추천하는 게시글을 작성해주세요. 음식, 분위기, 가격대에 대해 상세히 설명해주세요." },
  { value: "travel", label: "여행 후기 ✈️", prompt: "여행 후기 게시글을 작성해주세요. 방문한 장소, 경험, 팁을 포함해주세요." },
  { value: "review", label: "상품 리뷰 ⭐", prompt: "상품 리뷰 게시글을 작성해주세요. 장단점, 사용 경험, 추천 대상을 포함해주세요." },
  { value: "question", label: "질문/토론 💭", prompt: "커뮤니티에 질문하거나 토론을 시작하는 게시글을 작성해주세요." },
  { value: "notice", label: "공지사항 📢", prompt: "공지사항 게시글을 작성해주세요. 명확하고 간결하게 전달해주세요." },
];

export const AIWritingAssistant = ({ onGenerate }: AIWritingAssistantProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [options, setOptions] = useState<GenerationOptions>({
    tone: "friendly",
    length: "medium",
    emoji: "few",
    template: "custom",
  });

  const handleTemplateChange = (value: string) => {
    const template = TEMPLATES.find(t => t.value === value);
    setOptions({ ...options, template: value });
    if (template && template.prompt) {
      setPrompt(template.prompt);
    } else {
      setPrompt("");
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "입력 필요",
        description: "어떤 내용의 게시글을 작성할지 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const result = await generatePost({
        prompt: prompt,
        tone: options.tone,
        length: options.length,
        emoji: options.emoji,
      });

      onGenerate(result.title, result.content);
      setOpen(false);
      
      toast({
        title: "생성 완료! ✨",
        description: "AI가 게시글을 생성했습니다.",
      });
    } catch (error: any) {
      console.error("AI 생성 오류:", error);
      toast({
        title: "생성 실패",
        description: error.message || "AI 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" className="gap-2">
          <Sparkles className="w-4 h-4" />
          AI 작성 도우미
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-600" />
            AI 작성 도우미
          </DialogTitle>
          <DialogDescription>
            AI가 게시글 작성을 도와드립니다. 원하는 내용과 스타일을 선택하세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* 템플릿 선택 */}
          <div className="space-y-2">
            <Label>템플릿</Label>
            <Select value={options.template} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="템플릿 선택" />
              </SelectTrigger>
              <SelectContent>
                {TEMPLATES.map((template) => (
                  <SelectItem key={template.value} value={template.value}>
                    {template.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 프롬프트 입력 */}
          <div className="space-y-2">
            <Label htmlFor="ai-prompt">
              어떤 게시글을 작성할까요?
            </Label>
            <Textarea
              id="ai-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="예: 서울 근교 봄 여행지 추천해줘"
              className="min-h-[100px]"
            />
          </div>

          {/* 스타일 옵션 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 톤 */}
            <div className="space-y-2">
              <Label>말투</Label>
              <Select
                value={options.tone}
                onValueChange={(value) => setOptions({ ...options, tone: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TONE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 길이 */}
            <div className="space-y-2">
              <Label>길이</Label>
              <Select
                value={options.length}
                onValueChange={(value) => setOptions({ ...options, length: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LENGTH_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 이모지 */}
            <div className="space-y-2">
              <Label>이모지</Label>
              <Select
                value={options.emoji}
                onValueChange={(value) => setOptions({ ...options, emoji: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMOJI_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  생성하기
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isGenerating}
            >
              취소
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};