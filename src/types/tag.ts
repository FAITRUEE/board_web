export interface Tag {
  id: number;
  name: string;
  useCount: number;
}

export interface TagCloudItem {
  name: string;
  count: number;
  size: number;  // 폰트 크기 (useCount 기반 계산)
}