import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eraser, Download, Trash2, Pencil } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface DrawingCanvasProps {
  onSave: (blob: Blob) => void;
}

export const DrawingCanvas = ({ onSave }: DrawingCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(3);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 캔버스 초기화 (흰 배경)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      // 터치 이벤트
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      // 마우스 이벤트
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;

    if ('touches' in e) {
      e.preventDefault(); // 스크롤 방지
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    
    if (tool === "eraser") {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = lineWidth * 3;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
    }
    
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        onSave(blob);
      }
    }, "image/png");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>그림 그리기</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 도구 선택 */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant={tool === "pen" ? "default" : "outline"}
            size="sm"
            onClick={() => setTool("pen")}
          >
            <Pencil className="w-4 h-4 mr-2" />
            펜
          </Button>
          <Button
            type="button"
            variant={tool === "eraser" ? "default" : "outline"}
            size="sm"
            onClick={() => setTool("eraser")}
          >
            <Eraser className="w-4 h-4 mr-2" />
            지우개
          </Button>
          
          {/* 색상 선택 */}
          <div className="flex items-center gap-2 ml-4">
            <label className="text-sm font-medium">색상:</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 rounded border cursor-pointer"
            />
          </div>

          {/* 선 굵기 */}
          <div className="flex items-center gap-2 ml-4 flex-1 min-w-[150px]">
            <label className="text-sm font-medium whitespace-nowrap">굵기:</label>
            <Slider
              value={[lineWidth]}
              onValueChange={(value) => setLineWidth(value[0])}
              min={1}
              max={20}
              step={1}
              className="flex-1"
            />
            <span className="text-sm text-gray-500 w-8">{lineWidth}</span>
          </div>
        </div>

        {/* 캔버스 */}
        <div className="border rounded-lg overflow-hidden bg-white">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full cursor-crosshair touch-none"
            style={{ maxHeight: "600px" }}
          />
        </div>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={clearCanvas}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            전체 지우기
          </Button>
          <Button
            type="button"
            onClick={saveDrawing}
          >
            <Download className="w-4 h-4 mr-2" />
            그림 저장
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};