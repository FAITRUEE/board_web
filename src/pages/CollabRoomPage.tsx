import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Users, Wifi, WifiOff, Send, Save, History, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  useCollabRoom,
  useCollabRoomHistory,
  useCreateCollabRoomSnapshot,
  usePublishCollabRoom,
  useRestoreCollabRoomSnapshot,
  useUpdateCollabRoomContent,
} from "@/hooks/useCollabRoom";
import { useCollabRoomEdit } from "@/hooks/useCollabRoomEdit";
import { useCategories } from "@/hooks/useCategories";

const AVATAR_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const CollabRoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const id = parseInt(roomId || "0");

  const { data: room, isLoading } = useCollabRoom(id);
  const updateContentMutation = useUpdateCollabRoomContent();
  const publishMutation = usePublishCollabRoom();
  const { data: categories } = useCategories();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSaved, setIsSaved] = useState(true);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishCategoryId, setPublishCategoryId] = useState<number | undefined>();
  const [publishTags, setPublishTags] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryId, setSelectedHistoryId] = useState<number | null>(null);

  const { data: history, isLoading: isHistoryLoading } = useCollabRoomHistory(id, showHistory);
  const createSnapshotMutation = useCreateCollabRoomSnapshot();
  const restoreMutation = useRestoreCollabRoomSnapshot();
  const selectedHistory = history?.find((h) => h.id === selectedHistoryId);

  const saveDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedRoomIdRef = useRef<number | null>(null);

  // 방 데이터 초기 로드 (저장 후 다시 불러올 때 입력 중인 내용을 덮어쓰지 않도록 한 번만)
  useEffect(() => {
    if (room && initializedRoomIdRef.current !== room.id) {
      initializedRoomIdRef.current = room.id;
      setTitle(room.title || "");
      setContent(room.content || "");
    }
  }, [room]);

  const { isConnected, activeEditors, broadcastContentChange } = useCollabRoomEdit({
    roomId: id,
    onRemoteContentChange: (remoteContent) => {
      setContent(remoteContent);
    },
  });

  const handleContentChange = (value: string) => {
    setContent(value);
    broadcastContentChange(value);
    setIsSaved(false);
    if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current);
    saveDebounceRef.current = setTimeout(async () => {
      try {
        await updateContentMutation.mutateAsync({ roomId: id, req: { title, content: value } });
        setIsSaved(true);
      } catch {}
    }, 1000);
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    setIsSaved(false);
    if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current);
    saveDebounceRef.current = setTimeout(async () => {
      try {
        await updateContentMutation.mutateAsync({ roomId: id, req: { title: value, content } });
        setIsSaved(true);
      } catch {}
    }, 1000);
  };

  const handleSaveSnapshot = async () => {
    try {
      await createSnapshotMutation.mutateAsync({ roomId: id });
      toast({ title: "현재 버전을 저장했습니다." });
    } catch (e: any) {
      toast({ title: "버전 저장 실패", description: e.message, variant: "destructive" });
    }
  };

  const handleRestore = async (historyId: number) => {
    if (!window.confirm("이 버전으로 복원할까요? 현재 내용은 버전 기록에 남습니다.")) return;
    try {
      if (saveDebounceRef.current) clearTimeout(saveDebounceRef.current);
      const restored = await restoreMutation.mutateAsync({ roomId: id, historyId });
      setTitle(restored.title || "");
      setContent(restored.content || "");
      setIsSaved(true);
      setSelectedHistoryId(null);
      toast({ title: "버전을 복원했습니다." });
    } catch (e: any) {
      toast({ title: "복원 실패", description: e.message, variant: "destructive" });
    }
  };

  const handlePublish = async () => {
    try {
      const { postId } = await publishMutation.mutateAsync({
        roomId: id,
        req: {
          categoryId: publishCategoryId,
          tags: publishTags.split(",").map((t) => t.trim()).filter(Boolean),
        },
      });
      toast({ title: "게시글 발행 완료!", description: "게시판에서 확인할 수 있습니다." });
      navigate(`/posts/${postId}`);
    } catch (e: any) {
      toast({ title: "발행 실패", description: e.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        방을 찾을 수 없습니다.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 헤더 */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/collab")}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              목록
            </Button>
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {room.teamName}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            {/* 접속 중인 편집자 아바타 */}
            {activeEditors.length > 0 && (
              <div className="flex items-center gap-1">
                {activeEditors.slice(0, 4).map((editor, i) => (
                  <div
                    key={editor.userId}
                    title={editor.username}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                  >
                    {editor.username[0].toUpperCase()}
                  </div>
                ))}
                <span className="text-xs text-gray-500 ml-1">{activeEditors.length}명 편집 중</span>
              </div>
            )}

            {/* 연결 상태 */}
            <div className="flex items-center gap-1 text-xs">
              {isConnected ? (
                <><Wifi className="w-3 h-3 text-green-500" /><span className="text-green-600">연결됨</span></>
              ) : (
                <><WifiOff className="w-3 h-3 text-gray-400" /><span className="text-gray-400">연결 중...</span></>
              )}
            </div>

            {/* 저장 상태 */}
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Save className="w-3 h-3" />
              {isSaved ? "저장됨" : "저장 중..."}
            </span>

            <Button
              size="sm"
              variant={showHistory ? "secondary" : "outline"}
              onClick={() => setShowHistory((v) => !v)}
              className="flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              버전 기록
            </Button>

            <Button
              size="sm"
              onClick={() => setShowPublishModal(true)}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              게시글로 발행
            </Button>
          </div>
        </div>
      </header>

      {/* 편집 영역 */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 flex flex-col gap-4">
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="제목을 입력하세요"
          className="w-full text-3xl font-bold border-none outline-none bg-transparent placeholder-gray-300 text-gray-900"
        />
        <hr />
        <textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="팀원과 함께 내용을 작성하세요..."
          className="flex-1 w-full min-h-[60vh] border-none outline-none bg-transparent resize-none text-gray-700 leading-relaxed text-base placeholder-gray-300"
        />
      </main>

      {/* 버전 기록 패널 */}
      {showHistory && (
        <aside className="fixed top-0 right-0 h-full w-full max-w-sm bg-white border-l shadow-xl z-50 flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h2 className="font-bold flex items-center gap-2">
              <History className="w-4 h-4" />
              버전 기록
            </h2>
            <Button variant="ghost" size="sm" onClick={() => { setShowHistory(false); setSelectedHistoryId(null); }}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="px-4 py-3 border-b">
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={handleSaveSnapshot}
              disabled={createSnapshotMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {createSnapshotMutation.isPending ? "저장 중..." : "현재 버전 저장"}
            </Button>
            <p className="text-xs text-gray-400 mt-2">
              편집 중에는 5분마다 자동으로 버전이 저장됩니다.
            </p>
          </div>

          {selectedHistory ? (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="px-4 py-3 border-b flex items-center justify-between gap-2">
                <Button variant="ghost" size="sm" onClick={() => setSelectedHistoryId(null)}>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  목록
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleRestore(selectedHistory.id)}
                  disabled={restoreMutation.isPending}
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  {restoreMutation.isPending ? "복원 중..." : "이 버전으로 복원"}
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto px-4 py-3">
                <p className="text-xs text-gray-400 mb-2">
                  {new Date(selectedHistory.createdAt).toLocaleString("ko-KR")} · {selectedHistory.username}
                </p>
                <h3 className="text-lg font-bold mb-3">{selectedHistory.title || "제목 없음"}</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                  {selectedHistory.content || <span className="text-gray-300">(내용 없음)</span>}
                </p>
              </div>
            </div>
          ) : (
            <ul className="flex-1 overflow-y-auto divide-y">
              {isHistoryLoading && <li className="px-4 py-6 text-sm text-gray-400 text-center">불러오는 중...</li>}
              {!isHistoryLoading && !history?.length && (
                <li className="px-4 py-6 text-sm text-gray-400 text-center">아직 저장된 버전이 없습니다.</li>
              )}
              {history?.map((h) => (
                <li key={h.id}>
                  <button
                    onClick={() => setSelectedHistoryId(h.id)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-gray-900 truncate">{h.title || "제목 없음"}</span>
                      {h.changeDescription && (
                        <Badge variant="outline" className="shrink-0 text-[10px]">{h.changeDescription}</Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(h.createdAt).toLocaleString("ko-KR")} · {h.username}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      )}

      {/* 발행 모달 */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-bold mb-4">게시글로 발행</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">카테고리 (선택)</label>
                <select
                  value={publishCategoryId ?? ""}
                  onChange={(e) => setPublishCategoryId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">카테고리 없음</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">태그 (쉼표로 구분)</label>
                <input
                  type="text"
                  value={publishTags}
                  onChange={(e) => setPublishTags(e.target.value)}
                  placeholder="예: 기획, 리뷰, 공지"
                  className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <Button variant="outline" onClick={() => setShowPublishModal(false)}>취소</Button>
              <Button onClick={handlePublish} disabled={publishMutation.isPending}>
                {publishMutation.isPending ? "발행 중..." : "발행하기"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollabRoomPage;
