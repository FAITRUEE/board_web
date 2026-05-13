import { useState, KeyboardEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { usePopularTags } from "@/hooks/useTags";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export const TagInput = ({ value, onChange, placeholder = "태그를 입력하세요 (Enter로 추가)" }: TagInputProps) => {
  const [inputValue, setInputValue] = useState("");
  const { data: popularTags } = usePopularTags();

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      
      // ✅ 10개 제한
      if (value.length >= 10) {
        return;
      }
      
      const newTag = inputValue.trim().toLowerCase();
      
      // 중복 체크
      if (!value.includes(newTag)) {
        onChange([...value, newTag]);
      }
      
      setInputValue("");
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // 입력값이 없을 때 Backspace로 마지막 태그 삭제
      onChange(value.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  const addPopularTag = (tagName: string) => {
    // ✅ 10개 제한
    if (value.length >= 10) {
      return;
    }
    
    if (!value.includes(tagName)) {
      onChange([...value, tagName]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>태그</Label>
        <div className="flex flex-wrap gap-2 p-2 border rounded-md min-h-[42px] bg-white">
          {value.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1"
            >
              <span>#{tag}</span>
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:bg-gray-300 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : ""}
            className="border-0 shadow-none focus-visible:ring-0 flex-1 min-w-[120px] px-0"
          />
        </div>
        <p className="text-xs text-gray-500">
          Enter 키로 태그 추가 • {value.length}/10개
        </p>
      </div>

      {/* 인기 태그 추천 */}
      {popularTags && popularTags.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs text-gray-600">인기 태그</Label>
          <div className="flex flex-wrap gap-2">
            {popularTags.slice(0, 10).map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="cursor-pointer hover:bg-gray-100"
                onClick={() => addPopularTag(tag.name)}
              >
                #{tag.name} ({tag.useCount})
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};