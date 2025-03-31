import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class UsersRepositoryPostgres {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async findUsers(
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    searchLoginTerm: string | null,
    searchEmailTerm: string | null,
  ) {
    const offset = (pageNumber - 1) * pageSize;

    const allUsers = await this.dataSource.query(
      `
  SELECT * FROM users
  WHERE 
      ($1::TEXT IS NULL OR login ILIKE '%' || $1::TEXT || '%')
      OR ($2::TEXT IS NULL OR email ILIKE '%' || $2::TEXT || '%')
  ORDER BY 
      CASE WHEN $3::TEXT = 'login' AND $4::TEXT = 'asc' THEN login END ASC,
      CASE WHEN $3::TEXT = 'login' AND $4::TEXT = 'desc' THEN login END DESC,
      CASE WHEN $3::TEXT = 'email' AND $4::TEXT = 'asc' THEN email END ASC,
      CASE WHEN $3::TEXT = 'email' AND $4::TEXT = 'desc' THEN email END DESC,
      CASE WHEN $3::TEXT = 'createdAt' AND $4::TEXT = 'asc' THEN "createdAt" END ASC,
      CASE WHEN $3::TEXT = 'createdAt' AND $4::TEXT = 'desc' THEN "createdAt" END DESC
  LIMIT $5 OFFSET $6;
  `,
      [
        searchLoginTerm ? searchLoginTerm : '', // Параметр 1: loginTerm (передаем как строку)
        searchEmailTerm ? searchEmailTerm : '', // Параметр 2: emailTerm (передаем как строку)
        String(sortBy), // Параметр 3: sortBy (преобразуем в строку)
        String(sortDirection), // Параметр 4: sortDirection (преобразуем в строку)
        Number(pageSize), // Параметр 5: pageSize (преобразуем в число)
        Number(offset), // Параметр 6: offset (преобразуем в число)
      ],
    );

    return allUsers;
  }

  async getUsersCount(
    searchLoginTerm: string | null,
    searchEmailTerm: string | null,
  ): Promise<number> {
    const result = await this.dataSource.query(
      `
    SELECT COUNT(*) as "totalCount"
    FROM users u
    WHERE 
      ($1::TEXT IS NULL OR u.login ILIKE '%' || $1::TEXT || '%')
      OR ($2::TEXT IS NULL OR u.email ILIKE '%' || $2::TEXT || '%')
    `,
      [
        searchLoginTerm ? String(searchLoginTerm).trim() : null, // Убираем лишние пробелы
        searchEmailTerm ? String(searchEmailTerm).trim() : null, // Убираем лишние пробелы
      ],
    );

    return parseInt(result[0].totalCount, 10);
  }

  async createNewUser(newUser: any) {
    const result = await this.dataSource.query(
      `INSERT INTO users (id, login, email, "passwordHash", "passwordSalt", "createdAt")
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *;`,
      [
        newUser.id,
        newUser.login,
        newUser.email,
        newUser.passwordHash,
        newUser.passwordSalt,
        newUser.createdAt,
      ],
    );
    if (newUser.emailConfirmation) {
      await this.dataSource.query(
        `INSERT INTO "emailConfirmation" (id, user_id, "confirmationCode", "expirationDate", "isConfirmed")
                 VALUES ($1, $2, $3, $4, $5);`,
        [
          crypto.randomUUID(), // Генерируем уникальный ID для записи
          newUser.id, // Связываем с пользователем
          newUser.emailConfirmation.confirmationCode,
          newUser.emailConfirmation.expirationDate,
          newUser.emailConfirmation.isConfirmed,
        ],
      );
    }

    return result[0];
  }
  async deleteUserByID(id: string | null): Promise<boolean> {
    if (!id) return false; // Проверяем, что ID не пустой

    const result = await this.dataSource.query(
      `DELETE FROM users WHERE id = $1 RETURNING *;`,
      [id],
    );

    return result[1] > 0; // Если удалена хотя бы 1 строка, возвращаем true
  }
  async findLoginUserForCheck(loginUser: string) {
    const result = await this.dataSource.query(
      `SELECT * FROM users WHERE login = $1 LIMIT 1;`,
      [loginUser],
    );

    return result; // Возвращаем найденного пользователя или null
  }
  async findEmailUserForCheck(email: string) {
    const result = await this.dataSource.query(
      `SELECT * FROM users WHERE email = $1 LIMIT 1;`,
      [email],
    );

    return result;
  }
  async findByLoginOrEmail(loginOrEmail: string) {
    const result = await this.dataSource.query(
      `SELECT * FROM users WHERE login = $1 OR email = $1 LIMIT 1;`,
      [loginOrEmail],
    );

    return result.length > 0 ? result[0] : null; // Возвращаем найденного пользователя или null
  }
  async findUserByID(id: string | null) {
    const findUser = await this.dataSource.query(
      `SELECT * FROM users WHERE id = $1 LIMIT 1;`,
      [id],
    );
    return findUser.length > 0 ? findUser[0] : null;
  }
  async findUserByCode(code: object) {
    const result = await this.dataSource.query(
      `SELECT 
            u.id, u.login, u.email, u."passwordHash", u."passwordSalt", u."createdAt",
            e."confirmationCode", e."expirationDate", e."isConfirmed"
         FROM users u
         INNER JOIN "emailConfirmation" e ON u.id = e.user_id
         WHERE e."confirmationCode" = $1
         LIMIT 1;`,
      [code],
    );

    if (result.length === 0) return null; // Если нет пользователя, возвращаем null

    // Формируем объект с вложенным emailConfirmation
    const user = result[0];
    console.log(user);

    return {
      id: user.id,
      login: user.login,
      email: user.email,
      passwordHash: user.passwordHash,
      passwordSalt: user.passwordSalt,
      createdAt: user.created_at,
      emailConfirmation: {
        confirmationCode: user.confirmationCode,
        expirationDate: user.expirationDate,
        isConfirmed: user.isConfirmed,
      },
    };
  }

  async updateConfirmation(userId: string) {
    const result = await this.dataSource.query(
      `UPDATE "emailConfirmation" 
         SET "isConfirmed" = true 
         WHERE user_id = $1
         RETURNING *;`,
      [userId],
    );

    return result.length > 0; // true, если обновление успешно
  }
  async findEmailUserForResendCode(email: string) {
    const result = await this.dataSource.query(
      `SELECT 
            u.id, u.login, u.email, u."passwordHash", u."passwordSalt", u."createdAt",
            e."confirmationCode", e."expirationDate", e."isConfirmed"
         FROM users u
         LEFT JOIN "emailConfirmation" e ON u.id = e.user_id
         WHERE u.email = $1
         LIMIT 1;`,
      [email],
    );
    const user = result[0];
    if (result.length === 0) return null;
    return {
      id: user.id,
      login: user.login,
      email: user.email,
      passwordHash: user.passwordHash,
      passwordSalt: user.passwordSalt,
      createdAt: user.created_at,
      emailConfirmation: {
        confirmationCode: user.confirmationCode,
        expirationDate: user.expirationDate,
        isConfirmed: user.isConfirmed,
      },
    };
  }
  async updateUserCodeForResend(userId: string, code: string) {
    const result = await this.dataSource.query(
      `INSERT INTO "emailConfirmation" ("user_id", "confirmationCode") 
     VALUES ($1, $2) 
     ON CONFLICT ("user_id") 
     DO UPDATE SET "confirmationCode" = $2;`,
      [userId, code],
    );
    // Если rowCount > 0, то запись была вставлена или обновлена
    return result.rowCount > 0;
  }

  async enterCodeForNewPassword(email: string, code: string) {
    const result = await this.dataSource.query(
      `INSERT INTO "newPassword" (user_id, "confirmationCode") 
         SELECT u.id, $1 FROM users u WHERE u.email = $2
         ON CONFLICT (user_id) 
         DO UPDATE SET "confirmationCode" = EXCLUDED."confirmationCode";`,
      [code, email],
    );

    return result.rowCount > 0; // true, если вставка/обновление успешны
  }
  async findUserByCodeForNewPassword(code: string | null) {
    const result = await this.dataSource.query(
      `SELECT u.id, u.login, u.email, u."passwordHash", u."passwordSalt", u."createdAt",
                np."confirmationCode" AS "newPasswordConfirmationCode"
         FROM users u
         INNER JOIN "newPassword" np ON u.id = np.user_id
         WHERE np."confirmationCode" = $1
         LIMIT 1;`,
      [code],
    );
    if (result.length === 0) return null; // Если пользователя нет
    // Отмапленный объект
    return {
      id: result[0].id,
      login: result[0].login,
      email: result[0].email,
      passwordHash: result[0].passwordHash,
      passwordSalt: result[0].passwordSalt,
      createdAt: result[0].created_at,
      newPassword: {
        confirmationCode: result[0].newPasswordConfirmationCode,
      },
    };
  }
  async changePassword(
    userId: string,
    passwordSalt: string,
    passwordHash: string,
  ) {
    const result = await this.dataSource.query(
      `UPDATE users 
         SET "passwordSalt" = $1, "passwordHash" = $2
         WHERE id = $3
         RETURNING id;`, // Возвращаем id обновленного пользователя
      [passwordSalt, passwordHash, userId],
    );

    return result.length > 0; // true, если обновление прошло успешно
  }
}
