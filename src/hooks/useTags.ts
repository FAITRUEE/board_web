import { useQuery } from '@tanstack/react-query';
import * as tagService from '@/services/tagService';

// 모든 태그 조회
export const useTags = () => {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => tagService.getTags(),
  });
};

// 인기 태그 조회
export const usePopularTags = () => {
  return useQuery({
    queryKey: ['tags', 'popular'],
    queryFn: () => tagService.getPopularTags(),
  });
};

// 태그 검색
export const useSearchTags = (keyword: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['tags', 'search', keyword],
    queryFn: () => tagService.searchTags(keyword),
    enabled: enabled && keyword.length > 0,
  });
};