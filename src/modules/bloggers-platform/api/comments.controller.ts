import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
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

@Controller('comments')
export class CommentsController {
  constructor(
    @Inject(CommentsService)
    protected commentsService: CommentsService,
    @Inject(UsersService) protected usersService: UsersService,
  ) {}
  @UseGuards(JwtAuthGuardWithoutError)
  @Get(':id')
  async getComments(
    @ExtractUserFromRequest() user: UserCreateParamDecoratorContextDto,
    @Param('id') id: string,
  ) {
    const getComment = await this.commentsService.getCommentById(
      id,
      user ? user.userId : null,
    );
    return getComment;
  }
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @HttpCode(204)
  async updateComment(
    @Param('id') id: string,
    @Body() body: CreateCommentInputDto,
    @ExtractUserFromRequest() user: UserCreateParamDecoratorContextDto,
  ) {
    const getComment = await this.commentsService.getCommentById(
      id,
      user.userId,
    );
    const getUser = await this.usersService.findUserById(user.userId);
    if (getComment.commentatorInfo.userLogin != getUser.login) {
      throw new HttpException('', 403);
    }
    return this.commentsService.updateCommentById(id, body.content);
  }
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @HttpCode(204)
  async deleteComment(
    @Param('id') id: string,
    @ExtractUserFromRequest() user: UserCreateParamDecoratorContextDto,
  ) {
    const getComment = await this.commentsService.getCommentById(
      id,
      user.userId,
    );
    const getUser = await this.usersService.findUserById(user.userId);
    if (getComment.commentatorInfo.userLogin != getUser.login) {
      throw new HttpException('', 403);
    }
    return this.commentsService.deleteCommentById(id);
  }
  @UseGuards(JwtAuthGuard)
  @Put(':id/like-status')
  @HttpCode(204)
  async createLikeStatus(
    @Param('id') id: string,
    @Body() body: CreateLikeStatusInputDto,
    @ExtractUserFromRequest() user: UserCreateParamDecoratorContextDto,
  ) {
    const getComment = await this.commentsService.getCommentById(id, null);

    return this.commentsService.sendLikeStatus(
      id,
      user.userId,
      body.likeStatus,
    );
  }
}
