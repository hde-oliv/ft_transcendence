import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { UsersRepository } from 'src/users/users.repository';
import { MatchRepository } from './match.repository';
import { ForbiddenException } from '@nestjs/common';
import { WebsocketService } from 'src/chat/websocket.service';
import { chunk } from 'lodash'
import QueueService from 'src/queue/queue.service';
import { TokenClaims } from 'src/auth/auth.model';
import { UsersService } from 'src/users/users.service';
import { CreateInviteDto } from './dto/create-invite-dto';
import { GameService } from 'src/game/game.service';
import { PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class MatchService {
  constructor(
    private readonly websocketService: WebsocketService,
    private readonly userService: UsersService,
    private readonly queueService: QueueService,
    private readonly matchRepository: MatchRepository,
    private readonly userRepository: UsersRepository,
    private readonly gameService: GameService
  ) {
    this.startQueue();
  }
  private readonly logger = new Logger(MatchService.name);
  async createInvite(userId: string, targetId: string) {
    const createInviteDto: CreateInviteDto = {
      user_id: userId,
      target_id: targetId

    }
    const targetUser = await this.userRepository.getUserById(targetId);
    if (targetUser === null)
      throw new BadRequestException(`User does not exist`);
    if (targetUser.status !== 'online') {
      throw new ForbiddenException(`User with id ${targetId} is currently ${targetUser.status}`);
    }

    const responseNewInvite = await this.matchRepository.createInvite(createInviteDto);
    this.websocketService.emitToUser(createInviteDto.target_id, 'newInvite', responseNewInvite);
    setTimeout(async () => {
      try {
        await this.matchRepository.deleteInvite(responseNewInvite.id);
      } catch (e) {
        if (e instanceof PrismaClientKnownRequestError) {
          if (e.code === 'P2025') {
            this.logger.warn(e.message);
          }
        }
      }

    }, 10000);
    return responseNewInvite;
  }

  async acceptP2P(userId: string, inviteId: string) {
    try {
      const invite = await this.matchRepository.getInviteById(inviteId)
      if (invite.target_id !== userId)
        throw new ForbiddenException();
      await this.createGame(invite.user_id, invite.target_id);
      this.queueService.removeFromQueue(invite.target_id);
      this.queueService.removeFromQueue(invite.user_id);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        this.logger.warn(e.message);
        throw new NotFoundException();
      }
      throw new InternalServerErrorException('Error in acceptP2P')
    }
  }
  private async createGame(p_one: string, p_two: string) {
    const match = await this.matchRepository.createMatch(p_one, p_two);
    this.gameService.buildGame(match.id, p_one, p_two, this.websocketService);
    this.websocketService.addUserToRoom(p_one, match.id);
    this.websocketService.addUserToRoom(p_two, match.id);
    this.websocketService.emitToRoom(match.id, 'goToGame', { gameId: match.id })
    this.gameService.startGame(match.id);
  }
  private queuedPlayers: Map<string, { joined: Date, elo: number }>
  private pendingInvites: Map<string, boolean>;
  // TODO: there might the need to implement more then one queue variable to prevent multiple functions
  // (members entering queue via http requests and queueRuntime modifying it) to RW the same variable (race condition)
  private queueTimeout: NodeJS.Timeout | null = null;
  queueRuntime() {
    if (this.queueService.queuedPlayerCount() > 1) {
      const onlinePlayers = this.websocketService.clients.map(e => e.user.intra_login);
      const queueByElo = this.queueService.queuedPlayers()
        .filter(player => onlinePlayers.includes(player.intra_login))
        .sort((pOne, pTwo) => pOne.elo - pTwo.elo);
      const pairs = chunk(queueByElo, 2);
      pairs.forEach((pair) => {
        if (pair.length === 2) {
          const issuedAt = Date.now();
          const inviteDuration = 5000;
          const expiresAt = issuedAt + inviteDuration
          const { intra_login: p_one, nickname: nickname_one } = pair[0];
          const { intra_login: p_two, nickname: nickname_two } = pair[1];
          const pOneQueueRec = this.queueService.getQueueRecord(p_one); //TODO: getQueueRecord should throw if no queue rec is found.
          const pTwoQueueRec = this.queueService.getQueueRecord(p_two);
          this.queueService.removeFromQueue(p_one);
          this.queueService.removeFromQueue(p_two);
          this.queueService.addInvite(p_one);
          this.queueService.addInvite(p_two);
          this.websocketService.emitToUser(p_one, 'matched', { to: { intra_login: p_two, nickname: nickname_two }, expiresAt });
          this.websocketService.emitToUser(p_two, 'matched', { to: { intra_login: p_one, nickname: nickname_one }, expiresAt });
          setTimeout(async () => {
            const pOneStatus = this.queueService.inviteStatus(p_one);
            const pTwoStatus = this.queueService.inviteStatus(p_two);
            this.queueService.removeInvite(p_one)
            this.queueService.removeInvite(p_two)
            if (pOneStatus && pTwoStatus) {
              this.logger.log(`Creating game for ${p_one} and ${p_two}`)
              try {
                await this.createGame(p_one, p_two);
              } catch (e) {
                this.websocketService.emitToUser(p_one, 'reQueued', { reason: 'Server failed to create match' });
                this.websocketService.emitToUser(p_two, 'reQueued', { reason: 'Server failed to create match' });
              }
            } else {
              if (pOneStatus) {
                this.websocketService.emitToUser(p_one, 'reQueued', { reason: 'Matched player failed to accept' });
                if (pOneQueueRec)
                  this.queueService.reAddToQueue(p_one, pOneQueueRec)
              } else {
                this.websocketService.emitToUser(p_one, 'deQueued', { reason: 'Matched player failed to accept' })
              }
              if (pTwoStatus) {
                this.websocketService.emitToUser(p_two, 'reQueued', { reason: 'Matched player failed to accept' });
                if (pTwoQueueRec)
                  this.queueService.reAddToQueue(p_two, pTwoQueueRec)
              } else {
                this.websocketService.emitToUser(p_two, 'deQueued', { reason: 'Matched player failed to accept' });
              }
              this.logger.log(`Could not create game for ${p_one} and ${p_two}`)
            }
          }, inviteDuration + 300);//      if they dont confirm within time (on confirmation, this timeout must be cleared!)
        }
      })
    } else if (this.queueService.queuedPlayerCount() === 0) {
      this.logger.warn(`Queue stoped (no one in queue)`);
      this.stopQueue();
    }
  }
  startQueue() {
    if (this.queueTimeout === null) {
      this.logger.log('Matchmaking queue started');
      this.queueTimeout = setInterval(() => { this.queueRuntime() }, 3000);
    }
  }
  stopQueue() {
    if (this.queueTimeout) {
      clearInterval(this.queueTimeout);
      this.queueTimeout = null;
    }
  }
  async joinQueue(user: TokenClaims) {
    try {
      const userData = await this.userService.getUser({ id: user.intra_login })
      if (userData !== null) {
        this.queueService.addToQueue({ intra_login: userData.intra_login, nickname: userData.nickname, elo: userData.elo })
        const queueRec = this.queueService.getQueueRecord(userData.intra_login);
        this.startQueue();
        return queueRec;
      }
      else
        throw new NotFoundException();
    } catch (e) {
      throw e;
    }
  }
  async leaveQueue(user: TokenClaims) {
    const userData = await this.userService.getUser({ id: user.intra_login });
    if (userData === null)
      throw new NotFoundException();
    this.queueService.removeFromQueue(userData.intra_login);
  }
  acceptQueueInvite(user: TokenClaims) {
    this.queueService.acceptQueueInvite(user.intra_login);
  }
}
