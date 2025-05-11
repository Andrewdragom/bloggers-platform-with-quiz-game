import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Post } from '../src/modules/bloggers-platform/domain/entities/post.entity';
import { Blog } from '../src/modules/bloggers-platform/domain/entities/blog.entity';
import { Comment } from '../src/modules/bloggers-platform/domain/entities/comment.entity';
import { User } from '../src/modules/users-account/domain/entities/user.entity';
import { Session } from '../src/modules/users-account/domain/entities/session.entity';
import { EmailConfirmation } from '../src/modules/users-account/domain/entities/emailConfirmation.entity';
import { NewPassword } from '../src/modules/users-account/domain/entities/newPassword.entity';
import { LikesForComment } from '../src/modules/bloggers-platform/domain/entities/likeForComment.entity';
import { LikeForPost } from '../src/modules/bloggers-platform/domain/entities/likeForPost.entity';
import { Question } from '../src/modules/quiz/domain/entities/question.entity';
import { Game } from '../src/modules/quiz/domain/entities/game.entity';
import { GameQuestion } from '../src/modules/quiz/domain/entities/game-question.entity';
import { Answer } from '../src/modules/quiz/domain/entities/answer.entity';

export const testOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'andrew',
  password: 'andrew',
  database: 'bloggers_platform_test',
  entities: [
    Post,
    Blog,
    Comment,
    User,
    Session,
    EmailConfirmation,
    NewPassword,
    LikesForComment,
    LikeForPost,
    Question,
    Game,
    GameQuestion,
    Answer,
  ],
  synchronize: true, // Для тестов можно включить синхронизацию
  dropSchema: true, // Очищает базу перед каждым тестом
};
