import { Inject, Injectable } from '@nestjs/common';
import { QuestionsQueryRepositoryTypeOrm } from '../infrastructure/questions.queryRepositoryTypeOrm';

@Injectable()
export class QuestionsService {
  constructor(
    @Inject(QuestionsQueryRepositoryTypeOrm)
    protected questionsQueryRepository: QuestionsQueryRepositoryTypeOrm,
  ) {}
  async findQuestions(
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    bodySearchTerm: any,
    publishedStatus: string,
  ): Promise<any> {
    const questions = await this.questionsQueryRepository.findQuestions(
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      bodySearchTerm,
      publishedStatus,
    );

    const questionsMap = questions.map((el) => {
      return {
        id: el.id,
        body: el.body,
        correctAnswers: el.correctAnswer
          .split(',')
          .map((a) => a.trim())
          .join(', ')
          .split(),
        published: el.published,
        createdAt: el.createdAt,
        updatedAt: el.updatedAt,
      };
    });
    const questionsCount =
      await this.questionsQueryRepository.getQuestionsCount(
        bodySearchTerm,
        publishedStatus,
      );
    return {
      pagesCount: Math.ceil(questionsCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount: questionsCount,
      items: questionsMap,
    };
  }
}
