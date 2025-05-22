import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../users-account/guards/bearer/jwt-auth.guard';
import { ExtractUserFromRequest } from '../../users-account/guards/bearer/decorators/extract-user-from-request';
import { UserCreateParamDecoratorContextDto } from '../../users-account/dto/user-create-param-decorator-context.dto';
import { ConnectionGameCommand } from '../application/use-cases/game/connection-game-use-case';
import { AnswerGameDto } from './input-dto/answer-game.dto';
import { AnswerGameCommand } from '../application/use-cases/game/answer-game-use-case';
import { GameService } from '../application/game.service';
import { GetAllGamesQueryParamsDto } from './input-dto/get-all-games-query-params.dto';
import { GetTopUsersQueryParamsDto } from './input-dto/get-top-users-query-params.dto';

@Controller('pair-game-quiz')
export class QuizGameController {
  constructor(
    @Inject(CommandBus) protected commandBus: CommandBus,
    @Inject(GameService) protected gameService: GameService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('/pairs/connection')
  @HttpCode(200)
  async connectionGame(
    @ExtractUserFromRequest() user: UserCreateParamDecoratorContextDto,
  ) {
    return this.commandBus.execute(new ConnectionGameCommand(user.userId));
  }
  @UseGuards(JwtAuthGuard)
  @Post('/pairs/my-current/answers')
  @HttpCode(200)
  async answerGame(
    @ExtractUserFromRequest() user: UserCreateParamDecoratorContextDto,
    @Body() body: AnswerGameDto,
  ) {
    return this.commandBus.execute(
      new AnswerGameCommand(user.userId, String(body.answer)),
    );
  }
  @UseGuards(JwtAuthGuard)
  @Get('/pairs/my-current')
  @HttpCode(200)
  async getCurrentGame(
    @ExtractUserFromRequest() user: UserCreateParamDecoratorContextDto,
  ) {
    return this.gameService.getCurrentGame(user.userId);
  }
  @UseGuards(JwtAuthGuard)
  @Get('/pairs/my')
  @HttpCode(200)
  async getAllGames(
    @ExtractUserFromRequest() user: UserCreateParamDecoratorContextDto,
    @Query() query: GetAllGamesQueryParamsDto,
  ) {
    return this.gameService.getAllGamesForUser(
      user.userId,
      query.pageNumber,
      query.pageSize,
      query.sortBy,
      query.sortDirection,
    );
  }
  @UseGuards(JwtAuthGuard)
  @Get('/users/my-statistic')
  @HttpCode(200)
  async getMyStatistic(
    @ExtractUserFromRequest() user: UserCreateParamDecoratorContextDto,
  ) {
    return this.gameService.getStatisticForUser(user.userId);
  }
  @Get('/users/top')
  @HttpCode(200)
  async getTopUsers(@Query() query: GetTopUsersQueryParamsDto) {
    return this.gameService.getTopUsers(query);
  }
  @UseGuards(JwtAuthGuard)
  @Get('/pairs/:gameId')
  @HttpCode(200)
  async getGameById(
    @Param('gameId') gameId: string,
    @ExtractUserFromRequest() user: UserCreateParamDecoratorContextDto,
  ) {
    return this.gameService.getGameByGameId(user.userId, gameId);
  }
}
