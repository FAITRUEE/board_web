import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const AdSection = () => {
  return (
    <div className="space-y-6">
      {/* 배너 광고 */}
      <Card className="overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
        <CardContent className="p-6 text-white">
          <div className="text-xs opacity-75 mb-2">SPONSORED</div>
          <h3 className="font-bold text-lg mb-2">프리미엄 호스팅</h3>
          <p className="text-sm opacity-90 mb-4">
            99.9% 가동시간 보장<br />월 ₩9,900부터
          </p>
          <Button size="sm" variant="secondary" className="w-full">
            자세히 보기
          </Button>
        </CardContent>
      </Card>

      {/* 이미지 배너 광고 */}
      <Card className="overflow-hidden">
        <div className="relative bg-gradient-to-r from-green-400 to-blue-500 h-48 flex items-center justify-center">
          <div className="text-center text-white p-4">
            <div className="text-xs opacity-75 mb-2">AD</div>
            <div className="text-2xl font-bold mb-2">🚀</div>
            <h3 className="font-bold text-lg mb-1">개발자 도구</h3>
            <p className="text-sm opacity-90">생산성 3배 향상</p>
          </div>
        </div>
      </Card>

      {/* 텍스트 광고 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">추천 서비스</CardTitle>
            <Badge variant="outline" className="text-xs">AD</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="font-semibold text-sm mb-1">☁️ 클라우드 저장소</div>
            <div className="text-xs text-gray-600">1TB 무료 체험</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="font-semibold text-sm mb-1">📊 데이터 분석 툴</div>
            <div className="text-xs text-gray-600">실시간 인사이트 제공</div>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="font-semibold text-sm mb-1">🎓 온라인 강의</div>
            <div className="text-xs text-gray-600">50% 할인 중</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};