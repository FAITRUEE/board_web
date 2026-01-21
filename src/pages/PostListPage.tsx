import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Search, User, Calendar, Eye, LogOut, Heart, MessageSquare, RefreshCw, Lock, Settings, X, Pin, TrendingUp } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePosts } from "@/hooks/usePosts";
import { Pagination } from "@/components/board/Pagination";
import { useQuery } from "@tanstack/react-query";
import * as categoryService from "@/services/categoryService";
import logo from "../assets/logo.png";
import { TagCloud } from "@/components/board/TagCloud";
import { AdSection } from "@/components/board/AdSection";

const PostListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState("");  // 입력 상태
  const [keyword, setKeyword] = useState("");  // ✅ 실제 검색 키워드 (백엔드 전달)
  const [currentPage, setCurrentPage] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt,desc");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>();
  const [selectedTag, setSelectedTag] = useState<string | undefined>();

  // ✅ URL 파라미터에서 태그 읽기
  useEffect(() => {
    const tagFromUrl = searchParams.get('tag');
    if (tagFromUrl) {
      setSelectedTag(tagFromUrl);
    }
  }, [searchParams]);
  
  // 카테고리 목록 조회
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  });

  // ✅ 게시글 목록 조회 (검색어, 태그 필터 포함)
  const { data, isLoading, error, refetch } = usePosts(
    currentPage, 
    10, 
    sortBy, 
    selectedCategoryId,
    selectedTag,
    keyword  // ✅ 검색어 전달
  );

  // 공지사항 및 인기 게시글용 전체 조회
  const { data: allPostsData, refetch: refetchAll } = useQuery({
    queryKey: ['allPosts', selectedCategoryId],
    queryFn: async () => {
      const response = await fetch(
        `http://localhost:8080/api/posts?page=0&size=100&sort=views,desc${
          selectedCategoryId ? `&categoryId=${selectedCategoryId}` : ''
        }`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch all posts');
      const data = await response.json();
      return data;
    },
    staleTime: 0,
    gcTime: 0,
  });

  const posts = data?.posts || [];
  const totalPages = data?.totalPages || 0;
  const allPosts = allPostsData?.content || allPostsData?.posts || [];

  // 공지 태그가 있는 게시글만 필터링
  const noticePosts = allPosts
    .filter((post: any) => post.tags && post.tags.some((tag: any) => tag.name === '공지'))
    .slice(0, 5);
  
  // 인기 게시글 (조회수 + 좋아요 기준, 공지 제외)
  const trendingPosts = allPosts
    .filter((post: any) => !post.tags?.some((tag: any) => tag.name === '공지'))
    .sort((a: any, b: any) => (b.views + b.likeCount * 10) - (a.views + a.likeCount * 10))
    .slice(0, 5);

  // ✅ 공지 제외한 게시글만 표시 (검색은 백엔드에서 처리됨)
  const filteredPosts = posts.filter(post => !post.tags?.some(tag => tag.name === '공지'));

  const handlePostClick = (postId: number) => {
    navigate(`/posts/${postId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const handleRefresh = () => {
    refetch();
    refetchAll();
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(0);
  };

  const handleCategoryChange = (value: string) => {
    if (value === "all") {
      setSelectedCategoryId(undefined);
    } else {
      setSelectedCategoryId(parseInt(value));
    }
    setCurrentPage(0);
  };

  // ✅ 검색 실행
  const handleSearch = () => {
    setKeyword(searchTerm.trim());
    setCurrentPage(0);
  };

  // ✅ 검색 초기화
  const clearSearch = () => {
    setSearchTerm("");
    setKeyword("");
    setCurrentPage(0);
  };

  // ✅ 태그 클릭 핸들러
  const handleTagClick = (tagName: string) => {
    setSelectedTag(tagName);
    setSearchParams({ tag: tagName });
    setCurrentPage(0);
  };

  // ✅ 태그 필터 해제
  const clearTagFilter = () => {
    setSelectedTag(undefined);
    setSearchParams({});
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">게시글을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-8 text-center">
            <p className="text-red-600 mb-4">오류가 발생했습니다: {error.message}</p>
            <Button onClick={() => window.location.reload()}>
              다시 시도
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src={logo} alt="logo" className="w-9 h-9" />
              <h1 className="text-2xl font-bold text-gray-900">게시판</h1>
              <Badge variant="secondary">CRUD Board</Badge>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-sm text-gray-600">
                    환영합니다, {user.username}님
                  </span>
                  <Button 
                    variant="outline"
                    onClick={() => navigate("/categories/manage")}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    카테고리 관리
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={logout}
                    className="flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>로그아웃</span>
                  </Button>
                  <Button 
                    onClick={() => navigate("/posts/create")}
                    className="flex items-center space-x-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>글쓰기</span>
                  </Button>
                </>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/auth")}
                >
                  로그인
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 왼쪽: 게시글 목록 (3/4) */}
          <div className="lg:col-span-3 space-y-6">
            {/* 공지사항 영역 */}
            {noticePosts.length > 0 && (
              <Card className="border-blue-200 bg-blue-50/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Pin className="w-5 h-5 text-blue-600" />
                    <CardTitle className="text-lg">공지사항</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {noticePosts.map((post) => (
                      <div
                        key={post.id}
                        onClick={() => handlePostClick(post.id)}
                        className="flex items-center justify-between p-3 hover:bg-blue-100/50 rounded-lg cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 flex-shrink-0">
                            공지
                          </Badge>
                          <span className="font-medium truncate">{post.title}</span>
                          {post.category && (
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              {post.category.icon} {post.category.name}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500 flex-shrink-0">
                          <span>{formatDate(post.createdAt)}</span>
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>{post.views}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 검색 바 및 필터 */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                {/* ✅ 검색바 */}
                <div className="relative flex-1 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="제목 또는 내용 검색..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={handleSearch}>
                    검색
                  </Button>
                  {keyword && (
                    <Button variant="outline" onClick={clearSearch}>
                      초기화
                    </Button>
                  )}
                </div>
                
                <Select value={selectedCategoryId?.toString() || "all"} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="카테고리" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 카테고리</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        <div className="flex items-center gap-2">
                          <span>{category.icon}</span>
                          <span>{category.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt,desc">최신순</SelectItem>
                    <SelectItem value="createdAt,asc">오래된순</SelectItem>
                    <SelectItem value="views,desc">조회순</SelectItem>
                    <SelectItem value="likeCount,desc">좋아요순</SelectItem>
                  </SelectContent>
                </Select>

                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleRefresh}
                  title="새로고침"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>

              {/* ✅ 검색어 및 태그 필터 표시 */}
              {(keyword || selectedTag) && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-gray-500">필터:</span>
                  {keyword && (
                    <Badge 
                      variant="secondary"
                      className="flex items-center gap-2 px-3 py-1.5"
                    >
                      <Search className="w-3 h-3" />
                      <span>"{keyword}"</span>
                      <button
                        onClick={clearSearch}
                        className="hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedTag && (
                    <Badge 
                      variant="secondary"
                      className="flex items-center gap-2 px-3 py-1.5"
                    >
                      <span>#{selectedTag}</span>
                      <button
                        onClick={clearTagFilter}
                        className="hover:bg-gray-300 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* 게시글 목록 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {keyword
                    ? `"${keyword}" 검색 결과 (${data?.total || 0})`
                    : selectedTag 
                    ? `#${selectedTag} 게시글 (${data?.total || 0})`
                    : selectedCategoryId 
                    ? `${categories?.find(c => c.id === selectedCategoryId)?.name || '카테고리'} 게시글 (${data?.total || 0})`
                    : `전체 게시글 (${data?.total || 0})`
                  }
                </h2>
              </div>

              {filteredPosts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    {posts.length === 0 ? (
                      <div>
                        <p className="text-gray-500 mb-4">
                          {keyword ? '검색 결과가 없습니다.' : '아직 게시글이 없습니다.'}
                        </p>
                        {user && !keyword && (
                          <Button onClick={() => navigate("/posts/create")}>
                            첫 번째 게시글 작성하기
                          </Button>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500">검색 결과가 없습니다.</p>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="space-y-4">
                    {filteredPosts.map((post) => (
                      <Card 
                        key={post.id} 
                        className={`hover:shadow-md transition-shadow cursor-pointer ${
                          post.isSecret ? 'border-orange-200 bg-orange-50/30' : ''
                        }`}
                        onClick={() => handlePostClick(post.id)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-2">
                                {post.isSecret && (
                                  <Lock className="w-4 h-4 text-orange-600 flex-shrink-0" />
                                )}
                                <CardTitle className="text-lg hover:text-blue-600 transition-colors truncate">
                                  {post.title}
                                </CardTitle>
                                
                                {post.category && (
                                  <Badge 
                                    variant="outline"
                                    style={{ 
                                      backgroundColor: `${post.category.color}20`,
                                      borderColor: post.category.color,
                                      color: post.category.color
                                    }}
                                  >
                                    <span className="mr-1">{post.category.icon}</span>
                                    {post.category.name}
                                  </Badge>
                                )}
                                
                                {post.isSecret && (
                                  <Badge variant="outline" className="bg-orange-100 text-orange-700 border-orange-300">
                                    비밀글
                                  </Badge>
                                )}
                              </div>

                              {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {post.tags.map((tag) => (
                                    <Badge
                                      key={tag.id}
                                      variant="outline"
                                      className="text-xs cursor-pointer hover:bg-blue-50"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleTagClick(tag.name);
                                      }}
                                    >
                                      #{tag.name}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              
                              <CardDescription 
                                className="line-clamp-2"
                                dangerouslySetInnerHTML={{ 
                                  __html: post.content.length > 100 
                                  ? `${post.content.substring(0, 100)}...` 
                                  : post.content 
                                }}
                              />
                            </div>
                            
                            {post.attachments && post.attachments.length > 0 && 
                             post.attachments.some(att => att.contentType.startsWith('image/')) && (
                              <div className="flex-shrink-0">
                                <img 
                                  src={`http://localhost:8080/api/posts/attachments/${
                                    post.attachments.find(att => att.contentType.startsWith('image/'))?.storedFileName
                                  }`}
                                  alt="썸네일"
                                  className="w-24 h-24 object-cover rounded-lg"
                                />
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-2 flex-shrink-0">
                              <Badge variant="outline" className="flex items-center space-x-1">
                                <Eye className="w-3 h-3" />
                                <span>{post.views}</span>
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <User className="w-4 h-4" />
                                <span>{post.authorName}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(post.createdAt)}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-1">
                                <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                                <span>{post.likeCount}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MessageSquare className="w-4 h-4" />
                                <span>{post.commentCount}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* ✅ 페이지네이션 */}
                  <div className="mt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 오른쪽 사이드바 */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-red-500" />
                    <CardTitle className="text-lg">많이 본 게시글</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {trendingPosts.map((post, index) => (
                      <div
                        key={post.id}
                        onClick={() => handlePostClick(post.id)}
                        className="flex gap-3 hover:bg-gray-50 p-2 rounded-lg cursor-pointer transition-colors"
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium line-clamp-2 mb-1">{post.title}</h4>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              <span>{post.views}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              <span>{post.likeCount}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <TagCloud onTagClick={handleTagClick} />
              <AdSection />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PostListPage;