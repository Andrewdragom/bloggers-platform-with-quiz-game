import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Answer } from '../domain/entities/answer.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AnswersRepo {
  constructor(
    @InjectRepository(Answer)
    private readonly answersRepository: Repository<Answer>,
  ) {}

  async saveAnswer(answer: any) {
    return await this.answersRepository.save(answer);
  }
}
