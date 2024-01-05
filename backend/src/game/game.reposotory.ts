import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Matches, PrismaPromise } from '@prisma/client';
import { GameState } from './dto/game.dto';

@Injectable()
export class GameRepository {
  constructor(private readonly prismaService: PrismaService) {
  }
  private readonly logger = new Logger(GameRepository.name);
  async updateGameData(gameData: GameState) {
    try {
      const queries: PrismaPromise<any>[] = [];
      queries.push(this.prismaService.matches.update({
        where: {
          id: gameData.gameId
        },
        data: {
          p_one_score: gameData.score.pOne,
          p_two_score: gameData.score.pTwo,
          end: gameData.ended,
          status: gameData.status
        }
      }))
      if (['aborted', 'finished'].includes(gameData.status) && gameData.score.pOne !== gameData.score.pTwo) {
        let pOneIncrement = 0;
        let pTwoIncrement = 0;
        if (gameData.score.pOne > gameData.score.pTwo) {
          pOneIncrement = 10;
          pTwoIncrement = gameData.status === 'finished' ? -10 : -20
        } else {
          pTwoIncrement = 10;
          pOneIncrement = gameData.status === 'finished' ? -10 : -20
        }
        queries.push(this.prismaService.users.update({
          where: {
            id: gameData.playerOne.id
          },
          data: {
            elo: {
              increment: pOneIncrement
            }
          }
        }))
        queries.push(this.prismaService.users.update({
          where: {
            id: gameData.playerTwo.id
          },
          data: {
            elo: {
              increment: pTwoIncrement
            }
          }
        }))
      }
      return this.prismaService.$transaction(queries);
    } catch (e) {
      this.logger.warn(`Error updating game ${gameData.gameId}`)
    }
  }
}

