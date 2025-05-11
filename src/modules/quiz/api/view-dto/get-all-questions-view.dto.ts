export interface QuestionDto {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaginatedQuestionResponse {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: QuestionDto[];
}
