import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { UsersRepository } from 'src/users/users.repository';
import { ForbiddenException } from '@nestjs/common';
import { UpdateUserDto } from 'src/users/dto/update-user-dto';
import { WebsocketService } from 'src/chat/websocket.service';
import { chunk } from 'lodash'
import { SocketGateway } from 'src/chat/chat.gateway';
import QueueService from 'src/queue/queue.service';
import { TokenClaims } from 'src/auth/auth.model';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class MatchService {
  constructor(
    private readonly websocketService: WebsocketService,
    private readonly userService: UsersService,
    private readonly queueService: QueueService
  ) {
    this.startQueue();
  }
  private readonly logger = new Logger(MatchService.name);
  private queueTimeout: NodeJS.Timeout | null = null;
  queueRuntime() {
    return () => {
      if (this.queueService.queuedPlayerCount() > 1) {
        const onlinePlayers = this.websocketService.clients.map(e => e.user.intra_login);
        this.queueService.supplyOnlinePlayers(onlinePlayers);
        const queueByElo = this.queueService.queuedPlayers().sort((pOne, pTwo) => pOne.elo - pTwo.elo);
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
            this.websocketService.emitToUser(p_one, 'matched', { to: { intra_login: p_two, nickname: nickname_one }, expiresAt });
            this.websocketService.emitToUser(p_two, 'matched', { to: { intra_login: p_one, nickname: nickname_two }, expiresAt });
            setTimeout(() => {
              const pOneStatus = this.queueService.inviteStatus(p_one);
              const pTwoStatus = this.queueService.inviteStatus(p_two);
              this.queueService.removeInvite(p_one)
              this.queueService.removeInvite(p_two)
              if (pOneStatus && pTwoStatus) {
                this.logger.log(`Creating game for ${p_one} and ${p_two}`)
                //create game (match record)
                //create room for given match.id (uuid)
                //join both players in given room
                //start Game!
              } else {
                if (pOneStatus) {
                  this.websocketService.emitToUser(p_one, 'reQueued', {});
                  if (pOneQueueRec)
                    this.queueService.reAddToQueue(p_one, pOneQueueRec)
                }
                if (pTwoStatus) {
                  this.websocketService.emitToUser(p_two, 'reQueued', {});
                  if (pTwoQueueRec)
                    this.queueService.reAddToQueue(p_two, pTwoQueueRec)
                }
                this.logger.log(`Could not create game for ${p_one} and ${p_two}`)
              }
            }, inviteDuration + 1000);
            //      if they dont confirm within time (on confirmation, this timeout must be cleared!)
          }
        })
      } else if (this.queueService.queuedPlayerCount() === 0) {
        this.logger.warn(`Queue stoped (no one in queue)`);
        this.stopQueue();
      }
    }
  }
  startQueue() {
    if (this.queueTimeout === null) {
      this.logger.log('Matchmaking queue started');
      this.queueTimeout = setInterval(this.queueRuntime(), 3000);
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
}
