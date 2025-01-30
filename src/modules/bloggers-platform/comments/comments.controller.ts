import { Controller, Get, Inject, Param } from '@nestjs/common';
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {
  constructor(
    @Inject(CommentsService)
    protected commentsService: CommentsService,
  ) {}
  @Get(':id')
  async getComments(@Param('id') id: string) {
    // let userId;
    // if (req.headers.authorization) {
    //   const token = req.headers.authorization.split(' ')[1];
    //   userId = await jwtService.getUserIdByToken(token);
    // }

    return this.commentsService.getCommentById(
      id,
      // userId ? userId!.userId : null,
      null,
    );
  }
}
