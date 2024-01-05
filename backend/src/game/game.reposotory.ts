import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Matches } from '@prisma/client';
import { GameState } from './dto/game.dto';

@Injectable()
export class GameRepository {
  constructor(private readonly prismaService: PrismaService) {
  }
  private readonly logger = new Logger(GameRepository.name);
  async updateGameData(gameData: GameState) {
    try {
      return this.prismaService.matches.update({
        where: {
          id: gameData.gameId
        },
        data: {
          p_one_score: gameData.score.pOne,
          p_two_score: gameData.score.pTwo,
          end: gameData.ended,
          status: gameData.status
        }
      })
    } catch (e) {
      this.logger.warn(`Error updating game ${gameData.gameId}`)
    }
  }
}

