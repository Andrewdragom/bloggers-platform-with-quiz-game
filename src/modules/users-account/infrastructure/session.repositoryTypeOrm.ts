import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Session } from '../domain/entities/session.entity';

export class SessionRepositoryTypeOrm {
  constructor(
    @InjectRepository(Session) protected sessionRepository: Repository<Session>,
  ) {}

  async saveSession(session) {
    return this.sessionRepository.save(session);
  }

  async getSessionByIssuedDate(issuedDate: Date) {
    const result = await this.sessionRepository.findOneBy({
      issuedDate: new Date(issuedDate),
    });

    return result;
  }

  async updateSessionDate(deviceId: string, issuedDate: Date) {
    const queryBuilder = this.sessionRepository.createQueryBuilder('session');
    const result = await queryBuilder
      .update()
      .set({ issuedDate }) // Обновляем поле issuedDate
      .where('deviceId = :deviceId', { deviceId }) // Точное совпадение
      .execute();

    return !!result.affected;
  }
  async deleteSessionsByDeviceId(deviceId: string) {
    const result = await this.sessionRepository.delete({ deviceId });

    return !!result.affected;
  }
  async getAllSessionsByUserId(userId: string) {
    const queryBuilder = this.sessionRepository
      .createQueryBuilder('s')
      .select()
      .where('s.userId = :userId', {
        userId: userId,
      });

    const result = await queryBuilder.getMany();
    if (!result) {
      return null;
    }
    return result;
  }
  async deleteAllSessionsByDeviceId(deviceId: string) {
    const result = await this.sessionRepository.delete({
      deviceId: Not(deviceId), // Условие: deviceId не равен переданному значению
    });

    return !!result.affected;
  }
  async getAllSessionsByDeviceId(deviceId: string) {
    const queryBuilder = this.sessionRepository
      .createQueryBuilder('s')
      .select()
      .where('s.deviceId = :deviceId', {
        deviceId: deviceId,
      });

    const result = await queryBuilder.getMany();
    console.log(result);
    if (!result) {
      return null;
    }
    return result[0];
  }
}
