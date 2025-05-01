import {
  Inject,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { SessionRepositoryPostgres } from '../infrastructure/session.repositoryPostgres';
import { SessionRepositoryTypeOrm } from '../infrastructure/session.repositoryTypeOrm';

export class SessionService {
  constructor(
    @Inject(SessionRepositoryPostgres)
    protected sessionPostgresRepository: SessionRepositoryPostgres,
    @Inject(SessionRepositoryTypeOrm)
    protected sessionRepositoryTypeOrm: SessionRepositoryTypeOrm,
  ) {}
  async saveSession(
    userId: string,
    ip: string,
    deviceName: string,
    deviceId: string,
    issuedDate: Date,
  ) {
    const session = {
      id: crypto.randomUUID(),
      userId: userId,
      deviceIp: ip,
      deviceId: deviceId,
      deviceName: deviceName,
      issuedDate: issuedDate,
    };
    const saveSession =
      await this.sessionRepositoryTypeOrm.saveSession(session);
    return session;
  }
  async getSessionByIssuedDate(issuedDate: Date) {
    const session =
      await this.sessionRepositoryTypeOrm.getSessionByIssuedDate(issuedDate);
    if (!session) {
      throw new UnauthorizedException();
    }
    return session;
  }
  async updateSessionIssuedDate(deviceId: string, issuedDate: Date) {
    const updateDate = await this.sessionRepositoryTypeOrm.updateSessionDate(
      deviceId,
      issuedDate,
    );
    if (updateDate) return true;
    else return false;
  }
  async getAllSessionsByUserId(UserId: string) {
    const allSessions =
      await this.sessionRepositoryTypeOrm.getAllSessionsByUserId(UserId);
    if (!allSessions) throw new UnauthorizedException();
    const filterSession = allSessions.map((el) => {
      const session = {
        deviceId: el.deviceId,
        ip: el.deviceIp,
        lastActiveDate: el.issuedDate,
        title: el.deviceName,
      };
      return session;
    });
    return filterSession;
  }
  async deleteAllSessionByDeviceId(deviceId: string) {
    const result =
      await this.sessionRepositoryTypeOrm.deleteAllSessionsByDeviceId(deviceId);
    if (result) return true;
    else return false;
  }
  async getSessionByDeviceId(deviceId: string) {
    const session =
      await this.sessionRepositoryTypeOrm.getAllSessionsByDeviceId(deviceId);
    if (session) return session.userId;
    else throw new NotFoundException();
  }
  async deleteSessionByDeviceId(deviceId: string) {
    const result =
      await this.sessionRepositoryTypeOrm.deleteSessionsByDeviceId(deviceId);
    if (result) return true;
    else return false;
  }
}
