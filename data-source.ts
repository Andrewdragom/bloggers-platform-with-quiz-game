import { DataSource } from 'typeorm';
import { Post } from './src/modules/bloggers-platform/domain/entities/post.entity';
import { Blog } from './src/modules/bloggers-platform/domain/entities/blog.entity';
import { Comment } from './src/modules/bloggers-platform/domain/entities/comment.entity';
import { User } from './src/modules/users-account/domain/entities/user.entity';
import { Session } from './src/modules/users-account/domain/entities/session.entity';
import { EmailConfirmation } from './src/modules/users-account/domain/entities/emailConfirmation.entity';
import { NewPassword } from './src/modules/users-account/domain/entities/newPassword.entity';
import { LikesForComment } from './src/modules/bloggers-platform/domain/entities/likeForComment.entity';
import { LikeForPost } from './src/modules/bloggers-platform/domain/entities/likeForPost.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'andrew',
  password: 'andrew',
  database: 'BlogPlatformFour',
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
  ],
  migrations: ['dist/src/migrations/*.js'],
  migrationsTableName: 'migrations',
  logging: true,
});
