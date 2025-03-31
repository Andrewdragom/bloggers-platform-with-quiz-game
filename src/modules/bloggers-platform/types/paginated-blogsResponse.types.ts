export interface BlogDto {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;
}

export interface PaginatedBlogsResponse {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: BlogDto[];
}
