import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Palette,
  Smile
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export const RichTextEditor = ({ 
  value, 
  onChange, 
  placeholder = "내용을 입력하세요...",
  minHeight = "300px"
}: RichTextEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const insertEmoji = (emoji: string) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(emoji));
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    }
    updateContent();
    editorRef.current?.focus();
  };

  const colors = [
    "#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", 
    "#FF00FF", "#00FFFF", "#FFA500", "#800080", "#008000"
  ];

  const bgColors = [
    "#FFFFFF", "#FFFF00", "#00FF00", "#00FFFF", "#FF00FF",
    "#FFA500", "#FFB6C1", "#E6E6FA", "#F0E68C", "#D3D3D3"
  ];

  const emojis = ["😀", "😎", "👍", "🔥", "❤️", "⭐", "✅", "💡", "🎉", "🚀"];

  const ToolbarButton = ({ 
    onClick, 
    icon: Icon, 
    title 
  }: { 
    onClick: () => void; 
    icon: any; 
    title: string 
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      title={title}
      className="h-8 w-8 p-0"
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {/* 툴바 */}
      <div className="bg-gray-50 border-b p-2 flex flex-wrap gap-1">
        {/* 텍스트 스타일 */}
        <div className="flex gap-1">
          <ToolbarButton 
            onClick={() => executeCommand('bold')} 
            icon={Bold} 
            title="굵게" 
          />
          <ToolbarButton 
            onClick={() => executeCommand('italic')} 
            icon={Italic} 
            title="기울임" 
          />
          <ToolbarButton 
            onClick={() => executeCommand('underline')} 
            icon={Underline} 
            title="밑줄" 
          />
          <ToolbarButton 
            onClick={() => executeCommand('strikeThrough')} 
            icon={Strikethrough} 
            title="취소선" 
          />
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* 제목 */}
        <div className="flex gap-1">
          <ToolbarButton 
            onClick={() => executeCommand('formatBlock', '<h1>')} 
            icon={Heading1} 
            title="제목 1" 
          />
          <ToolbarButton 
            onClick={() => executeCommand('formatBlock', '<h2>')} 
            icon={Heading2} 
            title="제목 2" 
          />
          <ToolbarButton 
            onClick={() => executeCommand('formatBlock', '<h3>')} 
            icon={Heading3} 
            title="제목 3" 
          />
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* 색상 */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="글씨 색상"
            >
              <Palette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3">
            <div className="space-y-2">
              <p className="text-xs font-medium">글씨 색상</p>
              <div className="grid grid-cols-5 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-500"
                    style={{ backgroundColor: color }}
                    onClick={() => executeCommand('foreColor', color)}
                  />
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="배경 색상"
            >
              <div className="relative">
                <Palette className="h-4 w-4" />
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-yellow-300 rounded-full border border-white" />
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3">
            <div className="space-y-2">
              <p className="text-xs font-medium">배경 색상</p>
              <div className="grid grid-cols-5 gap-2">
                {bgColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-500"
                    style={{ backgroundColor: color }}
                    onClick={() => executeCommand('hiliteColor', color)}
                  />
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-8" />

        {/* 정렬 */}
        <div className="flex gap-1">
          <ToolbarButton 
            onClick={() => executeCommand('justifyLeft')} 
            icon={AlignLeft} 
            title="왼쪽 정렬" 
          />
          <ToolbarButton 
            onClick={() => executeCommand('justifyCenter')} 
            icon={AlignCenter} 
            title="가운데 정렬" 
          />
          <ToolbarButton 
            onClick={() => executeCommand('justifyRight')} 
            icon={AlignRight} 
            title="오른쪽 정렬" 
          />
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* 목록 */}
        <div className="flex gap-1">
          <ToolbarButton 
            onClick={() => executeCommand('insertUnorderedList')} 
            icon={List} 
            title="글머리 기호" 
          />
          <ToolbarButton 
            onClick={() => executeCommand('insertOrderedList')} 
            icon={ListOrdered} 
            title="번호 목록" 
          />
          <ToolbarButton 
            onClick={() => executeCommand('formatBlock', '<blockquote>')} 
            icon={Quote} 
            title="인용문" 
          />
          <ToolbarButton 
            onClick={() => executeCommand('formatBlock', '<pre>')} 
            icon={Code} 
            title="코드 블록" 
          />
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* 이모지 */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              title="이모지"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3">
            <div className="grid grid-cols-5 gap-2">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="text-2xl hover:bg-gray-100 rounded p-1"
                  onClick={() => insertEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* 에디터 영역 */}
      <div
        ref={editorRef}
        contentEditable
        onInput={updateContent}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`p-4 outline-none prose max-w-none ${
          isFocused ? 'ring-2 ring-blue-500 ring-inset' : ''
        }`}
        style={{ 
          minHeight,
          maxHeight: '500px',
          overflowY: 'auto'
        }}
        data-placeholder={placeholder}
      />

      <style>{`
        [contentEditable="true"]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
          position: absolute;
        }
        
        .prose h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 0.67em 0;
        }
        
        .prose h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 0.75em 0;
        }
        
        .prose h3 {
          font-size: 1.17em;
          font-weight: bold;
          margin: 0.83em 0;
        }
        
        .prose blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1em;
          margin: 1em 0;
          color: #6b7280;
        }
        
        .prose pre {
          background-color: #f3f4f6;
          padding: 1em;
          border-radius: 0.375rem;
          overflow-x: auto;
          font-family: monospace;
        }
        
        .prose ul, .prose ol {
          margin: 1em 0;
          padding-left: 2em;
        }
      `}</style>
    </div>
  );
};