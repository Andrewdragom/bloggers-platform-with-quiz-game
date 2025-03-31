import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Session } from '../domain/session.schema';

@Injectable()
export class SessionRepositoryPostgres {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async saveSession(session: Session) {
    const sessionId = crypto.randomUUID();
    const result = await this.dataSource.query(
      `INSERT INTO sessions ( id ,"userId", "deviceIp", "deviceId", "deviceName", "issuedDate")
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`,
      [
        sessionId, // если буду использовать этот репозиторий надо исправить создание айди на то чтобы создавалось в сервисе
        session.userId,
        session.deviceIp,
        session.deviceId,
        session.deviceName,
        session.issuedDate,
      ],
    );

    return result[0]; // Возвращаем сохранённую сессию
  }
  async getSessionByIssuedDate(issuedDate: Date) {
    const result = await this.dataSource.query(
      `SELECT * FROM sessions WHERE "issuedDate" = $1 LIMIT 1;`,
      [new Date(issuedDate)], // Преобразуем в Date
    );

    return result.length > 0 ? result[0] : null; // Возвращаем сессию или null
  }
  async getAllSessionsByUserId(userId: string) {
    const result = await this.dataSource.query(
      `SELECT * FROM sessions WHERE "userId" = $1;`,
      [userId],
    );

    return result; // Возвращаем массив сессий
  }
  async updateSessionDate(deviceId: string, issuedDate: Date) {
    const result = await this.dataSource.query(
      `UPDATE sessions 
       SET "issuedDate" = $1 
       WHERE "deviceId" = $2;`,
      [issuedDate, deviceId],
    );

    return result.rowCount > 0; // Возвращает true, если обновление успешно
  }
  async deleteAllSessionsByDeviceId(deviceId: string) {
    const result = await this.dataSource.query(
      `DELETE FROM sessions 
       WHERE "deviceId" <> $1;`,
      [deviceId],
    );

    return result.rowCount > 0; // Возвращает true, если хотя бы одна запись была удалена
  }
  async getAllSessionsByDeviceId(deviceId: string) {
    const result = await this.dataSource.query(
      `SELECT * FROM sessions WHERE "deviceId" = $1;`,
      [deviceId],
    );

    return result.length > 0 ? result[0] : null; // Возвращает массив сессий или null
  }
  async deleteSessionsByDeviceId(deviceId: string) {
    const result = await this.dataSource.query(
      `DELETE FROM sessions WHERE "deviceId" = $1 RETURNING *;`,
      [deviceId],
    );

    return result.length > 0; // Если результат не пустой, значит сессии были удалены
  }
}
