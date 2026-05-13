import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Users, Clock, ArrowRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCollabRooms, useCreateCollabRoom, useDeleteCollabRoom } from "@/hooks/useCollabRoom";
import { useMyTeams } from "@/hooks/useTeam";

const CollabRoomListPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data: rooms, isLoading } = useCollabRooms();
  const { data: teams } = useMyTeams();
  const createRoomMutation = useCreateCollabRoom();
  const deleteRoomMutation = useDeleteCollabRoom();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [roomTitle, setRoomTitle] = useState("");

  const handleCreateRoom = async () => {
    if (!selectedTeamId) {
      toast({ title: "팀 선택 필요", description: "방을 만들 팀을 선택해주세요.", variant: "destructive" });
      return;
    }
    try {
      const room = await createRoomMutation.mutateAsync({
        teamId: selectedTeamId,
        title: roomTitle || "새 공동 편집",
      });
      setShowCreateModal(false);
      setRoomTitle("");
      setSelectedTeamId(null);
      navigate(`/collab/${room.id}`);
    } catch (e: any) {
      toast({ title: "생성 실패", description: e.message, variant: "destructive" });
    }
  };

  const handleDelete = async (roomId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("이 방을 삭제하시겠습니까?")) return;
    try {
      await deleteRoomMutation.mutateAsync(roomId);
      toast({ title: "방 삭제 완료" });
    } catch (e: any) {
      toast({ title: "삭제 실패", description: e.message, variant: "destructive" });
    }
  };

  const formatDate = (s: string) =>
    new Date(s).toLocaleDateString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">공동 편집 방</h1>
          <p className="text-sm text-gray-500 mt-1">팀원과 함께 게시글을 작성하세요</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          방 만들기
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      ) : rooms && rooms.length > 0 ? (
        <div className="space-y-3">
          {rooms.map((room) => (
            <Card
              key={room.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/collab/${room.id}`)}
            >
              <CardContent className="flex items-center justify-between py-4 px-5">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 truncate">
                      {room.title || "제목 없음"}
                    </span>
                    <Badge variant="outline" className="text-xs shrink-0">
                      <Users className="w-3 h-3 mr-1" />
                      {room.teamName}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>생성: {room.createdByUsername}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(room.updatedAt)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDelete(room.id, e)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-medium">진행 중인 공동 편집 방이 없습니다.</p>
            <p className="text-sm mt-1">팀원과 함께 새 방을 만들어보세요.</p>
          </CardContent>
        </Card>
      )}

      {/* 방 만들기 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>공동 편집 방 만들기</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">팀 선택</label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {teams && teams.length > 0 ? (
                    teams.map((team) => (
                      <button
                        key={team.id}
                        onClick={() => setSelectedTeamId(team.id)}
                        className={`w-full text-left px-3 py-2 rounded-md border text-sm transition-colors ${
                          selectedTeamId === team.id
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <span className="font-medium">{team.name}</span>
                        <span className="text-gray-400 ml-2">({team.memberCount}명)</span>
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 py-2">소속된 팀이 없습니다.</p>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">방 제목 (선택)</label>
                <input
                  type="text"
                  value={roomTitle}
                  onChange={(e) => setRoomTitle(e.target.value)}
                  placeholder="새 공동 편집"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyDown={(e) => e.key === "Enter" && handleCreateRoom()}
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <Button variant="outline" onClick={() => { setShowCreateModal(false); setSelectedTeamId(null); setRoomTitle(""); }}>
                  취소
                </Button>
                <Button
                  onClick={handleCreateRoom}
                  disabled={createRoomMutation.isPending || !selectedTeamId}
                >
                  {createRoomMutation.isPending ? "생성 중..." : "방 만들기"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CollabRoomListPage;
