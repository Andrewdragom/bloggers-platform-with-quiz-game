import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuardBasicAuth } from '../../users-account/guards/basic/basic-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CreateQuestionDto } from './input-dto/create-question.dto';
import { QuestionAfterCreateViewDto } from './view-dto/question-after-create-view.dto';
import { CreateQuestionCommand } from '../application/use-cases/question/create-question-use-case';
import { GetQuestionsQueryParams } from './input-dto/get-questions-query-params.dto';
import { QuestionsService } from '../application/questions.service';
import { DeleteQuestionCommand } from '../application/use-cases/question/delete-question-use-case';
import { PaginatedQuestionResponse } from './view-dto/get-all-questions-view.dto';
import { UpdateQuestionCommand } from '../application/use-cases/question/update-question-use-case';
import { UpdateQuestionDto } from './input-dto/update-question.dto';
import { PublishQuestionDto } from './input-dto/publish-question.dto';
import { PublishQuestionCommand } from '../application/use-cases/question/publish-question-use-case';

@Controller('sa/quiz/questions')
export class QuizQuestionsController {
  constructor(
    @Inject(CommandBus) protected commandBus: CommandBus,
    @Inject(QuestionsService) protected questionsService: QuestionsService,
  ) {}
  @UseGuards(AuthGuardBasicAuth)
  @Post()
  async createQuestion(
    @Body() body: CreateQuestionDto,
  ): Promise<QuestionAfterCreateViewDto> {
    return await this.commandBus.execute(new CreateQuestionCommand(body));
  }
  @UseGuards(AuthGuardBasicAuth)
  @Get()
  async getAllQuestions(
    @Query()
    query: GetQuestionsQueryParams,
  ): Promise<PaginatedQuestionResponse> {
    return this.questionsService.findQuestions(
      query.pageNumber,
      query.pageSize,
      query.sortBy,
      query.sortDirection,
      query.bodySearchTerm,
      query.publishedStatus,
    );
  }
  @UseGuards(AuthGuardBasicAuth)
  @Delete(':questionId')
  @HttpCode(204)
  async deleteQuestion(
    @Param('questionId') questionId: string,
  ): Promise<boolean> {
    return this.commandBus.execute(new DeleteQuestionCommand(questionId));
  }
  @UseGuards(AuthGuardBasicAuth)
  @Put(':id')
  @HttpCode(204)
  async updateQuestionById(
    @Param('id') id: string,
    @Body() body: UpdateQuestionDto,
  ): Promise<QuestionAfterCreateViewDto> {
    return await this.commandBus.execute(new UpdateQuestionCommand(body, id));
  }
  @UseGuards(AuthGuardBasicAuth)
  @Put(':id/publish')
  @HttpCode(204)
  async publishQuestionById(
    @Param('id') id: string,
    @Body() body: PublishQuestionDto,
  ): Promise<boolean> {
    if (!body) {
      throw new HttpException(
        [{ message: 'Publish should be', field: 'published' }],
        400,
      );
    }
    return await this.commandBus.execute(new PublishQuestionCommand(body, id));
  }
}
