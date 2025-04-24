import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from '../application/comments.service';
import { CreateCommentInputDto } from './input-dto/dto-comments/create-comment-input.dto';
import { ExtractUserFromRequest } from '../../users-account/guards/bearer/decorators/extract-user-from-request';
import { UserCreateParamDecoratorContextDto } from '../../users-account/dto/user-create-param-decorator-context.dto';
import { JwtAuthGuard } from '../../users-account/guards/bearer/jwt-auth.guard';
import { UsersService } from '../../users-account/application/users.service';
import { CreateLikeStatusInputDto } from './input-dto/dto-likes/like-status-input.dto';
import { JwtAuthGuardWithoutError } from '../../users-account/guards/bearer/jwt-auth-without-error.guard';
import { CommandBus } from '@nestjs/cqrs';
import { SendLikeStatusForCommentCommand } from '../application/use-cases/comments/send-like-status-for-comment-use-case';
import { UpdateCommentCommand } from '../application/use-cases/comments/update-comment-use-case';
import { DeleteCommentCommand } from '../application/use-cases/comments/delete-comment-use-case';

@Controller('comments')
export class CommentsController {
  constructor(
    @Inject(CommentsService)
    protected commentsService: CommentsService,
    @Inject(UsersService) protected usersService: UsersService,
    @Inject(CommandBus) protected commandBus: CommandBus,
  ) {}
  @UseGuards(JwtAuthGuardWithoutError)
  @Get(':id')
  async getCommentById(
    @ExtractUserFromRequest() user: UserCreateParamDecoratorContextDto,
    @Param('id') id: string,
  ) {
    return await this.commentsService.getCommentById(
      id,
      user ? user.userId : null,
    );
  }
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @HttpCode(204)
  async updateComment(
    @Param('id') id: string,
    @Body() body: CreateCommentInputDto,
    @ExtractUserFromRequest() user: UserCreateParamDecoratorContextDto,
  ) {
    return this.commandBus.execute(
      new UpdateCommentCommand(id, body.content, user.userId),
    );
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteComment(
    @Param('id') id: string,
    @ExtractUserFromRequest() user: UserCreateParamDecoratorContextDto,
  ) {
    return this.commandBus.execute(new DeleteCommentCommand(id, user.userId));
  }
  @UseGuards(JwtAuthGuard)
  @Put(':id/like-status')
  @HttpCode(204)
  async createLikeStatus(
    @Param('id') id: string,
    @Body() body: CreateLikeStatusInputDto,
    @ExtractUserFromRequest() user: UserCreateParamDecoratorContextDto,
  ) {
    return this.commandBus.execute(
      new SendLikeStatusForCommentCommand(id, user.userId, body.likeStatus),
    );
  }
}
