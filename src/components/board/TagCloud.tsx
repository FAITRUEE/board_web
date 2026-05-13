import { usePopularTags } from "@/hooks/useTags";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TagCloudProps {
  onTagClick?: (tagName: string) => void;
}

export const TagCloud = ({ onTagClick }: TagCloudProps) => {
  const { data: tags, isLoading } = usePopularTags();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>인기 태그</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tags || tags.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>인기 태그</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">아직 태그가 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  // 최소/최대 사용 횟수
  const minCount = Math.min(...tags.map(t => t.useCount));
  const maxCount = Math.max(...tags.map(t => t.useCount));

  // 폰트 크기 계산 (12px ~ 32px)
  const calculateSize = (count: number) => {
    if (maxCount === minCount) return 16;
    const normalized = (count - minCount) / (maxCount - minCount);
    return 12 + normalized * 20;
  };

  // 색상 계산
  const calculateColor = (count: number) => {
    if (maxCount === minCount) return 'rgb(59, 130, 246)';
    const normalized = (count - minCount) / (maxCount - minCount);
    // 파란색 계열로 그라데이션
    const blue = Math.round(100 + normalized * 155);
    return `rgb(59, ${blue}, 246)`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>인기 태그</CardTitle>
        <CardDescription>
          크기는 태그 사용 빈도를 나타냅니다
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3 justify-center py-4">
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => onTagClick?.(tag.name)}
              className="transition-transform hover:scale-110"
              style={{
                fontSize: `${calculateSize(tag.useCount)}px`,
                color: calculateColor(tag.useCount),
                fontWeight: 'bold',
              }}
            >
              #{tag.name}
            </button>
          ))}
        </div>
        
        {/* 태그 통계 */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{tags.length}</p>
              <p className="text-xs text-gray-500">전체 태그</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{maxCount}</p>
              <p className="text-xs text-gray-500">최다 사용</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">
                {tags.reduce((sum, t) => sum + t.useCount, 0)}
              </p>
              <p className="text-xs text-gray-500">총 사용 횟수</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};