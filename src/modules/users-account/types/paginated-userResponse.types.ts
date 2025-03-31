export interface UserDto {
  id: string;
  login: string;
  email: string;
  createdAt: Date;
}

export interface PaginatedUsersResponse {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: UserDto[];
}
