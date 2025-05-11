import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from '../domain/entities/question.entity';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';

@Injectable()
export class QuestionsRepositoryTypeOrm {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
  ) {}
  async saveQuestion(question: Question) {
    return await this.questionRepository.save(question);
  }
  async deleteQuestionById(id: string | null) {
    if (!isUUID(id) || id === null) {
      throw new NotFoundException('Блог не найден');
    }
    return await this.questionRepository.delete({ id });
  }
}
