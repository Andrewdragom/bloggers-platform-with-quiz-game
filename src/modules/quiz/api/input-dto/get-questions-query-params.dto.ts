import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class GetQuestionsQueryParams {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageNumber: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize: number = 10;

  @IsOptional()
  @IsString()
  sortBy: string = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  @Transform(({ value }) => (value ? value.toLowerCase() : 'desc'))
  sortDirection: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsString()
  bodySearchTerm: string = '';

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value ? value.toLowerCase() : 'all'))
  publishedStatus: 'all' | 'published' | 'notPublished' = 'all';
}
