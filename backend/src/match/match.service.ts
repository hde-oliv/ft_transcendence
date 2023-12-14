import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UsersRepository } from 'src/users/users.repository';
import { MatchRepository } from './match.repository';
import { ForbiddenException } from '@nestjs/common';
import { UpdateUserDto } from 'src/users/dto/update-user-dto';
import { WebsocketService } from 'src/chat/websocket.service';
import _ from 'lodash'
import { CreateInviteDto } from './dto/create-invite-dto';

@Injectable()
export class MatchService {
  constructor(
    private matchRepository: MatchRepository,
    private userRepository: UsersRepository,
    private websocketService: WebsocketService,
  ) {

  }
  destructor() {

  }
  async createInvite(userId: string, targetId: string) {
    const createInviteDto: CreateInviteDto = {
      user_id: userId,
      target_id: targetId
    }
    //console.log(targetId);
    const targetUser = await this.userRepository.getUserById(targetId);
    if (!targetUser || targetUser.status === 'offline') {
      throw new ForbiddenException(`User with id ${targetId} is not online`);
    }
    const responseNewInvite = await this.matchRepository.createInvite(createInviteDto);
    this.websocketService.emitToUser(createInviteDto.target_id,'newInvite', responseNewInvite);
    return responseNewInvite;
  }

  private queuedPlayers: Map<string, { joined: Date, elo: number }>
  private pendingInvites: Map<string, boolean>;
  // TODO: there might the need to implement more then one queue variable to prevent multiple functions
  // (members entering queue via http requests and queueRuntime modifying it) to RW the same variable (race condition)
  private queueTimeout: NodeJS.Timeout;
  queueRuntime() {
    if (this.queuedPlayers.size > 1) {
      const onlinePlayers = this.websocketService.clients.map(e => e.user.intra_login)
      const offlineQueued = Array.from(this.queuedPlayers).filter(([intra, data]) => !onlinePlayers.includes(intra));
      offlineQueued.forEach(([intra, data]) => {
        this.queuedPlayers.delete(intra)
      });
      const eloOrderedArray = Array.from(this.queuedPlayers).sort(([f_intra_tag, f_queueData], [s_intra_tag, s_queueData]) => f_queueData.elo - s_queueData.elo)
      const pairs = _.chunk(eloOrderedArray, 2);
      pairs.forEach((pair) => {
        if (pair.length === 2) {
          const issuedAt = Date.now();
          const inviteDuration = 5000;
          const expiresAt = issuedAt + inviteDuration
          const p_one = pair[0][0];
          const p_two = pair[1][0];
          this.queuedPlayers.delete(p_one);
          this.queuedPlayers.delete(p_two);
          this.pendingInvites.set(p_one, false);
          this.pendingInvites.set(p_two, false);
          this.websocketService.emitToUser(p_one, 'matched', { to: p_two, expiresAt });
          this.websocketService.emitToUser(p_two, 'matched', { to: p_one, expiresAt });
          setTimeout(() => {
            const pOneStatus = this.pendingInvites.get(p_one) === true;
            const pTwoStatus = this.pendingInvites.get(p_two) === true;
            if (pOneStatus && pTwoStatus) {
              //start Game!
            } else {
              //readd to queue
            }
            this.pendingInvites.delete(p_one);
            this.pendingInvites.delete(p_two);
          }, inviteDuration + 1000);
          //steps:
          //1:    send invites to both players
          //2:    remove them from queuedPlayers
          //3:    create timeouts (ideally in a private variable inside webSocketServive or socketGateway)
          //      that will re-add them to the queue
          //      if they dont confirm within time (on confirmation, this timeout must be cleared!)
        }
      })
    }
  }
  startQueue() {
    this.queueTimeout = setInterval(this.queueRuntime, 1000);
  }
  stopQueue() {
    clearInterval(this.queueTimeout);
  }
}
