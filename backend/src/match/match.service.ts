import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UsersRepository } from 'src/users/users.repository';
import { ForbiddenException } from '@nestjs/common';
import { UpdateUserDto } from 'src/users/dto/update-user-dto';
import { WebsocketService } from 'src/chat/websocket.service';
import _ from 'lodash'

@Injectable()
export class MatchService {
  constructor(
    private userRepository: UsersRepository,
    private websocketService: WebsocketService
  ) {

  }
  destructor() {

  }
  private queuedPlayers: Map<string, { joined: Date, elo: number }>
  // TODO: there might the need to implement more then one queue variable to prevent multiple functions
  // (members entering queue via http requests and queueRuntime modifying it) to RW the same variable (race condition)
  private queueTimeout: NodeJS.Timeout;
  queueRuntime() {
    if (this.queuedPlayers.size > 1) {
      const eloOrderedArray = Array.from(this.queuedPlayers).sort(([f_intra_tag, f_queueData], [s_intra_tag, s_queueData]) => f_queueData.elo - s_queueData.elo)
      const pairs = _.chunk(eloOrderedArray, 2);
      pairs.forEach(pair => {
        if (pair.length === 2) {
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
